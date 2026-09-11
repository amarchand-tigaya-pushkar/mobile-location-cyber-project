from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    name: str
    phone: str

    class Config:
        from_attributes = True


class TowerResponse(BaseModel):
    id: int
    tower_id: str
    area: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class LocationResponse(BaseModel):
    id: int
    user_id: int
    tower_id: int
    latitude: float
    longitude: float
    accuracy: float | None
    recorded_at: datetime

    class Config:
        from_attributes = True