"""
AI Knowledge Chunk model (pgvector)
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Text, ForeignKey, func, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False
    Vector = None


class AIKnowledgeChunk(Base):
    __tablename__ = "ai_knowledge_chunks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Source reference
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False  # 'document', 'faq', 'plan', 'manual'
    )
    source_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    
    # Vector embedding (stored as JSON array)
    embedding: Mapped[Optional[list]] = mapped_column(
        JSON,
        nullable=True
    )
    
    # Metadata for retrieval
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
