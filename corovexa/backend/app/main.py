"""
COROVEXA API — Industrial Asset Health & Corrosion Monitoring System.

FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, telemetry, pipeline, analytics, alerts, workorders

app = FastAPI(
    title="COROVEXA API",
    description=(
        "Industrial Asset Health & Corrosion Monitoring System.\n\n"
        "Provides REST endpoints for telemetry data, pipeline monitoring, "
        "analytics, alerts, work orders, and authentication."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — Allow the React frontend (Vite dev server) to call the API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:3000",   # CRA fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.database.mongodb import db_client

# ---------------------------------------------------------------------------
# MongoDB Startup/Shutdown
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_db_client():
    await db_client.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db_client.disconnect()

# ---------------------------------------------------------------------------
# Register route modules
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(telemetry.router)
app.include_router(pipeline.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(workorders.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "COROVEXA API",
        "version": "1.0.0",
    }
