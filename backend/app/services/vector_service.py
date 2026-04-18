from app.database import SessionLocal
from sqlalchemy import text
from app.services.embedding_service import generate_embedding

def search_similar_chunks(query: str, user_id: str):
    db = SessionLocal()

    query_embedding = generate_embedding(query)

    result = db.execute(
        text("""
        SELECT content
        FROM document_chunks
        WHERE user_id = :user_id
        ORDER BY embedding <-> :embedding
        LIMIT 5
        """),
        {
            "user_id": user_id,
            "embedding": query_embedding
        }
    )

    return [row[0] for row in result]