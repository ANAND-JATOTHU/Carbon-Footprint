"""carbon_routes.py — Submit carbon profile, eco-actions using Firestore."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from google.cloud.firestore_v1.async_client import AsyncClient
from datetime import datetime, timezone

from database import get_db, calculate_co2
from auth import get_current_user_id
from broadcaster import broadcaster

router = APIRouter()

# ── Static Eco Actions ───────────────────────────────────────
ECO_ACTIONS = [
    {"id": "diet_vegan", "title": "Ate a fully vegan meal", "category": "Diet", "co2_reduction": 1.5},
    {"id": "diet_local", "title": "Bought locally sourced groceries", "category": "Diet", "co2_reduction": 0.8},
    {"id": "trans_bike", "title": "Commuted by bike instead of car", "category": "Transport", "co2_reduction": 2.4},
    {"id": "trans_transit", "title": "Used public transportation", "category": "Transport", "co2_reduction": 1.8},
    {"id": "home_led", "title": "Upgraded to LED lighting", "category": "Home", "co2_reduction": 0.5},
    {"id": "energy_cold", "title": "Washed laundry in cold water", "category": "Energy", "co2_reduction": 0.6},
    {"id": "energy_solar", "title": "Installed solar panels", "category": "Energy", "co2_reduction": 15.0},
    {"id": "home_compost", "title": "Started composting food waste", "category": "Home", "co2_reduction": 0.9},
]

# ── Custom Tasks API ─────────────────────────────────────────

class SubmitBody(BaseModel):
    diet: str
    transport: str
    home: str


class CreateTaskBody(BaseModel):
    title: str
    category: str
    co2_saved: float


def _doc_to_user(doc) -> dict:
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


@router.post("/submit", response_model=dict)
async def submit_carbon(
    body: SubmitBody,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict:
    """
    Update the current user's carbon profile based on lifestyle choices.
    Calculates CO2 and updates the Firestore document.
    """
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

    user_ref = db.collection("users").document(user_id)
    await user_ref.update({
        "diet": body.diet,
        "transport": body.transport,
        "home": body.home,
        "total_co2": co2,
        "has_submitted": 1
    })

    doc = await user_ref.get()

    # Real security/audit event
    await broadcaster.publish(
        "ACTION",
        f"Carbon profile updated: {doc.to_dict().get('display_name')} → {co2} MTCO₂e/yr",
    )

    return _doc_to_user(doc)


@router.get("/tasks")
async def get_tasks(
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
):
    tasks_ref = db.collection("user_tasks")
    query = tasks_ref.where("user_id", "==", user_id).order_by("logged_at", direction="DESCENDING")
    
    docs = query.stream()
    tasks = []
    async for doc in docs:
        task_data = doc.to_dict()
        task_data["id"] = doc.id
        tasks.append(task_data)
        
    return tasks


@router.post("/tasks")
async def create_task(
    body: CreateTaskBody,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
):
    if body.co2_saved <= 0:
        raise HTTPException(status_code=400, detail="CO₂ saved must be positive")
    
    if body.co2_saved > 50:
        await broadcaster.publish("BLOCK", f"BLOCKED: Anomaly — {body.title} claimed {body.co2_saved}kg > 50kg threshold")
        raise HTTPException(status_code=422, detail="Anomaly detected: CO₂ reduction exceeds limit")

    task_id = str(uuid.uuid4())
    task_ref = db.collection("user_tasks").document(task_id)
    
    await task_ref.set({
        "id": task_id,
        "user_id": user_id,
        "title": body.title,
        "category": body.category,
        "co2_saved": body.co2_saved,
        "logged_at": datetime.now(timezone.utc).isoformat()
    })

    user_ref = db.collection("users").document(user_id)
    user_doc = await user_ref.get()
    
    # Update total CO2
    user_data = user_doc.to_dict()
    new_co2 = max(0.0, round(user_data.get("total_co2", 0) - body.co2_saved, 2))
    await user_ref.update({"total_co2": new_co2})

    await broadcaster.publish(
        "ACTION",
        f"Custom task logged: '{body.title}' · −{body.co2_saved}kg · {user_data.get('display_name')}",
    )

    return {"message": "Task created", "id": task_id}


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
):
    task_ref = db.collection("user_tasks").document(task_id)
    doc = await task_ref.get()
    if not doc.exists or doc.to_dict().get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
            
    task_data = doc.to_dict()
    
    # Re-add the CO2 to the user's total
    user_ref = db.collection("users").document(user_id)
    user_doc = await user_ref.get()
    if user_doc.exists:
        user_data = user_doc.to_dict()
        new_co2 = round(user_data.get("total_co2", 0) + task_data.get("co2_saved", 0), 2)
        await user_ref.update({"total_co2": new_co2})

    await task_ref.delete()
    return {"message": "Task deleted"}

# ── Eco Actions API ──────────────────────────────────────────

@router.get("/actions")
async def get_actions():
    return ECO_ACTIONS

@router.post("/actions/log/{action_id}")
async def log_action(
    action_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
):
    action = next((a for a in ECO_ACTIONS if a["id"] == action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
        
    user_ref = db.collection("users").document(user_id)
    doc = await user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = doc.to_dict()
    # Ensure CO2 doesn't go below 0
    new_co2 = max(0.0, round(user_data.get("total_co2", 0) - action["co2_reduction"], 2))
    
    # 1. Update user total CO2
    await user_ref.update({"total_co2": new_co2})
    
    # 2. Add to user tasks so it shows up on dashboard
    task_id = str(uuid.uuid4())
    task_ref = db.collection("user_tasks").document(task_id)
    await task_ref.set({
        "id": task_id,
        "user_id": user_id,
        "title": action["title"],
        "category": action["category"],
        "co2_saved": action["co2_reduction"],
        "logged_at": datetime.now(timezone.utc).isoformat()
    })
    
    await broadcaster.publish(
        "ACTION", 
        f"Eco Action: {user_data.get('display_name')} {action['title'].lower()} (-{action['co2_reduction']}kg)"
    )
    
    return {"message": "Action logged", "co2_saved": action["co2_reduction"]}
