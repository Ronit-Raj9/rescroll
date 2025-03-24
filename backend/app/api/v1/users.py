from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import shutil
import os

from app.db.database import get_db
from app.core.config import settings
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse, User as UserSchema
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_password_hash,
    verify_password
)
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter()

@router.post("/register", response_model=UserSchema)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    avatar: Optional[UploadFile] = File(None),
    cover_image: Optional[UploadFile] = File(None)
):
    # Create user service
    user_service = UserService(db)
    
    # Check if user exists
    existing_user = await user_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Handle file uploads
    profile_image_path = None
    
    if avatar:
        profile_image_path = f"static/avatars/{user_data.email}_{avatar.filename}"
        os.makedirs(os.path.dirname(profile_image_path), exist_ok=True)
        with open(profile_image_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)

    # Create user
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        profile_image=profile_image_path,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=TokenResponse)
async def login_user(
    user_credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    # Create user service
    user_service = UserService(db)
    
    # Check user credentials
    user = await user_service.get_user_by_email(user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.patch("/update", response_model=UserSchema)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Create user service
    user_service = UserService(db)
    
    # Update user
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    # Get user from database
    user = await user_service.get_user_by_id(current_user.id)
    
    # Update user fields
    for field, value in update_data.items():
        setattr(user, field, value)
    
    # Save changes
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

@router.post("/logout")
async def logout_user(
    current_user: User = Depends(get_current_user)
):
    # In a real implementation, you might want to invalidate the token
    # This could involve adding it to a blacklist or similar mechanism
    return {"message": "Successfully logged out"} 