from typing import Optional, List
from sqlalchemy.orm import Session
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    async def create(self, user_data: UserCreate) -> User:
        db_user = User(**user_data.dict())
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def get_by_id(self, user_id: int) -> Optional[User]:
        return await self.db.query(User).filter(User.id == user_id).first()

    async def get_by_email(self, email: str) -> Optional[User]:
        return await self.db.query(User).filter(User.email == email).first()

    async def get_all(self) -> List[User]:
        return await self.db.query(User).all()

    async def update(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if not user:
            return None

        for field, value in user_data.dict(exclude_unset=True).items():
            setattr(user, field, value)

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id)
        if not user:
            return False

        await self.db.delete(user)
        await self.db.commit()
        return True 