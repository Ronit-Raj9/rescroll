from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    profile_image: Optional[str] = None
    reading_time: int = 0
    articles_read: int = 0
    reading_streak: int = 0
    last_read_date: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

# Schema for user creation
class UserCreate(UserBase):
    password: str

# Schema for user update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    profile_image: Optional[str] = None
    reading_time: Optional[int] = None
    articles_read: Optional[int] = None
    reading_streak: Optional[int] = None
    last_read_date: Optional[str] = None

# Schema for user response
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime
    profile_image: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None