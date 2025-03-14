from fastapi import APIRouter, Depends, Query, UploadFile, File
from typing import List, Optional
from ..schemas.user import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
    UserWithTokenResponse,
    UserListResponse
)
from ..services.user_service import UserService
from ..middlewares.role_verify import verify_role, get_current_user
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/register", response_model=ApiResponse[UserWithTokenResponse])
async def register(user_data: UserCreate):
    """Register a new user."""
    user = await UserService.create_user(user_data.dict())
    return ApiResponse(data=user)

@router.post("/login", response_model=ApiResponse[UserWithTokenResponse])
async def login(credentials: UserLogin):
    """Login user."""
    auth_data = await UserService.authenticate_user(
        credentials.email,
        credentials.password
    )
    return ApiResponse(data=auth_data)

@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's profile."""
    user = await UserService.get_user_by_id(current_user["_id"])
    return ApiResponse(data=user)

@router.put("/me", response_model=ApiResponse[UserResponse])
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    updated_user = await UserService.update_user(
        current_user["_id"],
        user_update.dict(exclude_unset=True)
    )
    return ApiResponse(data=updated_user)

@router.post("/me/avatar", response_model=ApiResponse[UserResponse])
async def update_avatar(
    avatar: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user's avatar."""
    updated_user = await UserService.update_user(
        current_user["_id"],
        {"avatar": avatar}
    )
    return ApiResponse(data=updated_user)

@router.get("/{user_id}", response_model=ApiResponse[UserResponse])
async def get_user(
    user_id: str,
    _=Depends(verify_role(["admin"]))
):
    """Get user by ID (admin only)."""
    user = await UserService.get_user_by_id(user_id)
    return ApiResponse(data=user)

@router.get("/", response_model=ApiResponse[List[UserListResponse]])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = None,
    _=Depends(verify_role(["admin"]))
):
    """Get users with optional role filter (admin only)."""
    users = await UserService.get_users(skip=skip, limit=limit, role=role)
    return ApiResponse(data=users)

@router.delete("/{user_id}", response_model=ApiResponse[bool])
async def delete_user(
    user_id: str,
    _=Depends(verify_role(["admin"]))
):
    """Delete user (admin only)."""
    result = await UserService.delete_user(user_id)
    return ApiResponse(data=result) 