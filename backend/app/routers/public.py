from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.services.rag_service import generate_response
from app.schemas import PublicBotInfo, PublicChatRequest, PublicChatResponse
from sqlalchemy import text

router = APIRouter()


@router.get("/bots/{bot_id}", response_model=PublicBotInfo)
def get_public_bot_info(bot_id: str):
    """Return bot name/description — no auth required (used by the widget)."""
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT id, name, description FROM bots WHERE id = :id"),
            {"id": bot_id},
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Bot not found")
        return {"id": str(row[0]), "name": row[1], "description": row[2]}
    finally:
        db.close()


@router.post("/chat", response_model=PublicChatResponse)
def public_chat(request: PublicChatRequest):
    """RAG chat endpoint — no auth required. Used by the embeddable widget."""
    # Resolve bot → owner's user_id so we can query their document chunks
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

    try:
        rag_result = generate_response(request.question, owner_user_id, request.bot_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Persist conversation using a stable public identifier
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

    return {"answer": rag_result["answer"], "conversation_id": conversation_id}
