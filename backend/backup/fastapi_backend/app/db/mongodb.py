from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings
from loguru import logger

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    async def connect_to_database(self):
        logger.info("Connecting to MongoDB...")
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.DB_NAME]
        logger.info("Connected to MongoDB!")

    async def close_database_connection(self):
        logger.info("Closing MongoDB connection...")
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed!")

# Create a database instance
db = MongoDB()
