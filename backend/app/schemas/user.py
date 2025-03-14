from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator


# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    profile_image: Optional[str] = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str
    
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'Username must be alphanumeric'
        return v


# Properties to receive via API on login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None


# Properties to return via API
class User(UserBase):
    id: int
    reading_time: Optional[int] = 0
    articles_read: Optional[int] = 0
    favorite_domains: Optional[List[str]] = []
    reading_streak: Optional[int] = 0
    last_read_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Additional schemas
class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class RefreshToken(BaseModel):
    refresh_token: str


class Msg(BaseModel):
    msg: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_image: Optional[str] = None


class UserStats(BaseModel):
    reading_time: int = 0
    articles_read: int = 0
    favorite_domains: List[str] = []
    reading_streak: int = 0
    last_read_date: Optional[datetime] = None


class ProfileImage(BaseModel):
    image_url: str