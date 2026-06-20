import pytest
from httpx import AsyncClient
from main import app
from database import db_client

# Mark all tests as asyncio
pytestmark = pytest.mark.asyncio

async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "CarbonZero API"}

async def test_leaderboard():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

async def test_unauthorized_access():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/auth/me")
    assert response.status_code == 401
    assert "detail" in response.json()
