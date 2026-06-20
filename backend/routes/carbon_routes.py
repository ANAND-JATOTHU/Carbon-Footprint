"""carbon_routes.py — Submit carbon profile, eco-actions."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import aiosqlite

from database import get_db, calculate_co2
from auth import get_current_user_id
from broadcaster import broadcaster

router = APIRouter()

# ── Static eco-actions dictionary ────────────────────────────
ECO_ACTIONS = [
    {"id": 1,  "title": "Line-dry laundry",                "co2_reduction": 0.8,  "category": "Home"},
    {"id": 2,  "title": "Switch to public transit",         "co2_reduction": 2.1,  "category": "Transport"},
    {"id": 3,  "title": "Plant-based meal today",           "co2_reduction": 1.5,  "category": "Diet"},
    {"id": 4,  "title": "Unplug standby devices",           "co2_reduction": 0.3,  "category": "Energy"},
    {"id": 5,  "title": "Carpool to work",                  "co2_reduction": 1.2,  "category": "Transport"},
    {"id": 6,  "title": "Take a cold shower",               "co2_reduction": 0.4,  "category": "Home"},
    {"id": 7,  "title": "Skip meat for the day",            "co2_reduction": 1.5,  "category": "Diet"},
    {"id": 8,  "title": "Turn thermostat down 2°C",         "co2_reduction": 0.6,  "category": "Home"},
    {"id": 9,  "title": "Walk or cycle short trips",        "co2_reduction": 0.9,  "category": "Transport"},
    {"id": 10, "title": "Switch to LED bulbs",              "co2_reduction": 0.2,  "category": "Energy"},
]


class SubmitBody(BaseModel):
    diet: str
    transport: str
    home: str


class LogActionBody(BaseModel):
    action_id: int


def _row_to_user(row) -> dict:
    return {
        "id": row["id"],
        "display_name": row["display_name"],
        "diet": row["diet"],
        "transport": row["transport"],
        "home": row["home"],
        "total_co2": row["total_co2"],
        "has_submitted": bool(row["has_submitted"]),
    }


@router.post("/submit")
async def submit_carbon(
    body: SubmitBody,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    valid_diets = {"vegan", "vegetarian", "mixed", "high_meat"}
    valid_transport = {"public_bike", "ev", "standard_car", "suv"}
    valid_home = {"apartment", "small_house", "large_house"}

    if body.diet not in valid_diets:
        raise HTTPException(status_code=400, detail="Invalid diet option")
    if body.transport not in valid_transport:
        raise HTTPException(status_code=400, detail="Invalid transport option")
    if body.home not in valid_home:
        raise HTTPException(status_code=400, detail="Invalid home option")

    co2 = calculate_co2(body.diet, body.transport, body.home)

    await db.execute(
        "UPDATE users SET diet=?, transport=?, home=?, total_co2=?, has_submitted=1 WHERE id=?",
        (body.diet, body.transport, body.home, co2, user_id),
    )
    await db.commit()

    async with db.execute("SELECT * FROM users WHERE id=?", (user_id,)) as cur:
        row = await cur.fetchone()

    # Real security/audit event
    await broadcaster.publish(
        "ACTION",
        f"Carbon profile updated: {row['display_name']} → {co2} MTCO₂e/yr",
    )

    return _row_to_user(row)


@router.get("/actions")
async def get_actions():
    return ECO_ACTIONS


@router.post("/actions/log")
async def log_action(
    body: LogActionBody,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: aiosqlite.Connection = Depends(get_db),
):
    action = next((a for a in ECO_ACTIONS if a["id"] == body.action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    # Check if already logged today
    async with db.execute(
        "SELECT id FROM user_actions WHERE user_id=? AND action_id=? AND date(logged_at)=date('now')",
        (user_id, body.action_id),
    ) as cur:
        if await cur.fetchone():
            raise HTTPException(status_code=409, detail="Action already logged today")

    # Anomaly check: max 50kg per action (our actions are all small, but enforced)
    if action["co2_reduction"] > 50:
        await broadcaster.publish("BLOCK", f"BLOCKED: Anomaly — claimed {action['co2_reduction']}kg > 50kg threshold")
        raise HTTPException(status_code=422, detail="Anomaly detected: CO₂ reduction exceeds limit")

    uid = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO user_actions (id, user_id, action_id, co2_saved) VALUES (?, ?, ?, ?)",
        (uid, user_id, body.action_id, action["co2_reduction"]),
    )
    await db.commit()

    async with db.execute("SELECT display_name FROM users WHERE id=?", (user_id,)) as cur:
        row = await cur.fetchone()

    await broadcaster.publish(
        "ACTION",
        f"Eco-action logged: '{action['title']}' · −{action['co2_reduction']}kg · {row['display_name']}",
    )

    return {"message": "Action logged", "co2_saved": action["co2_reduction"]}
