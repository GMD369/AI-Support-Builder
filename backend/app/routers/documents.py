from fastapi import APIRouter, Depends, UploadFile
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile, user=Depends(get_current_user)):
    return {
        "filename": file.filename,
        "uploaded_by": user
    }