import urllib.request
import urllib.error
import json
from fastapi import Request, HTTPException
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY


def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or " " not in auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = auth_header.split(" ", 1)[1]

    try:
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_SERVICE_KEY,
            },
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            user_data = json.loads(response.read().decode())

        user_id = user_data.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {
            "user_id": user_id,
            "email": user_data.get("email"),
        }

    except urllib.error.HTTPError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")
