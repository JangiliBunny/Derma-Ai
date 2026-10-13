from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import os

raw_secret = os.getenv("SECRET_KEY", "").strip()
if not raw_secret:
    raise RuntimeError(
        "CRITICAL SECURITY CONFIGURATION ERROR: 'SECRET_KEY' environment variable is not configured. "
        "A cryptographically strong secret key is required for JWT token encryption. "
        "Generate a 64-character hex key via 'openssl rand -hex 32' and set SECRET_KEY in your environment."
    )
if raw_secret == "supersecretkey_for_dermai_app_2026":
    raise RuntimeError(
        "CRITICAL SECURITY CONFIGURATION ERROR: Insecure placeholder 'SECRET_KEY' detected. "
        "You must generate and configure a unique, cryptographically strong secret key."
    )

SECRET_KEY = raw_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password: str, hashed_password: str):
    # checkpw expects bytes
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    # hashpw expects bytes
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
