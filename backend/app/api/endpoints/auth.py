from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.utils import verify_password_reset_token

router = APIRouter()


@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "refresh_token": security.create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
    }


@router.post("/refresh-token", response_model=schemas.Token)
def refresh_access_token(
    db: Session = Depends(deps.get_db), 
    refresh_token: schemas.RefreshToken = Body(...)
) -> Any:
    """
    Refresh access token using a valid refresh token
    """
    user_id = security.verify_refresh_token(refresh_token.refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = crud.user.get_user_by_id(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "refresh_token": security.create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
    }


@router.post("/login/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}", response_model=schemas.Msg)
def recover_password(email: str, db: Session = Depends(deps.get_db)) -> Any:
    """
    Password Recovery
    """
    user = crud.user.get_user_by_email(db, email=email)

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
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset password
    """
    user_id = verify_password_reset_token(token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.user.get_user_by_id(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    elif not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    return {"msg": "Password updated successfully"}


@router.post("/register", response_model=schemas.User)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Register a new user.
    """
    user = crud.user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    username_exists = crud.user.get_user_by_username(db, username=user_in.username)
    if username_exists:
        raise HTTPException(
            status_code=400,
            detail="The username is already taken.",
        )
    
    user = crud.user.create_user(db, user=user_in)
    return user 