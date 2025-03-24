from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps
from app.core import security
from app.core.config import settings, Settings
from app.core.security import get_password_hash
from app.utils import (
    generate_password_reset_token,
    verify_password_reset_token,
)
from app.db.database import get_db
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse
from app.utils.email import send_reset_password_email
import logging

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()
settings = Settings()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id)}
    )
    refresh_token = auth_service.create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    """
    try:
        user_service = UserService(db)
        user = await user_service.create_user(user_data)
        return user
    except HTTPException as e:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise e
    except Exception as e:
        # Log the unexpected error
        logger.error(f"Error during user registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )

@router.post("/login", response_model=schemas.Token)
async def login_access_token(
    response: Response,
    db: AsyncSession = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Stores tokens in cookies for seamless authentication.
    """
    user = await crud.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        data={"sub": str(user.id)}, expires_delta=refresh_token_expires
    )
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,  # Don't include Bearer prefix in cookie
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + access_token_expires).timestamp()),
        samesite="none",  # Allow cross-origin requests
        secure=True,  # Required for SameSite=None
        domain="localhost",  # Use localhost as the domain
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # Convert days to seconds
        expires=int((datetime.utcnow() + refresh_token_expires).timestamp()),
        samesite="none",  # Allow cross-origin requests
        secure=True,  # Required for SameSite=None
        domain="localhost",  # Use localhost as the domain
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
    }

@router.post("/refresh-token", response_model=schemas.Token)
async def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None),
    refresh_token_body: schemas.RefreshToken = None,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Refresh access token using a valid refresh token from either cookie or request body.
    """
    # Try to get refresh token from cookie first, then from request body
    token = refresh_token
    if not token and refresh_token_body:
        token = refresh_token_body.refresh_token
    
    if not token:
        raise HTTPException(
            status_code=401, 
            detail="Refresh token is required"
        )
    
    user_id = security.verify_refresh_token(token)
    if not user_id:
        # Clear invalid cookies
        response.delete_cookie("access_token", domain="localhost", samesite="none", secure=True)
        response.delete_cookie("refresh_token", domain="localhost", samesite="none", secure=True)
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = await crud.get_user_by_id(db, id=int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    new_refresh_token = security.create_refresh_token(
        data={"sub": str(user.id)}, expires_delta=refresh_token_expires
    )
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,  # Don't include Bearer prefix in cookie
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + access_token_expires).timestamp()),
        samesite="none",  # Allow cross-origin requests
        secure=True,  # Required for SameSite=None
        domain="localhost",  # Use localhost as the domain
    )
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + refresh_token_expires).timestamp()),
        samesite="none",  # Allow cross-origin requests
        secure=True,  # Required for SameSite=None
        domain="localhost",  # Use localhost as the domain
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }

@router.post("/logout")
async def logout(response: Response) -> dict:
    """
    Logout user by clearing cookies
    """
    response.delete_cookie(
        key="access_token",
        domain="localhost",
        samesite="none",
        secure=True
    )
    response.delete_cookie(
        key="refresh_token",
        domain="localhost",
        samesite="none",
        secure=True
    )
    return {"message": "Successfully logged out"}

@router.post("/login/test-token", response_model=schemas.User)
async def test_token(current_user = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user

@router.post("/password-recovery/{email}", response_model=schemas.Msg)
async def recover_password(email: str, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Password Recovery
    """
    user = await crud.get_user_by_email(db, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    password_reset_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    )
    await send_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    return {"msg": "Password recovery email sent", "token": password_reset_token}

@router.post("/reset-password/", response_model=schemas.Msg)
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Reset password
    """
    user_id = verify_password_reset_token(token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user = await crud.get_user_by_id(db, id=int(user_id))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    
    await crud.update_user(
        db, db_user=user, user_in=schemas.UserUpdate(password=new_password)
    )
    return {"msg": "Password updated successfully"}