from datetime import timedelta
from typing import Optional

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.schemas.auth import Token
from app.services.user_service import UserService

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.user_service = UserService(db)

    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        user = await self.user_service.get_user_by_email(email)
        if not user or not verify_password(password, user["hashed_password"]):
            return None
        return user

    async def create_access_token(self, user: dict) -> Token:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]},
            expires_delta=access_token_expires
        )
        return Token(
            access_token=access_token,
            token_type="bearer"
        )

    async def login(self, email: str, password: str) -> Token:
        user = await self.authenticate_user(email, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return await self.create_access_token(user) 