"""
Chat Repository — data access for conversations and messages
"""
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, Message


class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_conversation(self, conversation_id: UUID) -> Optional[Conversation]:
        result = await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        return result.scalar_one_or_none()

    async def get_all_messages(self, conversation_id: str) -> List[Message]:
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == UUID(conversation_id))
            .order_by(Message.created_at.asc())
        )
        return result.scalars().all()

    async def get_messages_paginated(
        self, conversation_id: UUID, page: int, per_page: int
    ) -> tuple[List[Message], int]:
        offset = (page - 1) * per_page
        
        count_result = await self.db.execute(
            select(func.count()).select_from(Message)
            .where(Message.conversation_id == conversation_id)
        )
        total = count_result.scalar_one()
        
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .offset(offset)
            .limit(per_page)
        )
        messages = result.scalars().all()
        return list(reversed(messages)), total

    async def list_conversations(
        self, user_id: UUID, role: str, page: int, per_page: int
    ) -> tuple[List[Conversation], int]:
        offset = (page - 1) * per_page
        
        if role in ("AGENT", "ADMIN"):
            where_clause = True  # Agents see all
        else:
            where_clause = Conversation.customer_id == user_id
        
        count_result = await self.db.execute(
            select(func.count()).select_from(Conversation).where(where_clause)
        )
        total = count_result.scalar_one()
        
        result = await self.db.execute(
            select(Conversation)
            .where(where_clause)
            .order_by(Conversation.last_message_at.desc().nullsfirst())
            .offset(offset)
            .limit(per_page)
        )
        return result.scalars().all(), total
