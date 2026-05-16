from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.services.rag_service import generate_response
from app.database import SessionLocal
from app.schemas import ChatRequest, ChatResponse
from sqlalchemy import text

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, user=Depends(get_current_user)):
    db = SessionLocal()
    try:
        # Verify bot belongs to user
        bot_result = db.execute(
            text("SELECT id, name FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": request.bot_id, "user_id": user["user_id"]},
        )
        bot = bot_result.fetchone()
        if not bot:
            raise HTTPException(status_code=404, detail="Bot not found")

        # Get or create conversation
        conversation_id = request.conversation_id
        if conversation_id:
            conv_result = db.execute(
                text("SELECT id FROM conversations WHERE id = :id AND user_id = :user_id"),
                {"id": conversation_id, "user_id": user["user_id"]},
            )
            if not conv_result.fetchone():
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            # Create new conversation, use first 60 chars of question as title
            title = request.question[:60] + ("..." if len(request.question) > 60 else "")
            conv_result = db.execute(
                text("""
                INSERT INTO conversations (user_id, bot_id, title)
                VALUES (:user_id, :bot_id, :title)
                RETURNING id
                """),
                {"user_id": user["user_id"], "bot_id": request.bot_id, "title": title},
            )
            conversation_id = str(conv_result.fetchone()[0])
            db.commit()

        # Generate RAG response
        try:
            result = generate_response(request.question, user["user_id"], request.bot_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

        # Persist user message and assistant reply
        db.execute(
            text("""
            INSERT INTO messages (conversation_id, role, content)
            VALUES (:conv_id, 'user', :content)
            """),
            {"conv_id": conversation_id, "content": request.question},
        )
        db.execute(
            text("""
            INSERT INTO messages (conversation_id, role, content)
            VALUES (:conv_id, 'assistant', :content)
            """),
            {"conv_id": conversation_id, "content": result["answer"]},
        )
        db.commit()

        return {
            "question": request.question,
            "answer": result["answer"],
            "sources": result["sources"],
            "conversation_id": conversation_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
