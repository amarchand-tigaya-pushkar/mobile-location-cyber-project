import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# =========================================================
# FIND backend/.env
# =========================================================

CURRENT_FILE = Path(__file__).resolve()

BACKEND_DIR = CURRENT_FILE.parent.parent

ENV_FILE = BACKEND_DIR / ".env"


print("Loading .env from:", ENV_FILE)


# Load .env
load_dotenv(
    dotenv_path=ENV_FILE,
    override=True
)


# =========================================================
# DATABASE URL
# =========================================================

DATABASE_URL = os.getenv("DATABASE_URL")


print(
    "DATABASE_URL loaded:",
    "YES" if DATABASE_URL else "NO"
)


if not DATABASE_URL:

    raise ValueError(
        f"DATABASE_URL missing. Expected file: {ENV_FILE}"
    )


# =========================================================
# SQLALCHEMY
# =========================================================

engine = create_engine(
    DATABASE_URL
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()