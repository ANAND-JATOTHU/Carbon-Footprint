"""leaderboard_routes.py — Public leaderboard. Exposes only display_name + score."""
from fastapi import APIRouter, Depends
from google.cloud.firestore_v1.async_client import AsyncClient

from database import get_db

router = APIRouter()


@router.get("")
async def get_leaderboard(db: AsyncClient = Depends(get_db)):
    """
    Returns top 50 users sorted by lowest CO₂ score.
    PRIVACY: only display_name and total_co2 are returned.
    Diet, transport, home, and email are NEVER exposed.
    """
    users_ref = db.collection("users")
    # Note: Firestore requires a composite index for filtering on has_submitted and ordering by total_co2
    # If the index is missing, Firestore will return an error with a link to create it.
    query = users_ref.where("has_submitted", "==", 1).order_by("total_co2", direction="ASCENDING").limit(50)
    
    docs = query.stream()
    leaderboard = []
    rank = 1
    async for doc in docs:
        data = doc.to_dict()
        leaderboard.append({
            "rank": rank,
            "display_name": data.get("display_name"),
            "total_co2": data.get("total_co2", 0),
        })
        rank += 1

    return leaderboard
