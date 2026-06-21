"""
carbon_routes.py — Carbon footprint tracking, eco-actions, and custom task management.

Endpoints:
    POST /submit         - Submit/update carbon profile
    GET  /tasks          - List user's logged tasks
    POST /tasks          - Log a custom eco-task
    DELETE /tasks/{id}   - Delete a custom eco-task
    GET  /actions        - List available eco-actions
    POST /actions/log/{id} - Log a predefined eco-action
"""
import uuid
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from google.cloud.firestore_v1.async_client import AsyncClient
from datetime import datetime, timezone

from database import get_db, calculate_co2
from auth import get_current_user_id
from broadcaster import broadcaster

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Valid Input Options ──────────────────────────────────────
VALID_DIETS: set[str] = {"vegan", "vegetarian", "mixed", "high_meat"}
VALID_TRANSPORT: set[str] = {"public_bike", "ev", "standard_car", "suv"}
VALID_HOME: set[str] = {"apartment", "small_house", "large_house"}
VALID_CATEGORIES: set[str] = {"Home", "Transport", "Diet", "Energy"}

# Maximum CO₂ reduction allowed per task (anti-cheat threshold)
MAX_CO2_PER_TASK: float = 50.0

# ── Static Eco Actions ───────────────────────────────────────
ECO_ACTIONS: list[dict[str, Any]] = [
    {"id": "diet_vegan", "title": "Ate a fully vegan meal", "category": "Diet", "co2_reduction": 1.5},
    {"id": "diet_local", "title": "Bought locally sourced groceries", "category": "Diet", "co2_reduction": 0.8},
    {"id": "trans_bike", "title": "Commuted by bike instead of car", "category": "Transport", "co2_reduction": 2.4},
    {"id": "trans_transit", "title": "Used public transportation", "category": "Transport", "co2_reduction": 1.8},
    {"id": "home_led", "title": "Upgraded to LED lighting", "category": "Home", "co2_reduction": 0.5},
    {"id": "energy_cold", "title": "Washed laundry in cold water", "category": "Energy", "co2_reduction": 0.6},
    {"id": "energy_solar", "title": "Installed solar panels", "category": "Energy", "co2_reduction": 15.0},
    {"id": "home_compost", "title": "Started composting food waste", "category": "Home", "co2_reduction": 0.9},
]


# ── Request/Response Models ──────────────────────────────────

class SubmitBody(BaseModel):
    """Request body for submitting a carbon profile."""
    diet: str = Field(..., description="Diet type: vegan, vegetarian, mixed, high_meat")
    transport: str = Field(..., description="Transport type: public_bike, ev, standard_car, suv")
    home: str = Field(..., description="Home type: apartment, small_house, large_house")

    @field_validator("diet")
    @classmethod
    def validate_diet(cls, v: str) -> str:
        if v not in VALID_DIETS:
            raise ValueError(f"Invalid diet. Must be one of: {', '.join(sorted(VALID_DIETS))}")
        return v

    @field_validator("transport")
    @classmethod
    def validate_transport(cls, v: str) -> str:
        if v not in VALID_TRANSPORT:
            raise ValueError(f"Invalid transport. Must be one of: {', '.join(sorted(VALID_TRANSPORT))}")
        return v

    @field_validator("home")
    @classmethod
    def validate_home(cls, v: str) -> str:
        if v not in VALID_HOME:
            raise ValueError(f"Invalid home. Must be one of: {', '.join(sorted(VALID_HOME))}")
        return v


class CreateTaskBody(BaseModel):
    """Request body for creating a custom eco-task."""
    title: str = Field(..., min_length=1, max_length=200, description="Task description")
    category: str = Field(..., description="Category: Home, Transport, Diet, Energy")
    co2_saved: float = Field(..., gt=0, le=MAX_CO2_PER_TASK, description="CO₂ saved in kg")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return v

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, v: str) -> str:
        """Strip whitespace and limit to safe characters."""
        return v.strip()


# ── Helper ───────────────────────────────────────────────────

def _doc_to_user(doc: Any) -> dict[str, Any]:
    """Convert a Firestore document to a safe user response dict."""
    data = doc.to_dict()
    return {
        "id": data.get("id"),
        "display_name": data.get("display_name"),
        "diet": data.get("diet"),
        "transport": data.get("transport"),
        "home": data.get("home"),
        "total_co2": data.get("total_co2", 0),
        "has_submitted": bool(data.get("has_submitted", False)),
    }


# ── Endpoints ────────────────────────────────────────────────

