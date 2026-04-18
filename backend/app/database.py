from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:qyEocuQZAoQVBdFK@db.yglymoanxcffflxftlgs.supabase.co:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)