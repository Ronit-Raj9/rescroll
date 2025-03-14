from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: Union[UserUpdate, Dict[str, Any]]) -> User:
    if isinstance(user_in, dict):
        update_data = user_in
    else:
        update_data = user_in.dict(exclude_unset=True)
    
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
    
    for field in update_data:
        setattr(db_user, field, update_data[field])
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile_image(db: Session, db_user: User, image_url: str) -> User:
    db_user.profile_image = image_url
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def remove_profile_image(db: Session, db_user: User) -> User:
    """
    Remove the profile image URL from a user record.
    
    Args:
        db: Database session
        db_user: User object to update
        
    Returns:
        Updated User object
    """
    db_user.profile_image = None
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def is_active(user: User) -> bool:
    return user.is_active

def is_superuser(user: User) -> bool:
    return user.is_superuser 