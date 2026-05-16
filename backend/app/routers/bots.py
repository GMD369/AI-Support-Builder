from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database import SessionLocal
from app.schemas import BotCreate, BotUpdate, BotResponse, BotListResponse, BotAnalytics, LeadListResponse
from sqlalchemy import text

router = APIRouter()


def _row_to_bot(row) -> dict:
    return {
        "id": str(row[0]),
        "name": row[1],
        "description": row[2],
        "created_at": row[3],
        "user_id": row[4],
        "display_name": row[5],
        "welcome_message": row[6],
        "widget_color": row[7],
        "lead_capture_enabled": row[8] or False,
    }


@router.post("/", response_model=BotResponse)
def create_bot(bot: BotCreate, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            INSERT INTO bots (user_id, name, description)
            VALUES (:user_id, :name, :description)
            RETURNING id, name, description, created_at, user_id,
                      display_name, welcome_message, widget_color, lead_capture_enabled
            """),
            {"user_id": user["user_id"], "name": bot.name, "description": bot.description or ""},
        )
        db.commit()
        return _row_to_bot(result.fetchone())
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/", response_model=BotListResponse)
def list_bots(user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            SELECT id, name, description, created_at, user_id,
                   display_name, welcome_message, widget_color, lead_capture_enabled
            FROM bots WHERE user_id = :user_id ORDER BY created_at DESC
            """),
            {"user_id": user["user_id"]},
        )
        return {"bots": [_row_to_bot(row) for row in result]}
    finally:
        db.close()


@router.get("/{bot_id}/analytics", response_model=BotAnalytics)
def get_bot_analytics(bot_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        if not db.execute(
            text("SELECT id FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        ).fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")

        totals = db.execute(
            text("""
            SELECT
                COUNT(DISTINCT c.id) AS total_conversations,
                COUNT(CASE WHEN m.role = 'user' THEN 1 END) AS total_questions
            FROM conversations c
            LEFT JOIN messages m ON m.conversation_id = c.id
            WHERE c.bot_id = :bot_id
            """),
            {"bot_id": bot_id},
        ).fetchone()

        daily_rows = db.execute(
            text("""
            SELECT DATE(m.created_at) AS day, COUNT(*) AS questions
            FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.bot_id = :bot_id AND m.role = 'user'
              AND m.created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(m.created_at)
            ORDER BY day
            """),
            {"bot_id": bot_id},
        )

        return {
            "total_conversations": totals[0] or 0,
            "total_questions": totals[1] or 0,
            "daily": [{"date": str(row[0]), "questions": row[1]} for row in daily_rows],
        }
    finally:
        db.close()


@router.get("/{bot_id}/leads", response_model=LeadListResponse)
def get_bot_leads(bot_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        if not db.execute(
            text("SELECT id FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        ).fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")

        rows = db.execute(
            text("""
            SELECT id, bot_id, name, email, created_at
            FROM leads WHERE bot_id = :bot_id ORDER BY created_at DESC
            """),
            {"bot_id": bot_id},
        )
        return {
            "leads": [
                {"id": str(r[0]), "bot_id": str(r[1]), "name": r[2], "email": r[3], "created_at": r[4]}
                for r in rows
            ]
        }
    finally:
        db.close()


@router.get("/{bot_id}", response_model=BotResponse)
def get_bot(bot_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            SELECT id, name, description, created_at, user_id,
                   display_name, welcome_message, widget_color, lead_capture_enabled
            FROM bots WHERE id = :id AND user_id = :user_id
            """),
            {"id": bot_id, "user_id": user["user_id"]},
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Bot not found")
        return _row_to_bot(row)
    finally:
        db.close()


@router.patch("/{bot_id}", response_model=BotResponse)
def update_bot(bot_id: str, updates: BotUpdate, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        if not db.execute(
            text("SELECT id FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        ).fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")

        fields = {k: v for k, v in updates.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        set_clause = ", ".join(f"{k} = :{k}" for k in fields)
        fields["id"] = bot_id
        fields["user_id"] = user["user_id"]

        result = db.execute(
            text(f"""
            UPDATE bots SET {set_clause}
            WHERE id = :id AND user_id = :user_id
            RETURNING id, name, description, created_at, user_id,
                      display_name, welcome_message, widget_color, lead_capture_enabled
            """),
            fields,
        )
        db.commit()
        return _row_to_bot(result.fetchone())
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.delete("/{bot_id}")
def delete_bot(bot_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        if not db.execute(
            text("SELECT id FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        ).fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")

        db.execute(
            text("DELETE FROM document_chunks WHERE bot_id = :bot_id AND user_id = :user_id"),
            {"bot_id": bot_id, "user_id": user["user_id"]},
        )
        db.execute(
            text("DELETE FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        )
        db.commit()
        return {"message": "Bot and all associated documents deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
