"""
Chat API endpoints (REST — Socket.IO handles real-time)
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, require_agent
from app.models.user import User
from app.schemas.chat import (
    ConversationResponse, ConversationListResponse,
    MessageResponse, MessageListResponse,
)
from app.services.chat_service import ChatService
from app.services.storage_service import StorageService

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def start_conversation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new conversation (customer initiates)."""
    service = ChatService(db)
    return await service.create_conversation(customer_id=current_user.id)


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List conversations for the current user."""
    service = ChatService(db)
    return await service.list_conversations(current_user, page, per_page)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a conversation (must be participant)."""
    service = ChatService(db)
    conv = await service.get_conversation(conversation_id, current_user)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conv


@router.get("/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def get_messages(
    conversation_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get paginated message history for a conversation."""
    service = ChatService(db)
    return await service.get_messages(conversation_id, current_user, page, per_page)


@router.post("/conversations/{conversation_id}/attachments")
async def upload_attachment(
    conversation_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file attachment for a chat message."""
    storage = StorageService()
    url = await storage.upload_chat_attachment(file, str(conversation_id))
    return {"url": url, "filename": file.filename, "size": file.size}


@router.patch("/conversations/{conversation_id}/status")
async def update_conversation_status(
    conversation_id: UUID,
    new_status: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """Update conversation status (agent/admin only)."""
    service = ChatService(db)
    return await service.update_status(conversation_id, new_status)
