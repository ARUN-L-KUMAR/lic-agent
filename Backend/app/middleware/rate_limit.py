"""
Rate limiting middleware using slowapi / Redis.
Falls back to in-memory if Redis is unavailable.
"""
import time
from collections import defaultdict
from typing import Callable, Optional

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

# In-memory fallback store: ip → list of timestamps
_request_times: dict[str, list[float]] = defaultdict(list)

RATE_LIMIT_WINDOW = 60  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple sliding window rate limiter."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = self._get_client_ip(request)
        path = request.url.path

        # Stricter limit for auth endpoints
        if "/auth/login" in path or "/auth/register" in path:
            limit = settings.AUTH_RATE_LIMIT_PER_MINUTE
        else:
            limit = settings.RATE_LIMIT_PER_MINUTE

        try:
            allowed = await self._check_rate_limit_redis(client_ip, path, limit)
        except Exception:
            allowed = self._check_rate_limit_memory(client_ip, limit)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please wait before trying again.",
                    "retry_after": RATE_LIMIT_WINDOW,
                },
                headers={"Retry-After": str(RATE_LIMIT_WINDOW)},
            )

        response = await call_next(request)
        return response

    def _get_client_ip(self, request: Request) -> str:
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def _check_rate_limit_redis(self, ip: str, path: str, limit: int) -> bool:
        from app.core.redis import get_redis_pool
        redis = await get_redis_pool()
        key = f"rl:{ip}:{path[:30]}"
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, RATE_LIMIT_WINDOW)
        return current <= limit

    def _check_rate_limit_memory(self, ip: str, limit: int) -> bool:
        now = time.time()
        timestamps = _request_times[ip]
        # Keep only timestamps within window
        timestamps[:] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        if len(timestamps) >= limit:
            return False
        timestamps.append(now)
        return True
