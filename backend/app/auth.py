# =========================================================
# INVESTIGATOR AUTHENTICATION
# JWT + PBKDF2 PASSWORD HASHING
# =========================================================

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt


JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "CHANGE_THIS_SECRET_IN_PRODUCTION"
)

JWT_ALGORITHM = "HS256"

JWT_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_EXPIRE_MINUTES",
        "60"
    )
)

security = HTTPBearer()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        310000
    ).hex()

    return f"pbkdf2_sha256$310000${salt}${password_hash}"


def verify_password(
    password: str,
    stored_hash: str
) -> bool:

    try:
        algorithm, iterations, salt, expected_hash = (
            stored_hash.split("$")
        )

        if algorithm != "pbkdf2_sha256":
            return False

        calculated_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations)
        ).hex()

        return hmac.compare_digest(
            calculated_hash,
            expected_hash
        )

    except Exception:
        return False


def create_access_token(
    username: str
) -> str:

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {
        "sub": username,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        username = payload.get("sub")

        if not username:
            return None

        return username

    except JWTError:
        return None


def get_current_investigator(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    username = decode_access_token(
        credentials.credentials
    )

    if not username:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    return username