"""
leaderboard_routes.py — Public leaderboard endpoint.

Returns the top 50 users ranked by lowest CO₂ emissions.
Privacy: Only display_name and total_co2 are exposed.
"""
import logging
from typing import Any

from fastapi import APIRouter, Depends
from google.cloud.firestore_v1.async_client import AsyncClient

from database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("")
async def get_leaderboard(
    db: AsyncClient = Depends(get_db),
) -> list[dict[str, Any]]:
    """
    Returns the top 50 users sorted by lowest CO₂ score.

    Privacy: Only display_name and total_co2 are returned.
    Diet, transport, home, and email are NEVER exposed.
    """
    users_ref = db.collection("users")
    docs = users_ref.stream()

    leaderboard: list[dict[str, Any]] = []
    async for doc in docs:
        data = doc.to_dict()
        if data.get("has_submitted") == 1:
            leaderboard.append({
                "display_name": data.get("display_name"),
                "total_co2": data.get("total_co2", 0),
            })

    # Sort in-memory to avoid requiring a Firestore composite index
    leaderboard.sort(key=lambda x: x["total_co2"])

    # Add rank and limit to top 50
    ranked: list[dict[str, Any]] = []
    for i, user in enumerate(leaderboard[:50]):
        user["rank"] = i + 1
        ranked.append(user)

    logger.info("Leaderboard served: %d users ranked.", len(ranked))
    return ranked
