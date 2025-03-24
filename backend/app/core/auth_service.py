from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from jose import jwt

from app.core.config import settings
from app.core.security import verify_password
from app.models.user import User

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_access_token(self, user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"exp": expire, "sub": str(user_id)}
        encoded_jwt = jwt.encode(to_encode, settings.ACCESS_TOKEN_SECRET, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def create_refresh_token(self, user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        to_encode = {"exp": expire, "sub": str(user_id)}
        encoded_jwt = jwt.encode(to_encode, settings.REFRESH_TOKEN_SECRET, algorithm=settings.ALGORITHM)
        return encoded_jwt 