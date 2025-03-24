from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.core.security import get_token_data
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services.item_service import ItemService

router = APIRouter()

@router.get("/", response_model=List[ItemResponse])
async def get_items(
    skip: int = 0, 
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    item_service = ItemService(db)
    items = await item_service.get_items(skip=skip, limit=limit)
    return items

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: ItemCreate,
    token_data: dict = Depends(get_token_data),
    db: AsyncSession = Depends(get_db)
):
    item_service = ItemService(db)
    item = await item_service.create_item(
        item_data=item_data, 
        owner_id=int(token_data.get("sub"))
    )
    return item

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int, 
    db: AsyncSession = Depends(get_db)
):
    item_service = ItemService(db)
    item = await item_service.get_item(item_id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Item not found"
        )
    return item

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    item_data: ItemUpdate,
    token_data: dict = Depends(get_token_data),
    db: AsyncSession = Depends(get_db)
):
    item_service = ItemService(db)
    updated_item = await item_service.update_item(
        item_id=item_id,
        item_data=item_data,
        owner_id=int(token_data.get("sub"))
    )
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or you don't have permission to update it"
        )
    return updated_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    token_data: dict = Depends(get_token_data),
    db: AsyncSession = Depends(get_db)
):
    item_service = ItemService(db)
    result = await item_service.delete_item(
        item_id=item_id,
        owner_id=int(token_data.get("sub"))
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found or you don't have permission to delete it"
        )
    return None 