from typing import Generator, Optional, Annotated
import logging
from fastapi import Depends, HTTPException, status, Cookie, Header, Request, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.database import get_db_dependency, SessionLocal
from app.core.db import supabase

# Set up logger
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

# JWT token dependency
async def get_token_from_cookie_or_header(
    session: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    """Extract token from cookie or header."""
    token = None
    
    # Try to get token from cookie
    if session:
        try:
            token = session
        except Exception as e:
            logger.error(f"Error parsing session cookie: {e}")
    
    # If not in cookie, try authorization header
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    return token

async def get_current_user(
    token: str = Depends(get_token_from_cookie_or_header),
    db: Session = Depends(get_db_dependency),
) -> models.User:
    """Get current user based on JWT token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.user.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Get current active superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

# Dependencies to export
db_dependency = Annotated[Session, Depends(get_db_dependency)]
current_user_dependency = Annotated[models.User, Depends(get_current_user)]
current_active_user_dependency = Annotated[models.User, Depends(get_current_active_user)] 