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
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
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
    print(f"DEBUG - Authorization header: {authorization}")
    print(f"DEBUG - Cookie: {access_token_cookie}")
    print(f"DEBUG - OAuth2 token: {token}")
    print(f"DEBUG - Request cookies: {request.cookies}")
    
    logger.info(f"DEBUG - Authorization header: {authorization}")
    logger.info(f"DEBUG - Cookie: {access_token_cookie}")
    logger.info(f"DEBUG - OAuth2 token: {token}")
    logger.info(f"DEBUG - Request cookies: {request.cookies}")
    
    # First check Authorization header
    if authorization and authorization.startswith("Bearer "):
        token_from_header = authorization.replace("Bearer ", "")
        print(f"DEBUG - Using token from Authorization header: {token_from_header[:10]}...")
        logger.info(f"DEBUG - Using token from Authorization header: {token_from_header[:10]}...")
        return token_from_header
    
    # Then check cookie
    if access_token_cookie:
        # Handle quoted strings in cookies
        if access_token_cookie.startswith('"') and access_token_cookie.endswith('"'):
            access_token_cookie = access_token_cookie[1:-1]
            print(f"DEBUG - Removed quotes from cookie")
            logger.info(f"DEBUG - Removed quotes from cookie")
        
        # Don't look for Bearer prefix in cookies anymore
        print(f"DEBUG - Using token from cookie: {access_token_cookie[:10]}...")
        logger.info(f"DEBUG - Using token from cookie: {access_token_cookie[:10]}...")
        return access_token_cookie
    
    # Check request cookies directly
    if "access_token" in request.cookies:
        cookie_value = request.cookies["access_token"]
        print(f"DEBUG - Using token from request cookies: {cookie_value[:10]}...")
        logger.info(f"DEBUG - Using token from request cookies: {cookie_value[:10]}...")
        return cookie_value
    
    # Finally use OAuth2 scheme
    if token:
        print(f"DEBUG - Using token from OAuth2 scheme: {token[:10]}...")
        logger.info(f"DEBUG - Using token from OAuth2 scheme: {token[:10]}...")
    else:
        print("DEBUG - No token found")
        logger.info("DEBUG - No token found")
    return token

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_cookie_or_header)
) -> models.User:
    print(f"DEBUG - Token in get_current_user: {token}")
    logger.info(f"DEBUG - Token in get_current_user: {token}")
    
    if not token:
        print("DEBUG - No token provided, raising 401")
        logger.info("DEBUG - No token provided, raising 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        print(f"DEBUG - Decoding token: {token[:10]}...")
        logger.info(f"DEBUG - Decoding token: {token[:10]}...")
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        print(f"DEBUG - Token payload: {payload}")
        logger.info(f"DEBUG - Token payload: {payload}")
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        print(f"DEBUG - Token validation error: {str(e)}")
        logger.info(f"DEBUG - Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = crud.get_user_by_id(db, id=token_data.sub)
    if not user:
        print(f"DEBUG - User not found for ID: {token_data.sub}")
        logger.info(f"DEBUG - User not found for ID: {token_data.sub}")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"DEBUG - User found: {user.email}")
    logger.info(f"DEBUG - User found: {user.email}")
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user 