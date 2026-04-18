from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/create")
def create_bot(user=Depends(get_current_user)):
    return {
        "message": "Bot created successfully",
        "user": user
    }