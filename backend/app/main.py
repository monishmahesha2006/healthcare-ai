import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed import seed_database
from app.api.api import api_router

# Ensure tables are created on startup
Base.metadata.create_all(bind=engine)

# Create upload directory if it does not exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Production-Grade Healthcare AI Platform REST API. "
        "Provides role-based access control (Doctor & Patient), HealthEngine deterministic "
        "vital risk scoring, AI-assisted medical report and medicine explanation, prescription OCR, "
        "and Google Care Finder navigation."
    ),
    version="1.0.0",
    # Only expose interactive docs in debug/dev mode
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Security Headers Middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ---------------------------------------------------------------------------
# Static file serving for uploads
# ---------------------------------------------------------------------------
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# ---------------------------------------------------------------------------
# API Router
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    """Initializes tables and seeds synthetic demo data on initial startup."""
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


_possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend_dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend_dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend_dist")),
]

_frontend_dist = next(
    (p for p in _possible_dist_paths if os.path.exists(p) and os.path.isfile(os.path.join(p, "index.html"))),
    None,
)

if _frontend_dist:
    _assets_path = os.path.join(_frontend_dist, "assets")
    if os.path.exists(_assets_path):
        app.mount("/assets", StaticFiles(directory=_assets_path), name="frontend_assets")


@app.get("/")
def root():
    if _frontend_dist and os.path.isfile(os.path.join(_frontend_dist, "index.html")):
        return FileResponse(os.path.join(_frontend_dist, "index.html"))
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.DEBUG else "disabled in production",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health")
def health_check():
    """Railway health check endpoint."""
    return {
        "status": "healthy",
        "service": "healthcare-ai-backend",
        "healthengine_rules": "v1.0.0 active",
    }


if _frontend_dist:
    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in ("health", "docs", "redoc", "openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        candidate = os.path.join(_frontend_dist, full_path)
        if os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(_frontend_dist, "index.html"))

