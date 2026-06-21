"""
main.py — FastAPI application entry point for CarbonZero.

Provides the REST API for carbon footprint tracking, user authentication,
leaderboard management, and real-time security event streaming.

Architecture:
    - Firebase Authentication for stateless token verification
    - Google Cloud Firestore for persistent data storage
    - Server-Sent Events (SSE) for real-time security monitoring
    - Rate limiting via SlowAPI (5 req/min per IP)

Security Headers:
    - Strict-Transport-Security (HSTS)
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - Content-Security-Policy
    - Referrer-Policy
    - Permissions-Policy
"""
import os
import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import init_db
from broadcaster import broadcaster
from routes.auth_routes import router as auth_router
from routes.carbon_routes import router as carbon_router
from routes.leaderboard_routes import router as leaderboard_router
from routes.logs_routes import router as logs_router

# ── Logging ───────────────────────────────────────────────────
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    logger.info("CarbonZero API starting up...")
    await init_db()
    await broadcaster.publish("INFO", "CarbonZero Security Middleware v2.0.0 initialized.")
    await broadcaster.publish("INFO", "Rate-limiter: sliding-window 5 req/min per IP active.")
    await broadcaster.publish("INFO", "Anomaly filter: max 50kg CO₂ per transaction enforced.")
    logger.info("CarbonZero API ready.")
    yield
    logger.info("CarbonZero API shutting down.")


# ── Rate limiter ──────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CarbonZero API",
    description="Privacy-first carbon footprint tracking API with real-time security monitoring.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter


# ── Custom rate-limit handler ─────────────────────────────────
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Return 429 and broadcast rate-limit event to security console."""
    client_ip = request.client.host if request.client else "unknown"
    await broadcaster.publish(
        "RATE",
        f"RATE_LIMIT exceeded: IP {client_ip} → 429 Too Many Requests",
    )
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Maximum 5 requests per minute."},
    )


app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)


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


# ── Security Headers Middleware ───────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next: Any) -> Any:
    """Inject comprehensive security headers into every response."""
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com"
    )
    return response


# ── Routes ────────────────────────────────────────────────────
app.include_router(auth_router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(carbon_router,      prefix="/api/carbon",      tags=["Carbon"])
app.include_router(leaderboard_router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(logs_router,        prefix="/api/logs",        tags=["Logs"])


@app.get("/api/health", tags=["Health"])
async def health() -> dict:
    """Health check endpoint for monitoring and load balancers."""
    return {"status": "ok", "version": "2.0.0", "service": "CarbonZero API"}


# ── Serve Frontend ────────────────────────────────────────────
dist_dir = os.path.join(os.path.dirname(__file__), "..", "dist")
if not os.path.exists(dist_dir):
    dist_dir = os.path.join(os.path.dirname(__file__), "dist")

if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str) -> Any:
        """Serve the React SPA for all non-API routes (client-side routing)."""
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        return FileResponse(os.path.join(dist_dir, "index.html"))
