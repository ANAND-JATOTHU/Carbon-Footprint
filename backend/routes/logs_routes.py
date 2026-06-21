"""
logs_routes.py — Real-time Server-Sent Events (SSE) stream for security monitoring.

Provides a persistent SSE connection that streams security events
(auth, rate-limiting, anomaly detection) to the frontend terminal console.

Features:
    - Auto-reconnect via SSE heartbeat (every 25s)
    - Graceful cleanup on client disconnect
    - Cloud Run compatible (X-Accel-Buffering: no)
"""
import asyncio
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from broadcaster import broadcaster

logger = logging.getLogger(__name__)

router = APIRouter()


async def _event_generator(request: Request, queue: asyncio.Queue) -> AsyncGenerator[str, None]:
    """
    Yield SSE-formatted data until the client disconnects.

    Sends a heartbeat ping every 25 seconds to keep the connection
    alive through Cloud Run's idle timeout.
    """
    yield 'data: {"type":"INFO","msg":"Security console connected. Streaming live events...","ts":"00:00:00.000"}\n\n'
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                payload = await asyncio.wait_for(queue.get(), timeout=25)
                yield payload
            except asyncio.TimeoutError:
                # Heartbeat to keep connection alive
                yield 'data: {"type":"PING","msg":"Connection heartbeat","ts":"--:--:--"}\n\n'
    finally:
        broadcaster.unsubscribe(queue)
        logger.debug("SSE client disconnected. Cleaned up subscriber.")


@router.get("/stream")
async def stream_logs(request: Request) -> StreamingResponse:
    """
    Open a Server-Sent Events stream for real-time security monitoring.

    Returns:
        StreamingResponse with text/event-stream content type.
    """
    queue = broadcaster.subscribe()
    return StreamingResponse(
        _event_generator(request, queue),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
