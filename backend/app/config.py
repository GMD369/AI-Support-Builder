import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ALGORITHM = "HS256"