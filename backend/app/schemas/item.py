from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ItemResponse(ItemBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    } 