"""logs_routes.py — Real-time SSE stream of security events."""
import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from broadcaster import broadcaster

router = APIRouter()


async def _event_generator(request: Request, queue: asyncio.Queue):
    """Yield SSE data until client disconnects."""
    # Send initial connection event
    yield 'data: {"type":"INFO","msg":"Security console connected. Streaming live events...","ts":"00:00:00.000"}\n\n'
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                payload = await asyncio.wait_for(queue.get(), timeout=25)
                yield payload
            except asyncio.TimeoutError:
                # Heartbeat to keep connection alive through Cloud Run timeout
                yield 'data: {"type":"PING","msg":"Connection heartbeat","ts":"--:--:--"}\n\n'
    finally:
        broadcaster.unsubscribe(queue)


@router.get("/stream")
async def stream_logs(request: Request):
    queue = broadcaster.subscribe()
    return StreamingResponse(
        _event_generator(request, queue),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",   # disable nginx buffering
        },
    )
