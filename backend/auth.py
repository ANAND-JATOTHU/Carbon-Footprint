"""
auth.py — Firebase Authentication middleware for CarbonZero.

Provides Firebase ID token verification and FastAPI dependency injection
for both required and optional authentication flows.

Security:
    - Stateless JWT verification via Firebase Admin SDK
    - No session cookies — tokens are verified on every request
    - Supports both mandatory and optional auth flows
"""
import logging
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

# Initialize Firebase Admin App
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(options={"projectId": "carbon-2cd28"})
    logger.info("Firebase Admin SDK initialized for project carbon-2cd28.")

security = HTTPBearer(auto_error=False)


def verify_firebase_token(token: str) -> Optional[str]:
    """
    Verify a Firebase ID token and extract the user's UID.

    Args:
        token: The Firebase ID token string from the Authorization header.

    Returns:
        The user's Firebase UID if valid, or None if verification fails.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token.get("uid")
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token received.")
        return None
    except auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token received.")
        return None
    except Exception as exc:
        logger.error("Unexpected error verifying Firebase token: %s", exc)
        return None


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """
    FastAPI dependency that extracts and validates the authenticated user ID.

    Raises:
        HTTPException(401): If no credentials are provided or token is invalid.

    Returns:
        The authenticated user's Firebase UID.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    user_id = verify_firebase_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return user_id


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    """
    FastAPI dependency for optional authentication.

    Returns:
        The user's Firebase UID if authenticated, or None if no token is provided.
    """
    if not credentials:
        return None
    return verify_firebase_token(credentials.credentials)
