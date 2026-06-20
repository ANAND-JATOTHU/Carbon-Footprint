"""auth_routes.py — Sync, Me endpoints using Firestore."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from google.cloud.firestore_v1.async_client import AsyncClient
from datetime import datetime, timezone
import firebase_admin.auth as fb_auth

from database import get_db, generate_display_name
from auth import get_current_user_id
from broadcaster import broadcaster

router = APIRouter()


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


@router.post("/sync")
async def sync(request: Request, user_id: str = Depends(get_current_user_id), db: AsyncClient = Depends(get_db)):
    """Sync Firebase user with Firestore, creating a record if needed."""
    user_ref = db.collection("users").document(user_id)
    doc = await user_ref.get()
    
    if not doc.exists:
        try:
            fb_user = fb_auth.get_user(user_id)
            email = fb_user.email
        except Exception:
            email = "unknown@demo.internal"

        display_name = generate_display_name()
        
        await user_ref.set({
            "id": user_id,
            "email": email,
            "display_name": display_name,
            "diet": None,
            "transport": None,
            "home": None,
            "total_co2": 0,
            "has_submitted": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        await broadcaster.publish("AUTH", f"New user synced from Firebase: {display_name} · IP {request.client.host}")
        
        # Re-fetch after create
        doc = await user_ref.get()
    else:
        await broadcaster.publish("AUTH", f"User synced: {doc.to_dict().get('display_name')} · IP {request.client.host}")

    return _doc_to_user(doc)


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id), db: AsyncClient = Depends(get_db)):
    user_ref = db.collection("users").document(user_id)
    doc = await user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return _doc_to_user(doc)
