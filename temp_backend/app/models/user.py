from typing import Optional, Annotated, List
from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from bson import ObjectId
from sqlalchemy import Column, String, Boolean, Integer, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
from app.models.associations import user_interests

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
    is_active: bool = True

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
                "is_active": True,
                "_id": "507f1f77bcf86cd799439011"
            }
        }
    }

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    profile_image = Column(String, nullable=True)  # URL to the profile image in Cloudinary

    # Analytics fields
    reading_time = Column(Integer, default=0)  # Total reading time in minutes
    articles_read = Column(Integer, default=0)  # Total number of articles read
    favorite_domains = Column(JSON, default=list)  # List of favorite research domains
    reading_streak = Column(Integer, default=0)  # Current reading streak in days
    last_read_date = Column(String)  # Last date when user read an article
    
    # Relationships - using string references to avoid circular imports
    reading_history = relationship("ReadingHistory", back_populates="user")
    quiz_results = relationship("QuizResult", back_populates="user")
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    interests = relationship("Topic", secondary=user_interests, back_populates="interested_users")
    
    def __repr__(self):
        return f"<User {self.username}>" 