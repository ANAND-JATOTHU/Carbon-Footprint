"""
main.py — FastAPI application entry point.
Runs on port 8001 (nginx proxies /api/* to this internally).
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import init_db
from broadcaster import broadcaster
from routes.auth_routes import router as auth_router
from routes.carbon_routes import router as carbon_router
from routes.leaderboard_routes import router as leaderboard_router
from routes.logs_routes import router as logs_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await broadcaster.publish("INFO", "CarbonZero Security Middleware v2.0.0 initialized.")
    await broadcaster.publish("INFO", "Rate-limiter: sliding-window 5 req/min per IP active.")
    await broadcaster.publish("INFO", "Anomaly filter: max 50kg CO₂ per transaction enforced.")
    yield


# ── Rate limiter ──────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CarbonZero API",
    description="Privacy-first carbon footprint tracking API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter


# ── Custom rate-limit handler (also broadcasts to terminal) ───
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    await broadcaster.publish(
        "RATE",
        f"RATE_LIMIT exceeded: IP {request.client.host} → 429 Too Many Requests",
    )
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Maximum 5 requests per minute."},
    )


app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

from fastapi.middleware.gzip import GZipMiddleware

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── GZip Compression ──────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Security Headers ──────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# ── Routes ────────────────────────────────────────────────────
app.include_router(auth_router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(carbon_router,      prefix="/api/carbon",      tags=["Carbon"])
app.include_router(leaderboard_router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(logs_router,        prefix="/api/logs",        tags=["Logs"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "version": "2.0.0"}

# ── Serve Frontend ────────────────────────────────────────────
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Note: In Cloud Run, the frontend is built into the ../dist folder (relative to backend)
# However, inside the Docker container, we'll copy it to /app/dist
dist_dir = os.path.join(os.path.dirname(__file__), "..", "dist")
if not os.path.exists(dist_dir):
    dist_dir = os.path.join(os.path.dirname(__file__), "dist") # Fallback if run from container root

if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow API routes to 404 naturally
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        return FileResponse(os.path.join(dist_dir, "index.html"))
