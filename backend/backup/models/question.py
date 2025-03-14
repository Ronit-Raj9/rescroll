from ..db.mongodb import db
from bson import ObjectId
from typing import Optional, Dict, Any
from datetime import datetime

class Question:
    collection = None

    @classmethod
    async def get_collection(cls):
        if not cls.collection:
            cls.collection = db.db.questions
            # Create indexes
            await cls.collection.create_index("subject")
            await cls.collection.create_index("topic")
            await cls.collection.create_index("difficulty")
        return cls.collection

    @classmethod
    async def find_one(cls, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        collection = await cls.get_collection()
        if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
            filter_dict["_id"] = ObjectId(filter_dict["_id"])
        return await collection.find_one(filter_dict)

    @classmethod
    async def find_many(cls, filter_dict: Dict[str, Any], skip: int = 0, limit: int = 100):
        collection = await cls.get_collection()
        cursor = collection.find(filter_dict).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    @classmethod
    async def insert_one(cls, document: Dict[str, Any]):
        collection = await cls.get_collection()
        document["createdAt"] = datetime.utcnow()
        document["updatedAt"] = datetime.utcnow()
        result = await collection.insert_one(document)
        return result

    @classmethod
    async def update_one(cls, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        collection = await cls.get_collection()
        if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
            filter_dict["_id"] = ObjectId(filter_dict["_id"])
        update_dict["$set"]["updatedAt"] = datetime.utcnow()
        result = await collection.update_one(filter_dict, update_dict)
        return result

    @classmethod
    async def delete_one(cls, filter_dict: Dict[str, Any]):
        collection = await cls.get_collection()
        if "_id" in filter_dict and isinstance(filter_dict["_id"], str):
            filter_dict["_id"] = ObjectId(filter_dict["_id"])
        result = await collection.delete_one(filter_dict)
        return result 