from typing import Any, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db["users"]

    async def get_user_by_id(self, user_id: str) -> Optional[dict[str, Any]]:
        return await self.db.find_one({"_id": ObjectId(user_id)})

    async def get_user_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return await self.db.find_one({"email": email})

    async def create_user(self, user_data: dict[str, Any]) -> dict[str, Any]:
        result = await self.db.insert_one(user_data)
        user_data["id"] = str(result.inserted_id)
        return user_data

    async def update_user(self, user_id: str, user_data: dict[str, Any]) -> Optional[dict[str, Any]]:
        await self.db.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": user_data}
        )
        return await self.get_user_by_id(user_id)

    async def delete_user(self, user_id: str) -> bool:
        result = await self.db.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0 