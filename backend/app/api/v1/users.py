from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from ..schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse
from ..core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_password_hash,
    verify_password
)
from ..models.user import User
from ..core.config import settings
import shutil
import os
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    avatar: Optional[UploadFile] = File(None),
    cover_image: Optional[UploadFile] = File(None)
):
    # Check if user exists
    existing_user = await User.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Handle file uploads
    avatar_path = None
    cover_image_path = None
    
    if avatar:
        avatar_path = f"static/avatars/{user_data.email}_{avatar.filename}"
        os.makedirs(os.path.dirname(avatar_path), exist_ok=True)
        with open(avatar_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
    
    if cover_image:
        cover_image_path = f"static/covers/{user_data.email}_{cover_image.filename}"
        os.makedirs(os.path.dirname(cover_image_path), exist_ok=True)
        with open(cover_image_path, "wb") as buffer:
            shutil.copyfileobj(cover_image.file, buffer)

    # Create user
    user_dict = user_data.dict()
    user_dict.pop("password")
    new_user = {
        **user_dict,
        "password": hashed_password,
        "avatar": avatar_path,
        "coverImage": cover_image_path,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await User.insert_one(new_user)
    created_user = await User.find_one({"_id": result.inserted_id})
    
    return UserResponse(**created_user)

@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin):
    user = await User.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/update", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        await User.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
    
    updated_user = await User.find_one({"_id": current_user["_id"]})
    return UserResponse(**updated_user)

@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    # In a real implementation, you might want to invalidate the token
    # This could involve adding it to a blacklist or similar mechanism
    return {"message": "Successfully logged out"} 