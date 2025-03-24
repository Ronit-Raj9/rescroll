from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate

class ItemService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_items(self, skip: int = 0, limit: int = 100) -> List[Item]:
        query = select(Item).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_item(self, item_id: int) -> Optional[Item]:
        query = select(Item).where(Item.id == item_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create_item(self, item_data: ItemCreate, owner_id: int) -> Item:
        db_item = Item(
            title=item_data.title,
            description=item_data.description,
            owner_id=owner_id
        )
        self.db.add(db_item)
        await self.db.commit()
        await self.db.refresh(db_item)
        return db_item

    async def update_item(self, item_id: int, item_data: ItemUpdate, owner_id: int) -> Optional[Item]:
        # First check if the item exists and belongs to the user
        item = await self.get_item(item_id)
        if not item or item.owner_id != owner_id:
            return None
        
        # Update the item
        update_data = item_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete_item(self, item_id: int, owner_id: int) -> bool:
        # First check if the item exists and belongs to the user
        item = await self.get_item(item_id)
        if not item or item.owner_id != owner_id:
            return False
        
        # Delete the item
        await self.db.delete(item)
        await self.db.commit()
        return True 