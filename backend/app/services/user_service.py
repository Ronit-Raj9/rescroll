from typing import Any, Optional, Dict
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from datetime import datetime

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def create_user(self, user: UserCreate) -> Dict[str, Any]:
        """
        Create a new user in the database
        """
        # Check if user with email already exists
        existing_user = await User.find_one({"email": user.email})
        if existing_user:
            raise ValueError("User with this email already exists")
            
        # Check if username is taken
        existing_username = await User.find_one({"username": user.username})
        if existing_username:
            raise ValueError("Username already taken")
            
        # Create user dict
        user_dict = user.model_dump(exclude={"password"})
        user_dict["hashed_password"] = get_password_hash(user.password)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        user_dict["is_active"] = True
        user_dict["is_superuser"] = False
        
        # Insert user
        result = await User.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return user_dict

    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get a user by email
        """
        return await User.find_one({"email": email})

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a user by ID
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return await User.find_one({"_id": user_id})
        
    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Get a user by username
        """
        return await User.find_one({"username": username})

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[Dict[str, Any]]:
        """
        Update a user's information
        """
        # Convert to dict and remove None values
        update_data = {k: v for k, v in user_data.model_dump().items() if v is not None}
        
        if not update_data:
            return await self.get_user_by_id(user_id)
            
        # Handle password update
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
            
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # Update user
        await User.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": update_data}
        )
        
        return await self.get_user_by_id(user_id)

    async def delete_user(self, user_id: str) -> bool:
        """
        Delete a user
        """
        result = await User.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
        
    async def activate_user(self, user_id: str) -> bool:
        """
        Activate a user account
        """
        result = await User.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
        
    async def deactivate_user(self, user_id: str) -> bool:
        """
        Deactivate a user account
        """
        result = await User.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0