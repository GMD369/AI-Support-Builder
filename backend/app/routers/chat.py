from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.services.rag_service import generate_response

router = APIRouter()

@router.post("/")
def chat(question: str, user=Depends(get_current_user)):
    result = generate_response(question, user["user_id"])

    return {
        "question": question,
        "answer": result["answer"],
        "sources": result["context"]
    }