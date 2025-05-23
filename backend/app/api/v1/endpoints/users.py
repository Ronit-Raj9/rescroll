from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.utils import upload_image, delete_image

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
async def read_users(
    db: Session = Depends(deps.db_dependency),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users.
    """
    users = await crud.user.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=schemas.User)
async def create_user(
    *,
    db: Session = Depends(deps.db_dependency),
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new user.
    """
    user = await crud.user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = await crud.user.create_user(db, user=user_in)
    return user

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    *,
    db: Session = Depends(deps.db_dependency),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user = await crud.user.update_user(db, db_user=current_user, user_in=user_in)
    return user

@router.post("/me/profile-image", response_model=schemas.ProfileImage)
async def upload_profile_image(
    *,
    db: Session = Depends(deps.db_dependency),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a profile image for the current user.
    If a profile image already exists, it will be replaced.
    """
    try:
        # Upload new image to Cloudinary first
        image_url = await upload_image(file, folder="profile_images")
        
        # Only delete old image if new image was successfully uploaded
        if current_user.profile_image:
            delete_image(current_user.profile_image)
        
        # Update user profile with new image URL
        await crud.user.update_user_profile_image(db, db_user=current_user, image_url=image_url)
        
        return {"image_url": image_url}
    except Exception as e:
        # If anything fails, we don't want to delete the old image
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload profile image: {str(e)}"
        )

@router.delete("/me/profile-image", response_model=schemas.User)
async def delete_profile_image(
    *,
    db: Session = Depends(deps.db_dependency),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete the profile image of the current user.
    """
    # Check if user has a profile image
    if not current_user.profile_image:
        raise HTTPException(
            status_code=400,
            detail="No profile image to delete.",
        )
    
    # Delete the image from Cloudinary
    delete_result = delete_image(current_user.profile_image)
    
    if not delete_result:
        # Even if Cloudinary deletion fails, we should still remove the reference
        # from the user's profile, but log the issue
        print(f"Warning: Failed to delete image from Cloudinary: {current_user.profile_image}")
    
    # Update user profile to remove image URL
    user = await crud.user.remove_profile_image(db, db_user=current_user)
    
    return user

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    db: Session = Depends(deps.db_dependency),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
async def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.db_dependency),
) -> Any:
    """
    Get a specific user by id.
    """
    user = await crud.user.get_user_by_id(db, id=user_id)
    if user == current_user:
        return user
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user

@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    *,
    db: Session = Depends(deps.db_dependency),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user.
    """
    user = await crud.user.get_user_by_id(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    user = await crud.user.update_user(db, db_user=user, user_in=user_in)
    return user 