from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database import SessionLocal
from app.schemas import BotCreate, BotResponse, BotListResponse
from sqlalchemy import text

router = APIRouter()


@router.post("/", response_model=BotResponse)
def create_bot(bot: BotCreate, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            INSERT INTO bots (user_id, name, description)
            VALUES (:user_id, :name, :description)
            RETURNING id, name, description, created_at, user_id
            """),
            {
                "user_id": user["user_id"],
                "name": bot.name,
                "description": bot.description or "",
            },
        )
        db.commit()
        row = result.fetchone()
        return {
            "id": str(row[0]),
            "name": row[1],
            "description": row[2],
            "created_at": row[3],
            "user_id": row[4],
        }
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
            SELECT id, name, description, created_at, user_id
            FROM bots
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            """),
            {"user_id": user["user_id"]},
        )
        bots = [
            {
                "id": str(row[0]),
                "name": row[1],
                "description": row[2],
                "created_at": row[3],
                "user_id": row[4],
            }
            for row in result
        ]
        return {"bots": bots}
    finally:
        db.close()


@router.get("/{bot_id}", response_model=BotResponse)
def get_bot(bot_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            SELECT id, name, description, created_at, user_id
            FROM bots
            WHERE id = :id AND user_id = :user_id
            """),
            {"id": bot_id, "user_id": user["user_id"]},
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Bot not found")
        return {
            "id": str(row[0]),
            "name": row[1],
            "description": row[2],
            "created_at": row[3],
            "user_id": row[4],
        }
    finally:
        db.close()


@router.delete("/{bot_id}")
def delete_bot(bot_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT id FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        )
        if not result.fetchone():
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
