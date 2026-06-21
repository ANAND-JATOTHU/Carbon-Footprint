"""auth_routes.py — Firebase user sync and profile retrieval endpoints."""
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from google.cloud.firestore_v1.async_client import AsyncClient
from datetime import datetime, timezone
import firebase_admin.auth as fb_auth

from database import get_db, generate_display_name
from auth import get_current_user_id
from broadcaster import broadcaster

logger = logging.getLogger(__name__)

router = APIRouter()


def _doc_to_user(doc: Any) -> dict[str, Any]:
    """Convert a Firestore document to a safe user response dict (no PII)."""
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
async def sync(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict[str, Any]:
    """
    Sync a Firebase-authenticated user with Firestore.

    Creates a new user record on first login with a privacy-preserving
    display name. Returns the user profile on subsequent logins.
    """
    user_ref = db.collection("users").document(user_id)
    doc = await user_ref.get()

    if not doc.exists:
        try:
            fb_user = fb_auth.get_user(user_id)
            email = fb_user.email or "unknown@demo.internal"
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
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        client_ip = request.client.host if request.client else "unknown"
        logger.info("New user synced: %s from IP %s", display_name, client_ip)
        await broadcaster.publish("AUTH", f"New user synced from Firebase: {display_name} · IP {client_ip}")

        # Re-fetch after create
        doc = await user_ref.get()
    else:
        display_name = doc.to_dict().get("display_name", "Unknown")
        client_ip = request.client.host if request.client else "unknown"
        await broadcaster.publish("AUTH", f"User synced: {display_name} · IP {client_ip}")

    return _doc_to_user(doc)


@router.get("/me")
async def me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncClient = Depends(get_db),
) -> dict[str, Any]:
    """
    Return the current authenticated user's carbon profile.

    Raises:
        HTTPException(404): If the user record doesn't exist in Firestore.
    """
    user_ref = db.collection("users").document(user_id)
    doc = await user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _doc_to_user(doc)
