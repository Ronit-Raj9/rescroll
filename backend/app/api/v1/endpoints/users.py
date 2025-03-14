from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.utils import upload_image, delete_image

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users.
    """
    users = crud.user.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new user.
    """
    user = crud.user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.create_user(db, user=user_in)
    return user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user = crud.user.update_user(db, db_user=current_user, user_in=user_in)
    return user

@router.post("/me/profile-image", response_model=schemas.ProfileImage)
async def upload_profile_image(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a profile image for the current user.
    """
    try:
        if not file or not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file provided or empty filename"
            )
        
        # Log file information    
        print(f"Received file: {file.filename}, content type: {file.content_type}, size: {file.size}")
            
        # Check file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"File must be an image. Got content type: {file.content_type}"
            )
            
        # Reset file position to beginning
        await file.seek(0)
            
        # Delete old image if it exists
        if current_user.profile_image:
            print(f"Deleting existing profile image: {current_user.profile_image}")
            delete_image(current_user.profile_image)
        
        # Upload new image to Cloudinary
        print(f"Uploading new profile image to Cloudinary")
        image_url = await upload_image(file, folder="profile_images")
        
        # Update user profile with new image URL
        print(f"Updating user profile with new image URL: {image_url}")
        user = crud.user.update_user_profile_image(db, db_user=current_user, image_url=image_url)
        
        return {"image_url": image_url}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in upload_profile_image: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=f"Error uploading image: {str(e)}"
        )

@router.delete("/me/profile-image", response_model=schemas.User)
def delete_profile_image(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete the profile image of the current user.
    """
    try:
        # Check if user has a profile image
        if not current_user.profile_image:
            raise HTTPException(
                status_code=400,
                detail="No profile image to delete.",
            )
        
        print(f"Deleting profile image for user {current_user.id}: {current_user.profile_image}")
        
        # Delete the image from Cloudinary
        delete_result = delete_image(current_user.profile_image)
        
        if not delete_result:
            # Even if Cloudinary deletion fails, we should still remove the reference
            # from the user's profile, but log the issue
            print(f"Warning: Failed to delete image from Cloudinary: {current_user.profile_image}")
        else:
            print(f"Successfully deleted image from Cloudinary")
        
        # Update user profile to remove image URL
        print(f"Removing profile image reference from user {current_user.id}")
        user = crud.user.remove_profile_image(db, db_user=current_user)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_profile_image: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting profile image: {str(e)}"
        )

@router.get("/me", response_model=schemas.User)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = crud.user.get_user_by_id(db, id=user_id)
    if user == current_user:
        return user
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user.
    """
    user = crud.user.get_user_by_id(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    user = crud.user.update_user(db, db_user=user, user_in=user_in)
    return user 