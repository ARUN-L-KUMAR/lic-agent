"""
LLM Agent — provider abstraction layer
Supports: OpenAI, Google Gemini, Anthropic Claude
"""
from typing import Optional
from app.core.config import settings


class LLMAgent:
    """
    Provider-agnostic LLM completion agent.
    Switch providers via AI_PROVIDER env variable.
    """

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.model = settings.AI_MODEL
        self.api_key = settings.AI_API_KEY
        self.max_tokens = settings.AI_MAX_TOKENS
        self.temperature = settings.AI_TEMPERATURE

    async def complete(self, prompt: str) -> str:
        """Generate a completion for the given prompt."""
        if not self.api_key:
            return self._fallback_response()

        try:
            if self.provider == "openai":
                return await self._openai_complete(prompt)
            elif self.provider == "gemini":
                return await self._gemini_complete(prompt)
            elif self.provider == "anthropic":
                return await self._anthropic_complete(prompt)
            else:
                return self._fallback_response()
        except Exception as e:
            print(f"[AI] LLM error ({self.provider}): {e}")
            return self._fallback_response()

    async def _openai_complete(self, prompt: str) -> str:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=self.api_key)
        response = await client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
        )
        return response.choices[0].message.content or ""

    async def _gemini_complete(self, prompt: str) -> str:
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        model_name = self.model or "gemini-2.5-flash"
        model = genai.GenerativeModel(model_name)
        response = await model.generate_content_async(prompt)
        return response.text or ""

    async def _anthropic_complete(self, prompt: str) -> str:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=self.api_key)
        message = await client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text if message.content else ""

    def _fallback_response(self) -> str:
        return (
            "I'm currently unable to process your query. "
            "Please contact the LIC agent directly for assistance. "
            "You can use the 'Talk to Agent' button to connect with a human advisor."
        )

    async def get_embedding(self, text: str) -> list[float]:
        """Generate embeddings for RAG retrieval."""
        if not self.api_key:
            return []
        try:
            if self.provider == "gemini":
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                embed_model = settings.AI_EMBEDDING_MODEL or "models/gemini-embedding-001"
                if not embed_model.startswith("models/"):
                    embed_model = f"models/{embed_model}"
                response = await genai.embed_content_async(
                    model=embed_model,
                    content=text,
                )
                return response.get("embedding", [])
            elif self.provider == "openai":
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=self.api_key)
                response = await client.embeddings.create(
                    model=settings.AI_EMBEDDING_MODEL,
                    input=text,
                )
                return response.data[0].embedding
        except Exception as e:
            print(f"[AI] Embedding error: {e}")
        return []
