"""
LIC Agent Platform - FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

import socketio
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # noqa: F401 ensure all models are registered
from app.core.logging import configure_logging
from app.core.redis import get_redis_pool
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_logging import RequestLoggingMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.websocket.socket_server import sio

configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    logger.info("Starting LIC Agent Platform API", env=settings.APP_ENV)

    # Initialize Redis connection pool
    redis_pool = await get_redis_pool()
    app.state.redis = redis_pool

    # Create upload directory if using local storage
    if settings.STORAGE_BACKEND == "local":
        import os
        os.makedirs(settings.STORAGE_LOCAL_PATH, exist_ok=True)

    # Ensure database tables exist
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # create_all never alters existing tables; add columns introduced after first setup.
            await conn.execute(text("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(1024)"))
    except Exception as e:
        logger.warning("Could not auto-create database tables on startup", error=str(e))

    logger.info("Application startup complete")
    yield

    # Cleanup
    if hasattr(app.state, "redis"):
        await app.state.redis.aclose()
    logger.info("Application shutdown complete")


def create_application() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="LIC Agent Platform API",
        description=(
            "Production API for LIC Agent Business Platform. "
            "Handles insurance plans, customers, leads, appointments, "
            "real-time chat, and AI assistant."
        ),
        version="1.0.0",
        docs_url="/docs" if settings.APP_DEBUG else None,
        redoc_url="/redoc" if settings.APP_DEBUG else None,
        openapi_url="/openapi.json" if settings.APP_DEBUG else None,
        lifespan=lifespan,
    )

    # ── Middleware (order matters) ──────────────────────────
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Total-Count", "X-Page", "X-Per-Page"],
    )

    # ── API Routes ──────────────────────────────────────────
    app.include_router(api_router, prefix="/api/v1")

    # ── Static Files (uploads) ──────────────────────────────
    if settings.STORAGE_BACKEND == "local":
        import os
        os.makedirs(settings.STORAGE_LOCAL_PATH, exist_ok=True)
        app.mount(
            "/uploads",
            StaticFiles(directory=settings.STORAGE_LOCAL_PATH),
            name="uploads",
        )

    # ── Socket.IO ASGI Mount ────────────────────────────────
    # Wrap with socketio's ASGI app
    return app


# Create the FastAPI app
fastapi_app = create_application()

# Create Socket.IO ASGI app that wraps FastAPI
# This allows both REST and WebSocket on the same port
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=fastapi_app,
    socketio_path="/socket.io",
)

# The main ASGI app to serve
app = socket_app


# ── Health Endpoints ────────────────────────────────────────
@fastapi_app.get("/health", tags=["Health"])
async def health():
    """Basic health check."""
    return {"status": "ok", "service": "lic-agent-platform-api"}


@fastapi_app.get("/ready", tags=["Health"])
async def ready():
    """Readiness check - verifies DB and Redis connectivity."""
    from app.core.database import async_session_factory
    from app.core.redis import get_redis_pool
    checks = {}
    try:
        async with async_session_factory() as session:
            await session.execute(__import__("sqlalchemy").text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"

    try:
        pool = await get_redis_pool()
        await pool.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"

    all_ok = all(v == "ok" for v in checks.values())
    return JSONResponse(
        content={"status": "ready" if all_ok else "degraded", "checks": checks},
        status_code=200 if all_ok else 503,
    )
