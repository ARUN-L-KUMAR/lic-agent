"""
AI Service — RAG-based insurance assistant
"""
import json
import uuid
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval import RAGRetriever
from app.ai.prompts import build_chat_prompt, build_recommendation_prompt
from app.ai.guardrails import AIGuardrails
from app.ai.agent import LLMAgent
from app.core.config import settings
from app.core.redis import get_redis_pool, RedisKeys
from app.schemas.ai import (
    AIChatRequest, AIChatResponse, AISuggestion,
    AIRecommendationRequest, AIRecommendationResponse,
    AIHandoffRequest, AIHandoffResponse,
)


_in_memory_chat_context: dict[str, list] = {}


class AIService:
    def __init__(self, db: Optional[AsyncSession]):
        self.db = db
        self.retriever = RAGRetriever(db)
        self.guardrails = AIGuardrails()
        self.agent = LLMAgent()

    async def _get_history(self, session_id: str) -> list:
        try:
            redis = await get_redis_pool()
            context_key = RedisKeys.ai_context(session_id)
            history_raw = await redis.get(context_key)
            return json.loads(history_raw) if history_raw else []
        except Exception:
            return _in_memory_chat_context.get(session_id, [])

    async def _save_history(self, session_id: str, history: list) -> None:
        _in_memory_chat_context[session_id] = history
        try:
            redis = await get_redis_pool()
            context_key = RedisKeys.ai_context(session_id)
            await redis.setex(context_key, 3600, json.dumps(history))
        except Exception:
            pass

    async def chat(
        self,
        session_id: str,
        message: str,
        language: str = "en",
    ) -> AIChatResponse:
        """
        Process an AI chat message using RAG.
        
        1. Load conversation history from Redis (or memory fallback)
        2. Retrieve relevant knowledge chunks
        3. Build safe prompt with guardrails
        4. Generate LLM response
        5. Validate response safety
        6. Save to Redis context
        """
        # 1. Load conversation history
        history = await self._get_history(session_id)

        # 2. Retrieve relevant context via RAG
        docs = await self.retriever.retrieve(message, top_k=5)

        # 3. Check guardrails on input
        self.guardrails.check_input(message)

        # 4. Build prompt
        prompt = build_chat_prompt(
            user_message=message,
            history=history,
            retrieved_docs=docs,
            language=language,
        )

        # 5. Generate response
        response_text = await self.agent.complete(prompt)

        # 6. Validate safety on output
        safe_response = self.guardrails.sanitize_output(response_text)

        # 7. Update history (keep last 20 turns)
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": safe_response})
        history = history[-20:]
        await self._save_history(session_id, history)

        # 8. Build citations
        sources = [
            {"title": doc.get("title", "Source"), "source_type": doc.get("source_type")}
            for doc in docs[:3]
        ]

        return AIChatResponse(
            session_id=session_id,
            message=safe_response,
            sources=sources,
            suggestions=self._generate_suggestions(message),
            disclaimer="",  # Set by the endpoint
        )

    async def handoff_to_agent(
        self,
        session_id: str,
        customer_id: UUID,
        customer_goal: Optional[str],
    ) -> AIHandoffResponse:
        """Transfer AI session to human agent, creating a conversation."""
        from app.services.chat_service import ChatService

        # Get AI conversation summary
        history = await self._get_history(session_id)

        summary = await self.summarize_ai_history(history)

        # Create real conversation
        if self.db:
            chat_service = ChatService(self.db)
            conversation = await chat_service.create_conversation(
                customer_id=customer_id,
                source="AI_HANDOFF",
                ai_summary=summary,
                customer_goal=customer_goal,
            )
            return AIHandoffResponse(
                conversation_id=str(conversation.id),
                summary=summary,
                message="You've been connected to an agent. They can see your previous conversation.",
            )

        return AIHandoffResponse(
            conversation_id="",
            summary=summary,
            message="Please contact the agent directly.",
        )

    async def suggest_plan_categories(
        self,
        payload: AIRecommendationRequest,
    ) -> AIRecommendationResponse:
        """Suggest plan categories based on user goals (NOT specific plans)."""
        prompt = build_recommendation_prompt(payload)
        response = await self.agent.complete(prompt)
        return AIRecommendationResponse(
            categories=self._parse_categories(response),
            reasoning=response,
            disclaimer="",
        )

    async def summarize_conversation(self, conversation_id: str) -> str:
        """Generate a summary of a human chat conversation."""
        if not self.db:
            return "Summary unavailable"
        from app.repositories.chat_repository import ChatRepository
        repo = ChatRepository(self.db)
        messages = await repo.get_all_messages(conversation_id)
        if not messages:
            return "No messages to summarize"
        history = [
            {"role": "user" if str(m.sender_id) != "agent" else "agent", "content": m.content}
            for m in messages if m.content
        ]
        return await self.summarize_ai_history(history)

    async def summarize_ai_history(self, history: list) -> str:
        """Summarize a conversation history."""
        if not history:
            return "No conversation history"
        prompt = (
            "Summarize the following insurance consultation conversation in 3-5 sentences. "
            "Include: customer's main goal, plans or topics discussed, questions raised. "
            "Be factual and concise.\n\n"
            + "\n".join(f"{h['role'].upper()}: {h['content']}" for h in history[-10:])
        )
        return await self.agent.complete(prompt)

    def _generate_suggestions(self, message: str) -> list:
        """Generate follow-up question suggestions."""
        return [
            AISuggestion(text="Which plan is suitable for child education?"),
            AISuggestion(text="Explain term insurance in simple terms."),
            AISuggestion(text="What documents are needed for a policy?"),
            AISuggestion(text="Talk to an agent"),
        ]

    def _parse_categories(self, text: str) -> list:
        """Parse category suggestions from LLM response."""
        categories = []
        for cat in ["Protection", "Savings", "Child Plans", "Pension", "ULIP", "Health", "Endowment"]:
            if cat.lower() in text.lower():
                categories.append(cat)
        return categories or ["Protection", "Savings"]
