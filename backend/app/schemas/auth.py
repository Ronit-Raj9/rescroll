from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str | None = None
    profile_image: str | None = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    full_name: str | None = None
    password: str | None = None
    profile_image: str | None = None

class User(UserBase):
    id: int
    is_active: bool = True
    is_superuser: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None

class RefreshToken(BaseModel):
    refresh_token: str

class TokenPayload(BaseModel):
    sub: int | None = None

class TokenData(BaseModel):
    email: str | None = None

class UserResponse(UserBase):
    id: str
    is_active: bool = True

    model_config = {
        "from_attributes": True
    }

class Msg(BaseModel):
    msg: str
    token: str | None = None

class ProfileImage(BaseModel):
    image_url: str 