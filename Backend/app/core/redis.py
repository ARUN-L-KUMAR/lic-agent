"""
Redis connection management
"""
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

_redis_pool: Optional[aioredis.Redis] = None


async def get_redis_pool() -> aioredis.Redis:
    """Get or create the global Redis connection pool."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD or None,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50,
        )
    return _redis_pool


async def get_redis() -> aioredis.Redis:
    """FastAPI dependency: return Redis client."""
    return await get_redis_pool()


class RedisKeys:
    """Centralized Redis key definitions."""

    @staticmethod
    def user_session(user_id: str) -> str:
        return f"session:user:{user_id}"

    @staticmethod
    def rate_limit(identifier: str) -> str:
        return f"rate_limit:{identifier}"

    @staticmethod
    def plan_cache(plan_id: str) -> str:
        return f"cache:plan:{plan_id}"

    @staticmethod
    def plans_list_cache(page: int, filters_hash: str) -> str:
        return f"cache:plans:list:{page}:{filters_hash}"

    @staticmethod
    def user_online(user_id: str) -> str:
        return f"presence:online:{user_id}"

    @staticmethod
    def conversation_typing(conversation_id: str, user_id: str) -> str:
        return f"typing:{conversation_id}:{user_id}"

    @staticmethod
    def email_verification(token: str) -> str:
        return f"verify:email:{token}"

    @staticmethod
    def password_reset(token: str) -> str:
        return f"reset:password:{token}"

    @staticmethod
    def ai_context(conversation_id: str) -> str:
        return f"ai:context:{conversation_id}"

    @staticmethod
    def site_settings_cache() -> str:
        return "cache:site:settings"

    @staticmethod
    def analytics_daily(date: str) -> str:
        return f"analytics:daily:{date}"
