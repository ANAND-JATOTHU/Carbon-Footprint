"""auth_routes.py — Register, Login, Me endpoints."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
import aiosqlite

from database import get_db, generate_display_name
from auth import hash_password, verify_password, create_access_token, get_current_user_id, decode_token
from broadcaster import broadcaster

router = APIRouter()


class RegisterBody(BaseModel):
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


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


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterBody, request: Request, db: aiosqlite.Connection = Depends(get_db)):
    # Check if email exists
    async with db.execute("SELECT id FROM users WHERE email = ?", (body.email,)) as cur:
        if await cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    uid = str(uuid.uuid4())
    display_name = generate_display_name()
    ph = hash_password(body.password)

    await db.execute(
        "INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
        (uid, body.email, ph, display_name),
    )
    await db.commit()

    token = create_access_token(uid)

    # Broadcast real security event
    await broadcaster.publish("AUTH", f"New user registered: {display_name} · IP {request.client.host}")

    async with db.execute("SELECT * FROM users WHERE id = ?", (uid,)) as cur:
        row = await cur.fetchone()

    return {"access_token": token, "token_type": "bearer", "user": _row_to_user(row)}


@router.post("/login")
async def login(body: LoginBody, request: Request, db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE email = ?", (body.email,)) as cur:
        row = await cur.fetchone()

    if not row or not verify_password(body.password, row["password_hash"]):
        # Broadcast blocked auth attempt
        await broadcaster.publish("BLOCK", f"BLOCKED: Failed login attempt for {body.email} · IP {request.client.host}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(row["id"])

    # Broadcast real JWT issuance event
    await broadcaster.publish("AUTH", f"JWT issued: {row['display_name']} · exp 24h · IP {request.client.host}")

    return {"access_token": token, "token_type": "bearer", "user": _row_to_user(row)}


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id), db: aiosqlite.Connection = Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cur:
        row = await cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return _row_to_user(row)
