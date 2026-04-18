from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/")
def chat(question: str, user=Depends(get_current_user)):
    return {
        "question": question,
        "response": "AI response will come here",
        "user": user
    }