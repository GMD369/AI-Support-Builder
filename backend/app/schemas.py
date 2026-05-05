from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserResponse(BaseModel):
    user_id: str
    email: Optional[str] = None


class BotCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class BotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    user_id: str


class BotListResponse(BaseModel):
    bots: List[BotResponse]


class ChatRequest(BaseModel):
    question: str
    bot_id: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    question: str
    answer: str
    sources: List[str]
    conversation_id: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class ConversationResponse(BaseModel):
    id: str
    bot_id: str
    title: str
    created_at: datetime
    messages: Optional[List[MessageResponse]] = None


class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]


class DocumentUploadResponse(BaseModel):
    message: str
    filename: str
    chunks_created: int


class DocumentInfo(BaseModel):
    id: str
    filename: str
    bot_id: str
    chunk_count: int
    created_at: datetime


class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]


# ── Public (widget) schemas ──────────────────────────────────────────────────

class PublicBotInfo(BaseModel):
    id: str
    name: str
    description: Optional[str]


class PublicChatRequest(BaseModel):
    question: str
    bot_id: str
    conversation_id: Optional[str] = None


class PublicChatResponse(BaseModel):
    answer: str
    conversation_id: str
