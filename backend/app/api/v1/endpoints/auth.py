from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
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
from app.models.test_user import TestUser

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
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
        return user
    except Exception as e:
        # Log the error
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}",
        )

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    response: Response,
    db: Session = Depends(deps.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
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
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
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
def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None),
    refresh_token_body: schemas.RefreshToken = None,
    db: Session = Depends(deps.get_db),
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
    
    user = crud.get_user_by_id(db, id=int(user_id))
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
def logout(response: Response) -> dict:
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
def test_token(current_user = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user

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
    user_id = verify_password_reset_token(token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_id(db, id=int(user_id))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    elif not crud.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    return {"msg": "Password updated successfully"}

@router.post("/test-register", response_model=dict)
def test_register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Test endpoint to register a user using the TestUser model.
    """
    try:
        # Check if user with this email already exists
        user = db.query(TestUser).filter(TestUser.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists.",
            )
        
        # Check if user with this username already exists
        user = db.query(TestUser).filter(TestUser.username == user_in.username).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this username already exists.",
            )
        
        # Create the user
        hashed_password = get_password_hash(user_in.password)
        db_user = TestUser(
            email=user_in.email,
            username=user_in.username,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_active=True,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "full_name": db_user.full_name,
            "is_active": db_user.is_active,
            "is_superuser": db_user.is_superuser,
        }
    except Exception as e:
        # Log the error
        print(f"Error in test_register endpoint: {str(e)}")
        # Re-raise the exception with more details
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during test registration: {str(e)}",
        )

@router.get("/test", response_model=dict)
def test_endpoint() -> Any:
    """
    Test endpoint to check if the API is working correctly.
    """
    return {"status": "ok", "message": "Auth API is working correctly"}