"""
broadcaster.py — Server-Sent Events (SSE) broadcaster for real-time security monitoring.

Implements a fan-out pub/sub pattern where security events are published
to all connected SSE clients. Handles automatic cleanup of dead subscribers.

Usage:
    from broadcaster import broadcaster
    await broadcaster.publish("AUTH", "User login detected from IP 1.2.3.4")
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


def _now_ts() -> str:
    """Return current UTC time as HH:MM:SS.mmm string for SSE timestamps."""
    return datetime.now(timezone.utc).isoformat()[11:23]


class EventBroadcaster:
    """
    Fan-out security events to all listening SSE clients.

    Subscribers receive events as SSE-formatted strings via asyncio.Queue.
    Dead subscribers (full queues) are automatically cleaned up.
    """

    def __init__(self, max_queue_size: int = 100) -> None:
        self._subscribers: list[asyncio.Queue] = []
        self._max_queue_size = max_queue_size

    @property
    def subscriber_count(self) -> int:
        """Return the number of active SSE subscribers."""
        return len(self._subscribers)

    def subscribe(self) -> asyncio.Queue:
        """Create and register a new subscriber queue."""
        queue: asyncio.Queue = asyncio.Queue(maxsize=self._max_queue_size)
        self._subscribers.append(queue)
        logger.debug("SSE subscriber added. Total: %d", self.subscriber_count)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        """Remove a subscriber queue (safe to call if already removed)."""
        try:
            self._subscribers.remove(queue)
            logger.debug("SSE subscriber removed. Total: %d", self.subscriber_count)
        except ValueError:
            pass

    async def publish(self, event_type: str, msg: str) -> None:
        """
        Broadcast an event to all subscribers.

        Args:
            event_type: Category of the event (e.g. 'AUTH', 'RATE', 'ACTION', 'BLOCK').
            msg: Human-readable event description.
        """
        event = {"type": event_type, "msg": msg, "ts": _now_ts()}
        payload = f"data: {json.dumps(event)}\n\n"

        dead_queues: list[asyncio.Queue] = []
        for queue in self._subscribers:
            try:
                queue.put_nowait(payload)
            except asyncio.QueueFull:
                dead_queues.append(queue)

        for queue in dead_queues:
            self.unsubscribe(queue)


# Singleton — import this everywhere
broadcaster = EventBroadcaster()
