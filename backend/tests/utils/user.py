from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate
import uuid

def create_random_user(
    db: AsyncSession,
    *,
    email: Optional[str] = None,
    password: Optional[str] = None,
    full_name: Optional[str] = None,
    is_active: bool = True,
    is_superuser: bool = False,
) -> User:
    """
    Create a random user for testing.
    """
    if email is None:
        email = f"test{uuid.uuid4().hex[:8]}@example.com"
    if password is None:
        password = "testpass123"
    if full_name is None:
        full_name = f"Test User {uuid.uuid4().hex[:8]}"

    user_in = UserCreate(
        email=email,
        password=password,
        full_name=full_name,
        is_active=is_active,
        is_superuser=is_superuser,
    )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user 