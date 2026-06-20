"""
auth.py — Firebase token verification.
"""
import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

# Initialize Firebase Admin App
# (Will use GOOGLE_APPLICATION_CREDENTIALS automatically if running on Cloud Run, 
# or local gcloud auth if running locally)
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app()

security = HTTPBearer(auto_error=False)


def verify_firebase_token(token: str) -> Optional[str]:
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token.get('uid')
    except Exception as e:
        return None


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = verify_firebase_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user_id


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    if not credentials:
        return None
    return verify_firebase_token(credentials.credentials)
