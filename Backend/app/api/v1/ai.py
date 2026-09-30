"""
AI Assistant API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest, AIChatResponse,
    AIHandoffRequest, AIHandoffResponse,
    AIRecommendationRequest, AIRecommendationResponse,
)
from app.services.ai_service import AIService

router = APIRouter()

AI_DISCLAIMER = (
    "AI-generated information is for general informational purposes only. "
    "Please consult the LIC agent and official policy documents before making decisions. "
    "This AI assistant is not a licensed financial advisor."
)


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    payload: AIChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Chat with the AI insurance assistant.
    
    The AI uses RAG to answer from verified knowledge sources only.
    It will never fabricate premium values, guaranteed returns, or policy benefits.
    """
    service = AIService(db)
    response = await service.chat(
        session_id=payload.session_id,
        message=payload.message,
        language=payload.language or "en",
    )
    response.disclaimer = AI_DISCLAIMER
    return response


@router.post("/handoff", response_model=AIHandoffResponse)
async def ai_to_human_handoff(
    payload: AIHandoffRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Transfer AI conversation to a human agent.
    Creates a conversation with the AI summary attached.
    """
    service = AIService(db)
    return await service.handoff_to_agent(
        session_id=payload.session_id,
        customer_id=current_user.id,
        customer_goal=payload.customer_goal,
    )


@router.post("/recommend", response_model=AIRecommendationResponse)
async def get_ai_recommendations(
    payload: AIRecommendationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Get AI-suggested plan categories based on customer profile.
    Returns plan categories, NOT specific recommendations (no financial advice).
    """
    service = AIService(db)
    result = await service.suggest_plan_categories(payload)
    result.disclaimer = AI_DISCLAIMER
    return result


@router.post("/summarize/{conversation_id}")
async def summarize_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Summarize an AI or chat conversation (agent/admin)."""
    from app.api.deps import require_agent
    service = AIService(db)
    summary = await service.summarize_conversation(conversation_id)
    return {"summary": summary, "disclaimer": AI_DISCLAIMER}
