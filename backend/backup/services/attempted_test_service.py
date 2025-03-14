from typing import Optional, List, Dict, Any
from ..models.attempted_test import AttemptedTest
from ..schemas.attempted_test import TestSubmission, TestUpdate
from ..utils.api_error import NotFoundError, BadRequestError
from bson import ObjectId

class AttemptedTestService:
    @staticmethod
    async def submit_test(test_data: TestSubmission, user_id: str) -> Dict[str, Any]:
        """Submit a new test attempt."""
        test_dict = test_data.dict()
        test_dict["userId"] = user_id

        result = await AttemptedTest.insert_one(test_dict)
        created_test = await AttemptedTest.find_one({"_id": result.inserted_id})
        if not created_test:
            raise BadRequestError("Failed to submit test")
        return created_test

    @staticmethod
    async def get_user_test_analysis(
        user_id: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get test analysis for a user."""
        tests = await AttemptedTest.find_by_user(
            user_id=user_id,
            skip=skip,
            limit=limit
        )
        return tests

    @staticmethod
    async def update_test_results(
        test_id: str,
        user_id: str,
        test_update: TestUpdate
    ) -> Dict[str, Any]:
        """Update test results."""
        # Check if test exists and belongs to user
        existing_test = await AttemptedTest.find_one({
            "_id": test_id,
            "userId": user_id
        })
        if not existing_test:
            raise NotFoundError("Test not found or access denied")

        # Update test
        update_data = test_update.dict(exclude_unset=True)
        if update_data:
            await AttemptedTest.update_one(
                {"_id": test_id},
                {"$set": update_data}
            )

        updated_test = await AttemptedTest.find_one({"_id": test_id})
        return updated_test

    @staticmethod
    async def delete_test_results(test_id: str, user_id: str) -> bool:
        """Delete test results."""
        # Check if test exists and belongs to user
        existing_test = await AttemptedTest.find_one({
            "_id": test_id,
            "userId": user_id
        })
        if not existing_test:
            raise NotFoundError("Test not found or access denied")

        # Delete test
        result = await AttemptedTest.delete_one({"_id": test_id})
        return bool(result.deleted_count)

    @staticmethod
    async def get_test_statistics(user_id: str) -> Dict[str, Any]:
        """Get test statistics for a user."""
        collection = await AttemptedTest.get_collection()
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": None,
                "totalTests": {"$sum": 1},
                "averageScore": {"$avg": "$totalMarks"},
                "totalQuestions": {"$sum": "$totalQuestions"},
                "totalCorrect": {"$sum": "$correctAnswers"},
                "totalWrong": {"$sum": "$wrongAnswers"},
                "averageTime": {"$avg": "$timeTaken"}
            }}
        ]
        
        result = await collection.aggregate(pipeline).to_list(length=1)
        if not result:
            return {
                "totalTests": 0,
                "averageScore": 0,
                "totalQuestions": 0,
                "totalCorrect": 0,
                "totalWrong": 0,
                "averageTime": 0
            }
        
        stats = result[0]
        stats.pop("_id")
        return stats 