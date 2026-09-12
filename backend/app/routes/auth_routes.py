from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..auth import verify_password, create_access_token
from ..config import (
    INVESTIGATOR_USERNAME,
    INVESTIGATOR_PASSWORD_HASH,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):

    if data.username != INVESTIGATOR_USERNAME:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(
        data.password,
        INVESTIGATOR_PASSWORD_HASH
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(
        data.username
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }