from typing import Generator, Optional
import logging
from fastapi import Depends, HTTPException, status, Cookie, Header, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal

# Set up logger
logger = logging.getLogger("root")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/oauth",
    auto_error=False
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_token_from_cookie_or_header(
    request: Request,
    access_token_cookie: Optional[str] = Cookie(None, alias="access_token"),
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[str]:
    """
    Extract token from cookie or authorization header.
    Priority: 1. Authorization header, 2. Cookie, 3. OAuth2 scheme
    """
    logger.debug(f"Authorization header: {authorization}")
    logger.debug(f"Cookie: {access_token_cookie}")
    logger.debug(f"OAuth2 token: {token}")
    logger.debug(f"Request cookies: {request.cookies}")
    
    # First check Authorization header
    if authorization and authorization.startswith("Bearer "):
        token_from_header = authorization.replace("Bearer ", "")
        logger.debug(f"Using token from Authorization header: {token_from_header[:10]}...")
        return token_from_header
    
    # Then check cookie
    if access_token_cookie:
        # Handle quoted strings in cookies
        if access_token_cookie.startswith('"') and access_token_cookie.endswith('"'):
            access_token_cookie = access_token_cookie[1:-1]
            logger.debug("Removed quotes from cookie")
        
        logger.debug(f"Using token from cookie: {access_token_cookie[:10]}...")
        return access_token_cookie
    
    # Check request cookies directly
    if "access_token" in request.cookies:
        cookie_value = request.cookies["access_token"]
        logger.debug(f"Using token from request cookies: {cookie_value[:10]}...")
        return cookie_value
    
    # Finally use OAuth2 scheme
    if token:
        logger.debug(f"Using token from OAuth2 scheme: {token[:10]}...")
    else:
        logger.debug("No token found")
    return token

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_cookie_or_header)
) -> models.User:
    logger.debug(f"Token in get_current_user: {token}")
    
    if not token:
        logger.debug("No token provided, raising 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        logger.debug(f"Decoding token: {token[:10]}...")
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        logger.debug(f"Token payload: {payload}")
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.get_user_by_id(db, user_id=int(token_data.sub))
    if not user:
        logger.error(f"User not found for ID: {token_data.sub}")
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.debug(f"User found: {user.email}")
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    if not crud.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user 