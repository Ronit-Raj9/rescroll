from typing import Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserCreate
from app.models.user import UserCreate

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.user_repo = UserRepository(db)
        self.db = db

    async def create_user(self, user: UserCreate) -> dict:
        user_dict = user.model_dump(exclude={"password"})
        user_dict["hashed_password"] = get_password_hash(user.password)
        result = await self.db.users.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        return user_dict

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        return await self.db.users.find_one({"email": email})

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        return await self.db.users.find_one({"_id": user_id})

    async def update_user(self, user_id: str, user_data: dict[str, Any]) -> Optional[dict[str, Any]]:
        if "password" in user_data:
            user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
        return await self.user_repo.update_user(user_id, user_data)

    async def delete_user(self, user_id: str) -> bool:
        return await self.user_repo.delete_user(user_id) 