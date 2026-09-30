"""
RAG Retriever — search over knowledge base, insurance plans, and FAQs
"""
from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_knowledge import AIKnowledgeChunk
from app.models.plan import Plan, PlanStatus
from app.models.faq import FAQ


class RAGRetriever:
    """
    Retrieves relevant knowledge chunks for a given query.
    Falls back gracefully to database search over Knowledge chunks, Plans, and FAQs.
    """

    def __init__(self, db: Optional[AsyncSession]):
        self.db = db

    async def retrieve(self, query: str, top_k: int = 5) -> List[dict]:
        """Retrieve top-k relevant knowledge chunks for a query."""
        if not self.db:
            return []

        return await self._keyword_search(query, top_k)

    async def _keyword_search(self, query: str, top_k: int) -> List[dict]:
        """Search knowledge chunks, plans, and FAQs for matching context."""
        results: List[dict] = []
        words = [w.strip() for w in query.split() if len(w.strip()) > 3]

        # 1. Search Knowledge Chunks
        try:
            if words:
                conditions = [AIKnowledgeChunk.content.ilike(f"%{w}%") for w in words[:3]]
                stmt = select(AIKnowledgeChunk).where(or_(*conditions)).limit(top_k)
                res = await self.db.execute(stmt)
                chunks = res.scalars().all()
                for chunk in chunks:
                    results.append({
                        "id": str(chunk.id),
                        "content": chunk.content,
                        "source_type": chunk.source_type,
                        "source_id": chunk.source_id,
                        "title": (chunk.metadata_ or {}).get("title", "Knowledge Base"),
                    })
        except Exception:
            try:
                await self.db.rollback()
            except Exception:
                pass

        # 2. Search Insurance Plans
        try:
            plan_conditions = []
            for w in (words[:3] if words else [query.strip()]):
                plan_conditions.append(Plan.name.ilike(f"%{w}%"))
                plan_conditions.append(Plan.plan_code.ilike(f"%{w}%"))
                plan_conditions.append(Plan.short_description.ilike(f"%{w}%"))

            stmt = select(Plan).where(
                Plan.status == PlanStatus.PUBLISHED,
                or_(*plan_conditions)
            ).limit(top_k)
            res = await self.db.execute(stmt)
            plans = res.scalars().all()
            for p in plans:
                cat_name = p.category.value if hasattr(p.category, 'value') else str(p.category)
                content = (
                    f"Plan: {p.name} (Code: {p.plan_code}, Category: {cat_name}). "
                    f"Summary: {p.short_description or ''}. "
                    f"Age: {p.minimum_entry_age or 'N/A'} to {p.maximum_entry_age or 'N/A'} years. "
                    f"Term: {p.minimum_term or 'N/A'} to {p.maximum_term or 'N/A'} years. "
                    f"Maturity Benefits: {p.maturity_benefits or ''}. Death Benefits: {p.death_benefits or ''}. "
                    f"Tax Benefits: {p.tax_benefits or ''}."
                )
                results.append({
                    "id": str(p.id),
                    "content": content,
                    "source_type": "plan",
                    "source_id": p.plan_code,
                    "title": p.name,
                })
        except Exception:
            try:
                await self.db.rollback()
            except Exception:
                pass

        # 3. Search FAQs
        try:
            faq_conditions = [FAQ.question.ilike(f"%{w}%") for w in words[:3]] if words else []
            if faq_conditions:
                stmt = select(FAQ).where(or_(*faq_conditions)).limit(3)
                res = await self.db.execute(stmt)
                faqs = res.scalars().all()
                for f in faqs:
                    results.append({
                        "id": str(f.id),
                        "content": f"Q: {f.question}\nA: {f.answer}",
                        "source_type": "faq",
                        "source_id": str(f.id),
                        "title": f.question,
                    })
        except Exception:
            try:
                await self.db.rollback()
            except Exception:
                pass

        return results[:top_k]

    async def ingest_text(
        self,
        content: str,
        source_type: str,
        source_id: Optional[str],
        metadata: Optional[dict] = None,
        chunk_size: int = 800,
        overlap: int = 100,
    ) -> List[str]:
        """
        Chunk and embed text for the knowledge base.
        Returns list of chunk IDs created.
        """
        chunks = self._chunk_text(content, chunk_size, overlap)
        chunk_ids = []

        from app.ai.agent import LLMAgent
        import hashlib
        agent = LLMAgent()

        for i, chunk_text in enumerate(chunks):
            content_hash = hashlib.sha256(chunk_text.encode()).hexdigest()
            embedding = await agent.get_embedding(chunk_text)

            chunk = AIKnowledgeChunk(
                source_type=source_type,
                source_id=source_id,
                content=chunk_text,
                content_hash=content_hash,
                chunk_index=i,
                embedding=embedding if embedding else None,
                metadata_=metadata or {},
            )
            self.db.add(chunk)
            chunk_ids.append(str(chunk.id))

        await self.db.commit()
        return chunk_ids

    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """Split text into overlapping chunks."""
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            if end == len(words):
                break
            start += chunk_size - overlap
        return chunks
