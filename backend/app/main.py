from fastapi import FastAPI
from app.routers import bots, documents, chat

app = FastAPI()

app.include_router(bots.router, prefix="/bots", tags=["Bots"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def root():
    return {"message": "API Running Securely"}