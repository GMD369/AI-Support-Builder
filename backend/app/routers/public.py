from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.services.rag_service import generate_response
from app.schemas import PublicBotInfo, PublicChatRequest, PublicChatResponse
from sqlalchemy import text

router = APIRouter()


@router.get("/bots/{bot_id}", response_model=PublicBotInfo)
def get_public_bot_info(bot_id: str):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            SELECT id, name, description, display_name, welcome_message, widget_color
            FROM bots WHERE id = :id
            """),
            {"id": bot_id},
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Bot not found")
        return {
            "id": str(row[0]),
            "name": row[1],
            "description": row[2],
            "display_name": row[3],
            "welcome_message": row[4],
            "widget_color": row[5],
        }
    finally:
        db.close()


@router.post("/chat", response_model=PublicChatResponse)
def public_chat(request: PublicChatRequest):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT user_id FROM bots WHERE id = :id"),
            {"id": request.bot_id},
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Bot not found")
        owner_user_id = row[0]
    finally:
        db.close()

    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]

    try:
        rag_result = generate_response(request.question, owner_user_id, request.bot_id, history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    public_user_id = f"public::{request.bot_id}"
    db = SessionLocal()
    try:
        conversation_id = request.conversation_id
        if not conversation_id:
            title = request.question[:60] + ("..." if len(request.question) > 60 else "")
            conv_result = db.execute(
                text("""
                INSERT INTO conversations (user_id, bot_id, title)
                VALUES (:user_id, :bot_id, :title)
                RETURNING id
                """),
                {"user_id": public_user_id, "bot_id": request.bot_id, "title": title},
            )
            conversation_id = str(conv_result.fetchone()[0])
            db.commit()

        db.execute(
            text("INSERT INTO messages (conversation_id, role, content) VALUES (:cid, 'user', :content)"),
            {"cid": conversation_id, "content": request.question},
        )
        db.execute(
            text("INSERT INTO messages (conversation_id, role, content) VALUES (:cid, 'assistant', :content)"),
            {"cid": conversation_id, "content": rag_result["answer"]},
        )
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    return {
        "answer": rag_result["answer"],
        "sources": rag_result["sources"],
        "conversation_id": conversation_id,
    }
