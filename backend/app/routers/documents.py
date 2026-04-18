from fastapi import APIRouter, UploadFile, Depends
from app.auth.dependencies import get_current_user
from app.services.embedding_service import generate_embedding
from app.services.chunking import chunk_text
from app.database import SessionLocal
from sqlalchemy import text

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile, user=Depends(get_current_user)):
    content = await file.read()
    text_data = content.decode("utf-8")

    chunks = chunk_text(text_data)

    db = SessionLocal()

    for chunk in chunks:
        embedding = generate_embedding(chunk)

        db.execute(
            text("""
            INSERT INTO document_chunks (user_id, bot_id, content, embedding)
            VALUES (:user_id, :bot_id, :content, :embedding)
            """),
            {
                "user_id": user["user_id"],
                "bot_id": "default",
                "content": chunk,
                "embedding": embedding
            }
        )

    db.commit()

    return {"message": "Document processed successfully"}