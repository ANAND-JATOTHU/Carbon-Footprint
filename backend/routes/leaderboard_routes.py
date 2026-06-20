"""leaderboard_routes.py — Public leaderboard. Exposes only display_name + score."""
from fastapi import APIRouter, Depends
import aiosqlite

from database import get_db

router = APIRouter()


@router.get("")
async def get_leaderboard(db: aiosqlite.Connection = Depends(get_db)):
    """
    Returns top 50 users sorted by lowest CO₂ score.
    PRIVACY: only display_name and total_co2 are returned.
    Diet, transport, home, and email are NEVER exposed.
    """
    async with db.execute(
        """
        SELECT display_name, total_co2
        FROM users
        WHERE has_submitted = 1
        ORDER BY total_co2 ASC
        LIMIT 50
        """
    ) as cur:
        rows = await cur.fetchall()

    return [
        {
            "rank": i + 1,
            "display_name": row["display_name"],
            "total_co2": row["total_co2"],
        }
        for i, row in enumerate(rows)
    ]
