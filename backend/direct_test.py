import asyncio
import asyncpg
import logging
import ssl
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_direct_connection():
    try:
        # Create SSL context
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Connect directly using asyncpg
        conn = await asyncpg.connect(
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            database=os.getenv("POSTGRES_DB"),
            host=os.getenv("POSTGRES_SERVER"),
            port=os.getenv("POSTGRES_PORT"),
            ssl=ssl_context
        )
        
        # Test the connection
        value = await conn.fetchval("SELECT 1")
        logger.info(f"Direct connection successful! Result: {value}")
        
        # Close the connection
        await conn.close()
        return True
    except Exception as e:
        logger.error(f"Direct connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_direct_connection()) 