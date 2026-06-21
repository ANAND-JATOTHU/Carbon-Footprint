"""leaderboard_routes.py — Public leaderboard. Exposes only display_name + score."""
from fastapi import APIRouter, Depends
from google.cloud.firestore_v1.async_client import AsyncClient

from database import get_db

router = APIRouter()


@router.get("")
async def get_leaderboard(db: AsyncClient = Depends(get_db)):
    """
    Returns top 50 users sorted by lowest CO₂ score.
    """
    users_ref = db.collection("users")
    docs = users_ref.stream()
    
    leaderboard = []
    async for doc in docs:
        data = doc.to_dict()
        if data.get("has_submitted") == 1:
            leaderboard.append({
                "display_name": data.get("display_name"),
                "total_co2": data.get("total_co2", 0),
            })
            
    # Sort in memory to avoid needing a Firestore composite index
    leaderboard.sort(key=lambda x: x["total_co2"])
    
    top50 = []
    for i, user in enumerate(leaderboard[:50]):
        user["rank"] = i + 1
        top50.append(user)

    return top50
