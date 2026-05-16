from fastapi import APIRouter, UploadFile, Depends, HTTPException, Query
from typing import Optional
from app.auth.dependencies import get_current_user
from app.services.embedding_service import generate_embedding
from app.services.chunking import chunk_text
from app.services.file_parser import extract_text
from app.database import SessionLocal
from app.schemas import DocumentUploadResponse, DocumentListResponse
from sqlalchemy import text

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

router = APIRouter()


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile,
    bot_id: str = Query(..., description="ID of the bot this document belongs to"),
    user=Depends(get_current_user),
):
    # Verify bot belongs to user
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT id FROM bots WHERE id = :id AND user_id = :user_id"),
            {"id": bot_id, "user_id": user["user_id"]},
        )
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Bot not found")
    finally:
        db.close()

    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded file")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB.")

    filename = file.filename or "unknown"
    text_data = extract_text(filename, content)

    if not text_data.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    chunks = chunk_text(text_data)

    db = SessionLocal()
    try:
        for chunk in chunks:
            embedding = generate_embedding(chunk)
            db.execute(
                text("""
                INSERT INTO document_chunks (user_id, bot_id, content, embedding, filename)
                VALUES (:user_id, :bot_id, :content, :embedding, :filename)
                """),
                {
                    "user_id": user["user_id"],
                    "bot_id": bot_id,
                    "content": chunk,
                    "embedding": str(embedding),
                    "filename": filename,
                },
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store document: {str(e)}")
    finally:
        db.close()

    return {
        "message": "Document processed successfully",
        "filename": filename,
        "chunks_created": len(chunks),
    }


@router.get("/", response_model=DocumentListResponse)
def list_documents(
    bot_id: Optional[str] = Query(None, description="Filter by bot ID"),
    user=Depends(get_current_user),
):
    db = SessionLocal()
    try:
        if bot_id:
            result = db.execute(
                text("""
                SELECT filename, bot_id, COUNT(*) as chunk_count,
                       MIN(created_at) as created_at, MIN(id::text) as doc_id
                FROM document_chunks
                WHERE user_id = :user_id AND bot_id = :bot_id
                GROUP BY filename, bot_id
                ORDER BY MIN(created_at) DESC
                """),
                {"user_id": user["user_id"], "bot_id": bot_id},
            )
        else:
            result = db.execute(
                text("""
                SELECT filename, bot_id, COUNT(*) as chunk_count,
                       MIN(created_at) as created_at, MIN(id::text) as doc_id
                FROM document_chunks
                WHERE user_id = :user_id
                GROUP BY filename, bot_id
                ORDER BY MIN(created_at) DESC
                """),
                {"user_id": user["user_id"]},
            )
        documents = [
            {
                "id": row[4],
                "filename": row[0],
                "bot_id": row[1],
                "chunk_count": row[2],
                "created_at": row[3],
            }
            for row in result
        ]
        return {"documents": documents}
    finally:
        db.close()


@router.delete("/")
def delete_document(
    filename: str = Query(..., description="Filename to delete"),
    bot_id: str = Query(..., description="Bot ID the document belongs to"),
    user=Depends(get_current_user),
):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            DELETE FROM document_chunks
            WHERE user_id = :user_id AND bot_id = :bot_id AND filename = :filename
            RETURNING id
            """),
            {"user_id": user["user_id"], "bot_id": bot_id, "filename": filename},
        )
        deleted = result.fetchall()
        if not deleted:
            raise HTTPException(status_code=404, detail="Document not found")
        db.commit()
        return {"message": f"Document deleted ({len(deleted)} chunks removed)"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
