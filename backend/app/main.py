from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import (
    APP_NAME,
    APP_VERSION,
    CORS_ORIGINS,
)

from .routes.location_routes import router as location_router


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "Educational and simulated mobile location "
        "investigation system using PostgreSQL."
    )
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=CORS_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTES
# =========================================================

app.include_router(
    location_router
)


# =========================================================
# HEALTH / HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Cyber Location Investigation Simulator API",
        "version": APP_VERSION,
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }