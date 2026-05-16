from app.database import SessionLocal
from sqlalchemy import text
from app.services.embedding_service import generate_embedding


def search_similar_chunks(query: str, user_id: str, bot_id: str = "default") -> list[dict]:
    query_embedding = generate_embedding(query)

    db = SessionLocal()
    try:
        result = db.execute(
            text("""
            SELECT content, filename
            FROM document_chunks
            WHERE user_id = :user_id AND bot_id = :bot_id
            ORDER BY embedding <-> :embedding
            LIMIT 5
            """),
            {
                "user_id": user_id,
                "bot_id": bot_id,
                "embedding": str(query_embedding),
            },
        )
        return [{"content": row[0], "filename": row[1]} for row in result]
    finally:
        db.close()
