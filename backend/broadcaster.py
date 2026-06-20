"""
broadcaster.py — Module-level SSE event broadcaster.
Publishes real security events to all connected SSE clients.
"""
import asyncio
import json
from datetime import datetime, timezone


def _now_ts() -> str:
    return datetime.now(timezone.utc).isoformat()[11:23]


class EventBroadcaster:
    """Fan-out security events to all listening SSE clients."""

    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        try:
            self._subscribers.remove(q)
        except ValueError:
            pass

    async def publish(self, event_type: str, msg: str) -> None:
        event = {"type": event_type, "msg": msg, "ts": _now_ts()}
        payload = f"data: {json.dumps(event)}\n\n"
        dead = []
        for q in self._subscribers:
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            self.unsubscribe(q)


# Singleton — import this everywhere
broadcaster = EventBroadcaster()
