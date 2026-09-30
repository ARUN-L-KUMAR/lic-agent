"""
Chat Service — business logic for conversations and messages
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4
import math

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation, Message, ConversationStatus, MessageType
from app.models.user import User
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import (
    ConversationResponse, ConversationListResponse,
    MessageResponse, MessageListResponse,
)


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ChatRepository(db)

    async def create_conversation(
        self,
        customer_id: UUID,
        source: str = "CHAT",
        ai_summary: Optional[str] = None,
        customer_goal: Optional[str] = None,
    ) -> Conversation:
        """Create a new conversation."""
        conversation = Conversation(
            customer_id=customer_id,
            status=ConversationStatus.ACTIVE,
            source=source,
            ai_summary=ai_summary,
            customer_goal=customer_goal,
        )
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def get_conversation(
        self, conversation_id: UUID, current_user: User
    ) -> Optional[Conversation]:
        """Get a conversation, checking access."""
        conv = await self.repo.get_conversation(conversation_id)
        if not conv:
            return None
        # Access check: customer can only see their own
        if current_user.role.value == "CUSTOMER" and conv.customer_id != current_user.id:
            return None
        return conv

    async def list_conversations(
        self, current_user: User, page: int, per_page: int
    ) -> ConversationListResponse:
        """List conversations for the current user."""
        conversations, total = await self.repo.list_conversations(
            user_id=current_user.id,
            role=current_user.role.value,
            page=page,
            per_page=per_page,
        )
        return ConversationListResponse(
            items=conversations,
            total=total,
            page=page,
            per_page=per_page,
        )

    async def get_messages(
        self, conversation_id: UUID, current_user: User, page: int, per_page: int
    ) -> MessageListResponse:
        """Get paginated messages for a conversation."""
        conv = await self.get_conversation(conversation_id, current_user)
        if not conv:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        
        messages, total = await self.repo.get_messages_paginated(conversation_id, page, per_page)
        pages = math.ceil(total / per_page) if total > 0 else 0
        
        return MessageListResponse(
            items=messages,
            total=total,
            page=page,
            per_page=per_page,
        )

    async def create_message(
        self,
        conversation_id: str,
        sender_id: str,
        content: str,
        message_type: str = "TEXT",
        attachment_url: Optional[str] = None,
        attachment_name: Optional[str] = None,
    ) -> Optional[Message]:
        """Create and persist a new message."""
        try:
            msg_type = MessageType[message_type.upper()] if message_type else MessageType.TEXT
        except KeyError:
            msg_type = MessageType.TEXT

        message = Message(
            conversation_id=UUID(conversation_id),
            sender_id=UUID(sender_id),
            message_type=msg_type,
            content=content,
            attachment_url=attachment_url,
            attachment_name=attachment_name,
        )
        self.db.add(message)

        # Update conversation last_message_at
        conv = await self.repo.get_conversation(UUID(conversation_id))
        if conv:
            conv.last_message_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def mark_delivered(self, message_id: str) -> None:
        """Mark a message as delivered."""
        from sqlalchemy import update
        await self.db.execute(
            update(Message)
            .where(Message.id == UUID(message_id))
            .values(delivered_at=datetime.now(timezone.utc))
        )
        await self.db.commit()

    async def mark_all_read(self, conversation_id: str, reader_id: str) -> None:
        """Mark all unread messages in a conversation as read."""
        from sqlalchemy import update
        await self.db.execute(
            update(Message)
            .where(
                Message.conversation_id == UUID(conversation_id),
                Message.sender_id != UUID(reader_id),
                Message.read_at.is_(None),
            )
            .values(read_at=datetime.now(timezone.utc))
        )
        await self.db.commit()

    async def update_status(self, conversation_id: UUID, new_status: str) -> Conversation:
        """Update conversation status."""
        conv = await self.repo.get_conversation(conversation_id)
        if not conv:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        try:
            conv.status = ConversationStatus[new_status.upper()]
        except KeyError:
            pass
        await self.db.commit()
        await self.db.refresh(conv)
        return conv
