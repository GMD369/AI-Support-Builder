import os
from dotenv import load_dotenv

# Load .env from the same directory as this file (backend/app/.env)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_JWT_SECRET")  # service_role key used as apikey
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://yglymoanxcffflxftlgs.supabase.co")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")