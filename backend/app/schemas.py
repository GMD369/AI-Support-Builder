from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserResponse(BaseModel):
    user_id: str
    email: Optional[str] = None


class BotCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class BotUpdate(BaseModel):
    display_name: Optional[str] = None
    welcome_message: Optional[str] = None
    widget_color: Optional[str] = None


class BotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    user_id: str
    display_name: Optional[str] = None
    welcome_message: Optional[str] = None
    widget_color: Optional[str] = None


class BotListResponse(BaseModel):
    bots: List[BotResponse]


class DailyStats(BaseModel):
    date: str
    questions: int


class BotAnalytics(BaseModel):
    total_conversations: int
    total_questions: int
    daily: List[DailyStats]


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

class HistoryMessage(BaseModel):
    role: str
    content: str


class PublicBotInfo(BaseModel):
    id: str
    name: str
    description: Optional[str]
    display_name: Optional[str] = None
    welcome_message: Optional[str] = None
    widget_color: Optional[str] = None


class PublicChatRequest(BaseModel):
    question: str
    bot_id: str
    conversation_id: Optional[str] = None
    history: Optional[List[HistoryMessage]] = None


class PublicChatResponse(BaseModel):
    answer: str
    sources: List[str]
    conversation_id: str
