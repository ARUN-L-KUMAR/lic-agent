"""
AI Prompt Templates — safe, fact-grounded insurance assistant prompts
"""
from typing import List, Optional


SYSTEM_PROMPT = """You are an AI insurance information assistant for a licensed LIC (Life Insurance Corporation of India) agent.

STRICT RULES:
1. Only answer using the provided context from verified knowledge sources.
2. NEVER fabricate premium values, guaranteed returns, or policy benefits.
3. NEVER claim to be a licensed financial advisor.
4. NEVER tell users which specific financial product they MUST buy.
5. NEVER make legal or tax claims without verified sources.
6. If information is not in the provided context, say: "I don't have verified information for that. Please consult the LIC agent directly."
7. Always encourage users to consult the LIC agent for personalized advice.
8. Be helpful, clear, and professional.
9. When discussing plans, explain features — do not guarantee outcomes.
10. Add appropriate qualifiers: "generally", "typically", "subject to policy terms", etc.

IDENTITY:
You are an informational AI assistant for an individual LIC agent's website. You are NOT the official LIC helpline.

DISCLAIMER TO INCLUDE:
Always remind users that information is for general understanding only, and they should refer to official LIC policy documents and consult the agent before making decisions.
"""

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond in English.",
    "ta": "Respond in Tamil (தமிழ்). Keep insurance terms bilingual if needed.",
}


def build_chat_prompt(
    user_message: str,
    history: List[dict],
    retrieved_docs: List[dict],
    language: str = "en",
) -> str:
    """Build a safe, context-grounded chat prompt."""
    context_str = "\n\n".join(
        f"[SOURCE: {doc.get('source_type', 'knowledge base')}]\n{doc.get('content', '')}"
        for doc in retrieved_docs
    ) if retrieved_docs else "No specific knowledge base results found for this query."

    history_str = "\n".join(
        f"{turn['role'].upper()}: {turn['content']}"
        for turn in history[-10:]
    ) if history else ""

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])

    return f"""{SYSTEM_PROMPT}

LANGUAGE: {lang_instruction}

KNOWLEDGE BASE CONTEXT:
{context_str}

CONVERSATION HISTORY:
{history_str}

USER: {user_message}

ASSISTANT (respond based only on the context provided above, be helpful but honest about limitations):"""


def build_recommendation_prompt(payload) -> str:
    """Build a prompt for plan category suggestions (NOT specific recommendations)."""
    goals = getattr(payload, 'goals', [])
    age = getattr(payload, 'age', None)
    income_range = getattr(payload, 'income_range', None)
    dependents = getattr(payload, 'dependents', None)

    return f"""{SYSTEM_PROMPT}

Based on the following customer profile, suggest ONLY relevant LIC insurance CATEGORIES (not specific plans).
Do NOT guarantee suitability. Do NOT provide specific premium figures.
Only suggest categories from: Protection, Savings, Endowment, Money Back, Whole Life, Pension, Child Plans, ULIP, Health.

Customer Profile:
- Goals: {', '.join(goals) if goals else 'Not specified'}
- Age: {age or 'Not specified'}
- Income Range: {income_range or 'Not specified'}
- Dependents: {dependents or 'Not specified'}

Suggest 2-4 relevant categories with a brief explanation of why each category might be worth exploring.
Remind the user to consult the agent for personalized advice.
"""


def build_document_qa_prompt(question: str, context: str) -> str:
    """Build a prompt for document Q&A."""
    return f"""{SYSTEM_PROMPT}

The user has a question about an insurance document.
Answer ONLY using the document content provided below.
If the answer is not in the document, say so clearly.

DOCUMENT CONTENT:
{context}

QUESTION: {question}

ANSWER (based only on the document above):"""
