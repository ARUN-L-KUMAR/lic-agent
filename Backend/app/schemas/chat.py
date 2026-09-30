"""
Chat Schemas — Pydantic v2
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: Optional[UUID]
    message_type: str
    content: Optional[str]
    attachment_url: Optional[str]
    attachment_name: Optional[str]
    created_at: datetime
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: UUID
    customer_id: UUID
    agent_id: Optional[UUID]
    status: str
    source: str
    ai_summary: Optional[str]
    customer_goal: Optional[str]
    customer_unread: int
    agent_unread: int
    last_message_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    last_message: Optional[MessageResponse] = None

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    items: List[ConversationResponse]
    total: int
    page: int
    per_page: int


class MessageListResponse(BaseModel):
    items: List[MessageResponse]
    total: int
    page: int
    per_page: int
