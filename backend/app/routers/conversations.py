from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database import SessionLocal
from app.schemas import ConversationResponse, ConversationListResponse, MessageResponse
from sqlalchemy import text
from typing import Optional

router = APIRouter()


@router.get("/", response_model=ConversationListResponse)
def list_conversations(bot_id: Optional[str] = None, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        if bot_id:
            result = db.execute(
                text("""
                SELECT id, bot_id, title, created_at
                FROM conversations
                WHERE user_id = :user_id AND bot_id = :bot_id
                ORDER BY created_at DESC
                """),
                {"user_id": user["user_id"], "bot_id": bot_id},
            )
        else:
            result = db.execute(
                text("""
                SELECT id, bot_id, title, created_at
                FROM conversations
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                """),
                {"user_id": user["user_id"]},
            )
        conversations = [
            {
                "id": str(row[0]),
                "bot_id": str(row[1]),
                "title": row[2],
                "created_at": row[3],
            }
            for row in result
        ]
        return {"conversations": conversations}
    finally:
        db.close()


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        conv_result = db.execute(
            text("""
            SELECT id, bot_id, title, created_at
            FROM conversations
            WHERE id = :id AND user_id = :user_id
            """),
            {"id": conversation_id, "user_id": user["user_id"]},
        )
        conv = conv_result.fetchone()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        msg_result = db.execute(
            text("""
            SELECT id, role, content, created_at
            FROM messages
            WHERE conversation_id = :conv_id
            ORDER BY created_at ASC
            """),
            {"conv_id": conversation_id},
        )
        messages = [
            {
                "id": str(row[0]),
                "role": row[1],
                "content": row[2],
                "created_at": row[3],
            }
            for row in msg_result
        ]
        return {
            "id": str(conv[0]),
            "bot_id": str(conv[1]),
            "title": conv[2],
            "created_at": conv[3],
            "messages": messages,
        }
    finally:
        db.close()


@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT id FROM conversations WHERE id = :id AND user_id = :user_id"),
            {"id": conversation_id, "user_id": user["user_id"]},
        )
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Conversation not found")

        db.execute(
            text("DELETE FROM conversations WHERE id = :id"),
            {"id": conversation_id},
        )
        db.commit()
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
