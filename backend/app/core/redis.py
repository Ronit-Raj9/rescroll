from typing import Optional
from redis import Redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_redis_client(
    db: int = 0,
    host: Optional[str] = None,
    port: Optional[int] = None,
    password: Optional[str] = None,
    decode_responses: bool = True
) -> Redis:
    """
    Get Redis client with specified configuration.
    """
    try:
        client = Redis(
            host=host or settings.REDIS_HOST,
            port=port or settings.REDIS_PORT,
            db=db,
            password=password or settings.REDIS_PASSWORD,
            decode_responses=decode_responses,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True
        )
        # Test connection
        client.ping()
        return client
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {str(e)}")
        raise 