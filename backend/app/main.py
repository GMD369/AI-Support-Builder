from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import bots, documents, chat, auth, conversations, public

app = FastAPI(title="AI Support Builder API", version="1.0.0")

# Allow all origins — Bearer-token auth is not CORS-credential-based.
# Tighten to specific domains before going to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(bots.router, prefix="/bots", tags=["Bots"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
app.include_router(public.router, prefix="/public", tags=["Public"])


@app.get("/")
def root():
    return {"message": "AI Support Builder API Running"}
