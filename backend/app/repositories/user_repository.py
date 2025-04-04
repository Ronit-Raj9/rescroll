from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate
from uuid import UUID
from fastapi import HTTPException, status

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_data: UserCreate) -> User:
        try:
            # Only include valid fields from the model
            user_dict = user_data.model_dump(exclude_unset=True)
            
            # Remove password as we need to hash it separately
            if "password" in user_dict:
                user_dict.pop("password")
                
            db_user = User(**user_dict)
            
            # Set hashed password if provided
            if hasattr(user_data, "password") and user_data.password:
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                db_user.hashed_password = pwd_context.hash(user_data.password)
                
            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)
            return db_user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        try:
            query = select(User).where(User.id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving user: {str(e)}"
            )

    async def get_by_email(self, email: str) -> Optional[User]:
        try:
            query = select(User).where(User.email == email)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving user by email: {str(e)}"
            )
            
    async def get_by_username(self, username: str) -> Optional[User]:
        try:
            query = select(User).where(User.username == username)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving user by username: {str(e)}"
            )

    async def get_all(self) -> List[User]:
        try:
            query = select(User)
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving users: {str(e)}"
            )

    async def update(self, user_id: UUID, user_data: UserUpdate) -> Optional[User]:
        try:
            user = await self.get_by_id(user_id)
            if not user:
                return None

            update_data = user_data.model_dump(exclude_unset=True)
            
            # Handle password separately for hashing
            if "password" in update_data:
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                user.hashed_password = pwd_context.hash(update_data.pop("password"))

            for field, value in update_data.items():
                setattr(user, field, value)

            await self.db.commit()
            await self.db.refresh(user)
            return user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating user: {str(e)}"
            )

    async def delete(self, user_id: UUID) -> bool:
        try:
            user = await self.get_by_id(user_id)
            if not user:
                return False

            await self.db.delete(user)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting user: {str(e)}"
            ) 