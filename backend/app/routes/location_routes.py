from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Tower, LocationLog
from ..schemas import (
    UserResponse,
    TowerResponse,
    LocationResponse
)

router = APIRouter(
    prefix="/api",
    tags=["Location"]
)


@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/towers", response_model=list[TowerResponse])
def get_towers(db: Session = Depends(get_db)):
    return db.query(Tower).all()


@router.get(
    "/locations/{user_id}",
    response_model=list[LocationResponse]
)
def get_user_locations(
    user_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(LocationLog)
        .filter(LocationLog.user_id == user_id)
        .order_by(LocationLog.recorded_at)
        .all()
    )