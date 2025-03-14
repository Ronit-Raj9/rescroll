from typing import AsyncGenerator

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

# Global database instance
try:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DB_NAME]
except Exception as e:
    print(f"Failed to connect to MongoDB Atlas: {e}")
    print("Falling back to local MongoDB...")
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client[settings.DB_NAME]

async def get_database() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    try:
        yield db
    finally:
        client.close() 