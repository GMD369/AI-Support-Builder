from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.services.vector_service import search_similar_chunks

router = APIRouter()

@router.post("/")
def chat(question: str, user=Depends(get_current_user)):
    chunks = search_similar_chunks(question, user["user_id"])

    return {
        "question": question,
        "retrieved_context": chunks,
        "response": "LLM will generate answer here"
    }