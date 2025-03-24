import json
from typing import Any, Optional, Union, List
from redis import Redis
from app.core.config import settings
from app.core.redis import get_redis_client
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

class RedisCache:
    def __init__(self, db: int = 0):
        self.redis = get_redis_client(db=db)
        self.default_ttl = 3600  # 1 hour default

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        """
        try:
            value = self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Error getting from cache: {str(e)}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        expire: Union[int, timedelta] = None
    ) -> bool:
        """
        Set value in cache with expiration.
        """
        try:
            if isinstance(expire, timedelta):
                expire = int(expire.total_seconds())
            expire = expire or self.default_ttl
            
            return self.redis.setex(
                key,
                expire,
                json.dumps(value)
            )
        except Exception as e:
            logger.error(f"Error setting cache: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete value from cache.
        """
        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            logger.error(f"Error deleting from cache: {str(e)}")
            return False

    async def clear_pattern(self, pattern: str) -> bool:
        """
        Clear all keys matching pattern.
        """
        try:
            keys = self.redis.keys(pattern)
            if keys:
                return bool(self.redis.delete(*keys))
            return True
        except Exception as e:
            logger.error(f"Error clearing cache pattern: {str(e)}")
            return False

    async def exists(self, key: str) -> bool:
        """
        Check if key exists in cache.
        """
        try:
            return bool(self.redis.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache existence: {str(e)}")
            return False

    async def ttl(self, key: str) -> Optional[int]:
        """
        Get time to live for key.
        """
        try:
            return self.redis.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL: {str(e)}")
            return None

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """
        Increment value in cache.
        """
        try:
            return self.redis.incr(key, amount)
        except Exception as e:
            logger.error(f"Error incrementing cache: {str(e)}")
            return None

    async def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """
        Decrement value in cache.
        """
        try:
            return self.redis.decr(key, amount)
        except Exception as e:
            logger.error(f"Error decrementing cache: {str(e)}")
            return None

    async def get_many(self, keys: List[str]) -> dict:
        """
        Get multiple values from cache.
        """
        try:
            values = self.redis.mget(keys)
            return {
                key: json.loads(value) if value else None
                for key, value in zip(keys, values)
            }
        except Exception as e:
            logger.error(f"Error getting multiple from cache: {str(e)}")
            return {}

    async def set_many(
        self,
        mapping: dict,
        expire: Union[int, timedelta] = None
    ) -> bool:
        """
        Set multiple values in cache.
        """
        try:
            if isinstance(expire, timedelta):
                expire = int(expire.total_seconds())
            expire = expire or self.default_ttl

            pipeline = self.redis.pipeline()
            for key, value in mapping.items():
                pipeline.setex(
                    key,
                    expire,
                    json.dumps(value)
                )
            return all(pipeline.execute())
        except Exception as e:
            logger.error(f"Error setting multiple in cache: {str(e)}")
            return False

    async def delete_many(self, keys: List[str]) -> bool:
        """
        Delete multiple values from cache.
        """
        try:
            return bool(self.redis.delete(*keys))
        except Exception as e:
            logger.error(f"Error deleting multiple from cache: {str(e)}")
            return False

# Create cache instances for different purposes
paper_cache = RedisCache(db=0)  # For paper data
user_cache = RedisCache(db=1)   # For user data
session_cache = RedisCache(db=2)  # For session data
rate_limit_cache = RedisCache(db=3)  # For rate limiting 