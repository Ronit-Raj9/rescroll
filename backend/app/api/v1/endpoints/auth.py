from datetime import timedelta, datetime
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.utils import (
    generate_password_reset_token,
    verify_password_reset_token,
)

router = APIRouter()

@router.post("/register")
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Dict[str, Any]:
    """
    Register a new user.
    """
    try:
        # Check if user with this email already exists
        user = crud.get_user_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists.",
            )
        
        # Check if user with this username already exists
        user = crud.get_user_by_username(db, username=user_in.username)
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this username already exists.",
            )
        
        # Create the user
        user = crud.create_user(db, user=user_in)
        
        # Convert to dictionary for response
        user_data = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "profile_image": user.profile_image,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
            
        return user_data
    except Exception as e:
        # Log the error
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}",
        )

@router.post("/login/oauth")
def login_oauth(
    response: Response,
    db: Session = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Dict[str, Any]:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Stores tokens in cookies for seamless authentication.
    """
    user = crud.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Set cookies with updated settings
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + access_token_expires).timestamp()),
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + refresh_token_expires).timestamp()),
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "profile_image": user.profile_image,
        }
    }

@router.post("/login")
async def login(
    response: Response,
    db: Session = Depends(deps.get_db),
    user_login: schemas.UserLogin = Body(...),
) -> Dict[str, Any]:
    """
    Login with email and password in JSON request body.
    Stores tokens in cookies for seamless authentication.
    """
    user = crud.authenticate_user(db, email=user_login.email, password=user_login.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Set cookies - adjust for local development
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + access_token_expires).timestamp()),
        samesite="lax",
        secure=settings.COOKIE_SECURE,  # Use the setting from config
        path="/",  # Make cookie available for all paths
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + refresh_token_expires).timestamp()),
        samesite="lax",
        secure=settings.COOKIE_SECURE,  # Use the setting from config
        path="/",  # Make cookie available for all paths
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "profile_image": user.profile_image,
        }
    }

@router.post("/refresh-token")
def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None),
    refresh_token_body: schemas.RefreshToken = None,
    db: Session = Depends(deps.get_db),
) -> Dict[str, Any]:
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
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = crud.get_user_by_id(db, user_id=int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    new_refresh_token = security.create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Set cookies with updated settings
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + access_token_expires).timestamp()),
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        expires=int((datetime.utcnow() + refresh_token_expires).timestamp()),
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }

@router.post("/logout")
def logout(response: Response) -> Dict[str, Any]:
    """
    Logout user by clearing cookies.
    """
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    
    return {"msg": "Successfully logged out"}

@router.get("/login/test-token")
def test_token(current_user = Depends(deps.get_current_user)) -> Dict[str, Any]:
    """
    Test access token
    """
    # Convert to dictionary for response
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "profile_image": current_user.profile_image,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }
        
    return user_data

@router.post("/password-recovery/{email}", response_model=schemas.Msg)
def recover_password(email: str, db: Session = Depends(deps.get_db)) -> Any:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(db, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    password_reset_token = security.create_access_token(
        user.id, expires_delta=timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    )
    # send_reset_password_email(
    #     email_to=user.email, email=email, token=password_reset_token
    # )
    return {"msg": "Password recovery email sent"}

@router.post("/reset-password/", response_model=schemas.Msg)
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset password
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    if not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    crud.update_user(
        db, 
        db_user=user, 
        user_in=schemas.UserUpdate(password=new_password)
    )
    
    return {"msg": "Password updated successfully"}

@router.get("/test", response_model=dict)
def test_endpoint() -> Any:
    """
    Test endpoint.
    """
    return {"msg": "Test endpoint working"}