@router.post("/submit", response_model=dict)
async def submit_carbon(
    body: SubmitBody,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict[str, Any]:
    """
    Update the current user's carbon profile based on lifestyle choices.

    Calculates total annual CO₂ emissions from diet, transport, and home
    factors using IPCC-derived emission values.
    """
    co2 = calculate_co2(body.diet, body.transport, body.home)

    user_ref = db.collection("users").document(user_id)
    await user_ref.update({
        "diet": body.diet,
        "transport": body.transport,
        "home": body.home,
        "total_co2": co2,
        "has_submitted": 1,
    })

    doc = await user_ref.get()
    display_name = doc.to_dict().get("display_name", "Unknown")
    logger.info("Carbon profile updated: %s → %.2f MTCO₂e/yr", display_name, co2)

    await broadcaster.publish(
        "ACTION",
        f"Carbon profile updated: {display_name} → {co2} MTCO₂e/yr",
    )

    return _doc_to_user(doc)


@router.get("/tasks")
async def get_tasks(
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> list[dict[str, Any]]:
    """Retrieve all eco-tasks logged by the current user, sorted by date."""
    tasks_ref = db.collection("user_tasks")
    query = tasks_ref.where("user_id", "==", user_id).order_by("logged_at", direction="DESCENDING")

    tasks: list[dict[str, Any]] = []
    async for doc in query.stream():
        task_data = doc.to_dict()
        task_data["id"] = doc.id
        tasks.append(task_data)

    return tasks


@router.post("/tasks")
async def create_task(
    body: CreateTaskBody,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict[str, str]:
    """
    Log a custom eco-task and update the user's total CO₂ score.

    Anti-cheat: Rejects tasks claiming more than 50kg CO₂ reduction.
    """
    task_id = str(uuid.uuid4())
    task_ref = db.collection("user_tasks").document(task_id)

    await task_ref.set({
        "id": task_id,
        "user_id": user_id,
        "title": body.title,
        "category": body.category,
        "co2_saved": body.co2_saved,
        "logged_at": datetime.now(timezone.utc).isoformat(),
    })

    # Update user's total CO₂
    user_ref = db.collection("users").document(user_id)
    user_doc = await user_ref.get()
    user_data = user_doc.to_dict()
    new_co2 = max(0.0, round(user_data.get("total_co2", 0) - body.co2_saved, 2))
    await user_ref.update({"total_co2": new_co2})

    display_name = user_data.get("display_name", "Unknown")
    logger.info("Custom task logged: '%s' · −%.1fkg · %s", body.title, body.co2_saved, display_name)

    await broadcaster.publish(
        "ACTION",
        f"Custom task logged: '{body.title}' · −{body.co2_saved}kg · {display_name}",
    )

    return {"message": "Task created", "id": task_id}


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict[str, str]:
    """
    Delete a custom eco-task and refund CO₂ back to the user's total.

    Authorization: Users can only delete their own tasks.
    """
    task_ref = db.collection("user_tasks").document(task_id)
    doc = await task_ref.get()

    if not doc.exists or doc.to_dict().get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")

    task_data = doc.to_dict()

    # Refund CO₂ back to user's total
    user_ref = db.collection("users").document(user_id)
    user_doc = await user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        new_co2 = round(user_data.get("total_co2", 0) + task_data.get("co2_saved", 0), 2)
        await user_ref.update({"total_co2": new_co2})

    await task_ref.delete()
    logger.info("Task deleted: '%s' (refunded %.1fkg CO₂)", task_data.get("title"), task_data.get("co2_saved", 0))

    return {"message": "Task deleted"}


# ── Eco Actions API ──────────────────────────────────────────

@router.get("/actions")
async def get_actions() -> list[dict[str, Any]]:
    """Return the list of predefined eco-actions users can log."""
    return ECO_ACTIONS


@router.post("/actions/log/{action_id}")
async def log_action(
    action_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict[str, Any]:
    """
    Log a predefined eco-action, reducing the user's CO₂ total.

    Also creates a user_task record so the action appears on the dashboard.
    """
    action = next((a for a in ECO_ACTIONS if a["id"] == action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    user_ref = db.collection("users").document(user_id)
    doc = await user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = doc.to_dict()
    new_co2 = max(0.0, round(user_data.get("total_co2", 0) - action["co2_reduction"], 2))

    # 1. Update user total CO₂
    await user_ref.update({"total_co2": new_co2})

    # 2. Create task record for dashboard display
    task_id = str(uuid.uuid4())
    task_ref = db.collection("user_tasks").document(task_id)
    await task_ref.set({
        "id": task_id,
        "user_id": user_id,
        "title": action["title"],
        "category": action["category"],
        "co2_saved": action["co2_reduction"],
        "logged_at": datetime.now(timezone.utc).isoformat(),
    })

    display_name = user_data.get("display_name", "Unknown")
    logger.info("Eco action logged: %s — %s (−%.1fkg)", display_name, action["title"], action["co2_reduction"])

    await broadcaster.publish(
        "ACTION",
        f"Eco Action: {display_name} {action['title'].lower()} (-{action['co2_reduction']}kg)",
    )

    return {"message": "Action logged", "co2_saved": action["co2_reduction"]}
