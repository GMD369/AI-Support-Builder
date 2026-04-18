from fastapi import Request, HTTPException
from jose import jwt, JWTError
from app.config import SUPABASE_JWT_SECRET, ALGORITHM

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = auth_header.split(" ")[1]

        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM])

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {
            "user_id": user_id,
            "email": email
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")