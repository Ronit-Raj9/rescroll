from typing import Optional, Annotated, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from bson import ObjectId
from ..db.mongodb import db

def validate_object_id(v: str | ObjectId) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if not ObjectId.is_valid(v):
        raise ValueError("Invalid objectid")
    return ObjectId(v)

PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    username: str
    is_active: bool = True
    is_superuser: bool = False
    profile_image: Optional[str] = None
    
    # Analytics fields
    reading_time: int = 0  # Total reading time in minutes
    articles_read: int = 0  # Total number of articles read
    favorite_domains: List[str] = []  # List of favorite research domains
    reading_streak: int = 0  # Current reading streak in days
    last_read_date: Optional[str] = None  # Last date when user read an article

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    hashed_password: str

    model_config = {
        "json_encoders": {ObjectId: str},
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "username": "johndoe",
                "is_active": True,
                "_id": "507f1f77bcf86cd799439011"
            }
        }
    }

class User:
    collection = None

    @classmethod
    async def get_collection(cls):
        if not cls.collection:
            cls.collection = db.users
            # Create indexes
            await cls.collection.create_index("email", unique=True)
            await cls.collection.create_index("username", unique=True)
        return cls.collection

    @classmethod
    async def find_one(cls, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        collection = await cls.get_collection()
        if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
            filter_dict["_id"] = ObjectId(filter_dict["_id"])
        return await collection.find_one(filter_dict)

    @classmethod
    async def insert_one(cls, document: Dict[str, Any]):
        collection = await cls.get_collection()
        result = await collection.insert_one(document)
        return result

    @classmethod
    async def update_one(cls, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        collection = await cls.get_collection()
        if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
            filter_dict["_id"] = ObjectId(filter_dict["_id"])
        result = await collection.update_one(filter_dict, update_dict)
        return result

    @classmethod
    async def delete_one(cls, filter_dict: Dict[str, Any]):
        collection = await cls.get_collection()
        if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
            filter_dict["_id"] = ObjectId(filter_dict["_id"])
        result = await collection.delete_one(filter_dict)
        return result