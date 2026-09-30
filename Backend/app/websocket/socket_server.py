"""
Socket.IO server — real-time chat and presence
"""
import socketio
from datetime import datetime, timezone

from app.core.config import settings
from app.core.security import decode_access_token

# Use Redis adapter for horizontal scaling
mgr = socketio.AsyncRedisManager(settings.REDIS_URL)

sio = socketio.AsyncServer(
    client_manager=mgr,
    async_mode="asgi",
    cors_allowed_origins=settings.CORS_ORIGINS,
    logger=True,
    engineio_logger=False,
)

# Maps socket_id → user_id
connected_users: dict[str, str] = {}
# Maps user_id → socket_id (for direct messaging)
user_sockets: dict[str, str] = {}


async def authenticate_socket(auth: dict) -> str | None:
    """Authenticate socket connection via token."""
    token = auth.get("token")
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        return payload.get("sub")
    except Exception:
        return None


@sio.event
async def connect(sid: str, environ: dict, auth: dict | None = None):
    """Handle new Socket.IO connection."""
    user_id = await authenticate_socket(auth or {})
    if not user_id:
        # Allow anonymous connections for AI chat (no conversations)
        return True

    connected_users[sid] = user_id
    user_sockets[user_id] = sid

    # Broadcast online status
    await sio.emit("presence:online", {"user_id": user_id}, skip_sid=sid)

    # Mark user as online in Redis
    from app.core.redis import get_redis_pool
    redis = await get_redis_pool()
    await redis.setex(f"presence:online:{user_id}", 300, "1")

    print(f"[Socket] Connected: user={user_id} sid={sid}")


@sio.event
async def disconnect(sid: str):
    """Handle disconnection."""
    user_id = connected_users.pop(sid, None)
    if user_id:
        user_sockets.pop(user_id, None)
        await sio.emit("presence:offline", {"user_id": user_id}, skip_sid=sid)

        from app.core.redis import get_redis_pool
        redis = await get_redis_pool()
        await redis.delete(f"presence:online:{user_id}")

    print(f"[Socket] Disconnected: sid={sid}")


@sio.event
async def conversation_join(sid: str, data: dict):
    """Join a conversation room."""
    conversation_id = data.get("conversation_id")
    if not conversation_id:
        return
    room = f"conversation:{conversation_id}"
    await sio.enter_room(sid, room)
    print(f"[Socket] {sid} joined room {room}")


@sio.event
async def conversation_leave(sid: str, data: dict):
    """Leave a conversation room."""
    conversation_id = data.get("conversation_id")
    if conversation_id:
        await sio.leave_room(sid, f"conversation:{conversation_id}")


@sio.event
async def message_send(sid: str, data: dict):
    """
    Handle incoming message.
    data: {conversation_id, content, message_type, attachment_url?, attachment_name?}
    """
    from app.core.database import async_session_factory
    from app.services.chat_service import ChatService
    from app.models.user import User

    user_id = connected_users.get(sid)
    if not user_id:
        await sio.emit("error", {"message": "Not authenticated"}, to=sid)
        return

    conversation_id = data.get("conversation_id")
    content = data.get("content", "")
    message_type = data.get("message_type", "TEXT")

    async with async_session_factory() as db:
        service = ChatService(db)
        message = await service.create_message(
            conversation_id=conversation_id,
            sender_id=user_id,
            content=content,
            message_type=message_type,
            attachment_url=data.get("attachment_url"),
            attachment_name=data.get("attachment_name"),
        )

    if message:
        room = f"conversation:{conversation_id}"
        await sio.emit(
            "message:new",
            {
                "id": str(message.id),
                "conversation_id": conversation_id,
                "sender_id": user_id,
                "content": message.content,
                "message_type": message.message_type.value,
                "attachment_url": message.attachment_url,
                "attachment_name": message.attachment_name,
                "created_at": message.created_at.isoformat(),
            },
            room=room,
        )


@sio.event
async def message_delivered(sid: str, data: dict):
    """Mark message as delivered."""
    from app.core.database import async_session_factory
    from app.services.chat_service import ChatService

    message_id = data.get("message_id")
    conversation_id = data.get("conversation_id")

    async with async_session_factory() as db:
        service = ChatService(db)
        await service.mark_delivered(message_id)

    room = f"conversation:{conversation_id}"
    await sio.emit(
        "message:delivered",
        {"message_id": message_id, "delivered_at": datetime.now(timezone.utc).isoformat()},
        room=room,
    )


@sio.event
async def message_read(sid: str, data: dict):
    """Mark message(s) as read."""
    from app.core.database import async_session_factory
    from app.services.chat_service import ChatService

    conversation_id = data.get("conversation_id")
    user_id = connected_users.get(sid)

    async with async_session_factory() as db:
        service = ChatService(db)
        await service.mark_all_read(conversation_id, user_id)

    room = f"conversation:{conversation_id}"
    await sio.emit(
        "message:read",
        {"conversation_id": conversation_id, "read_by": user_id,
         "read_at": datetime.now(timezone.utc).isoformat()},
        room=room,
    )


@sio.event
async def typing_start(sid: str, data: dict):
    """Broadcast typing indicator start."""
    conversation_id = data.get("conversation_id")
    user_id = connected_users.get(sid)
    room = f"conversation:{conversation_id}"
    await sio.emit("typing:start", {"user_id": user_id}, room=room, skip_sid=sid)


@sio.event
async def typing_stop(sid: str, data: dict):
    """Broadcast typing indicator stop."""
    conversation_id = data.get("conversation_id")
    user_id = connected_users.get(sid)
    room = f"conversation:{conversation_id}"
    await sio.emit("typing:stop", {"user_id": user_id}, room=room, skip_sid=sid)
