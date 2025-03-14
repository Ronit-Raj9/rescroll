from typing import Any, Optional, Union
import json
from datetime import datetime, timedelta
from app.db.redis import redis_client

class CacheService:
    def __init__(self):
        self.redis = redis_client

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set value in cache with optional expiration in seconds"""
        try:
            await self.redis.set(key, json.dumps(value), ex=expire)
            return True
        except Exception:
            return False

    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            await self.redis.delete(key)
            return True
        except Exception:
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        return bool(await self.redis.exists(key))

    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment value in cache"""
        return await self.redis.incr(key, amount)

    async def decrement(self, key: str, amount: int = 1) -> int:
        """Decrement value in cache"""
        return await self.redis.decr(key, amount)

    async def set_many(self, mapping: dict, expire: Optional[int] = None) -> bool:
        """Set multiple key-value pairs in cache"""
        try:
            await self.redis.mset({k: json.dumps(v) for k, v in mapping.items()})
            if expire:
                for key in mapping:
                    await self.redis.expire(key, expire)
            return True
        except Exception:
            return False

    async def get_many(self, keys: list) -> dict:
        """Get multiple values from cache"""
        values = await self.redis.mget(keys)
        return {k: json.loads(v) for k, v in zip(keys, values) if v is not None}

    async def delete_many(self, keys: list) -> bool:
        """Delete multiple keys from cache"""
        try:
            await self.redis.delete(*keys)
            return True
        except Exception:
            return False

    async def set_with_version(self, key: str, value: Any, version: str,
                             expire: Optional[int] = None) -> bool:
        """Set value in cache with version"""
        versioned_key = f"{key}:v{version}"
        return await self.set(versioned_key, value, expire)

    async def get_with_version(self, key: str, version: str) -> Optional[Any]:
        """Get value from cache with version"""
        versioned_key = f"{key}:v{version}"
        return await self.get(versioned_key)

    async def cache_paper(self, paper_id: str, paper_data: dict, expire: int = 3600) -> bool:
        """Cache paper data with 1 hour expiration"""
        key = f"paper:{paper_id}"
        return await self.set(key, paper_data, expire)

    async def get_cached_paper(self, paper_id: str) -> Optional[dict]:
        """Get cached paper data"""
        key = f"paper:{paper_id}"
        return await self.get(key)

    async def cache_trending_papers(self, papers: list, expire: int = 3600) -> bool:
        """Cache trending papers with 1 hour expiration"""
        key = "trending:papers"
        return await self.set(key, papers, expire)

    async def get_cached_trending_papers(self) -> Optional[list]:
        """Get cached trending papers"""
        key = "trending:papers"
        return await self.get(key)

    async def cache_user_preferences(self, user_id: int, preferences: dict,
                                   expire: int = 86400) -> bool:
        """Cache user preferences with 24 hour expiration"""
        key = f"user:preferences:{user_id}"
        return await self.set(key, preferences, expire)

    async def get_cached_user_preferences(self, user_id: int) -> Optional[dict]:
        """Get cached user preferences"""
        key = f"user:preferences:{user_id}"
        return await self.get(key)

    async def cache_quiz(self, paper_id: str, quiz_data: dict, expire: int = 86400) -> bool:
        """Cache quiz data with 24 hour expiration"""
        key = f"quiz:{paper_id}"
        return await self.set(key, quiz_data, expire)

    async def get_cached_quiz(self, paper_id: str) -> Optional[dict]:
        """Get cached quiz data"""
        key = f"quiz:{paper_id}"
        return await self.get(key)

    async def increment_user_reading_time(self, user_id: int, minutes: int = 1) -> int:
        """Increment user's total reading time"""
        key = f"user:reading_time:{user_id}"
        return await self.increment(key, minutes)

    async def get_user_reading_time(self, user_id: int) -> int:
        """Get user's total reading time"""
        key = f"user:reading_time:{user_id}"
        value = await self.get(key)
        return value if value is not None else 0 