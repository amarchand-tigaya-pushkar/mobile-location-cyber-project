import os
from pathlib import Path

from dotenv import load_dotenv


# =========================================================
# ENVIRONMENT FILE
# =========================================================

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(
    dotenv_path=ENV_FILE,
    override=True
)


# =========================================================
# APPLICATION SETTINGS
# =========================================================

APP_NAME = os.getenv(
    "APP_NAME",
    "Cyber Location Investigation Simulator"
)

APP_VERSION = os.getenv(
    "APP_VERSION",
    "1.0.0"
)

DEBUG = os.getenv(
    "DEBUG",
    "false"
).lower() == "true"


# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = os.getenv("DATABASE_URL")


# =========================================================
# CORS
# =========================================================

CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500"
)

CORS_ORIGINS = [
    origin.strip()
    for origin in CORS_ORIGINS_RAW.split(",")
    if origin.strip()
]


# =========================================================
# SERVER
# =========================================================

HOST = os.getenv(
    "HOST",
    "127.0.0.1"
)

PORT = int(
    os.getenv(
        "PORT",
        "8000"
    )
)
INVESTIGATOR_USERNAME = os.getenv(
    "INVESTIGATOR_USERNAME",
    "investigator"
)

INVESTIGATOR_PASSWORD_HASH = os.getenv(
    "INVESTIGATOR_PASSWORD_HASH"
)