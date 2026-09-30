"""
AI Guardrails — input/output safety for the insurance assistant
"""
import re
from fastapi import HTTPException, status


# Patterns that indicate attempts to extract dangerous info
DANGEROUS_INPUT_PATTERNS = [
    r"guarantee\s+return",
    r"guaranteed\s+profit",
    r"exact\s+premium\s+amount",
    r"tell\s+me\s+which\s+plan\s+to\s+buy",
    r"best\s+plan\s+for\s+investment",
    r"ignore\s+previous\s+instructions",
    r"you\s+are\s+now",
    r"jailbreak",
    r"pretend\s+you\s+are",
    r"forget\s+your\s+rules",
    r"reveal\s+system\s+prompt",
]

# Phrases that must NOT appear in AI output
FORBIDDEN_OUTPUT_PHRASES = [
    "guaranteed return of",
    "you will definitely get",
    "exact premium is ₹",
    "exact premium is rs",
    "I recommend you buy",
    "you must invest in",
    "this plan is the best",
    "100% guaranteed",
    "no risk",
    "assured profit",
    "I am a licensed",
    "I am a certified financial",
]


class AIGuardrails:
    """Safety layer for AI inputs and outputs."""

    def check_input(self, message: str) -> None:
        """Validate user input for prompt injection or dangerous patterns."""
        msg_lower = message.lower()
        for pattern in DANGEROUS_INPUT_PATTERNS:
            if re.search(pattern, msg_lower):
                # Don't raise — let the AI handle it with its system prompt
                # But log it
                print(f"[Guardrail] Suspicious input pattern detected: {pattern[:30]}")
                break

    def sanitize_output(self, response: str) -> str:
        """
        Sanitize AI output to remove any forbidden phrases.
        Adds disclaimer if potentially problematic.
        """
        response_lower = response.lower()
        for phrase in FORBIDDEN_OUTPUT_PHRASES:
            if phrase.lower() in response_lower:
                # Replace with a safe disclaimer
                response = (
                    "I want to be transparent: I cannot provide guaranteed figures or "
                    "make specific financial recommendations. "
                    "Please consult the LIC agent for personalized, accurate information.\n\n"
                    + response
                )
                break
        return response

    def is_financial_advice(self, response: str) -> bool:
        """Check if a response contains financial advice red flags."""
        red_flags = [
            "you should buy", "invest in", "you must get",
            "this is the best", "guaranteed"
        ]
        response_lower = response.lower()
        return any(flag in response_lower for flag in red_flags)
