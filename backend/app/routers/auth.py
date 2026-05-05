from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.schemas import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_me(user=Depends(get_current_user)):
    return user
