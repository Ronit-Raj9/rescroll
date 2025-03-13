from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.test import Test
from ..models.question import Question
from ..utils.api_error import NotFoundError, BadRequestError
from bson import ObjectId

class TestService:
    @staticmethod
    async def create_test(test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new test."""
        # Validate that all question IDs exist
        for qid in test_data.get("questionIds", []):
            question = await Question.find_one({"_id": qid})
            if not question:
                raise BadRequestError(f"Question with ID {qid} not found")

        # Set timestamps
        test_data["createdAt"] = datetime.utcnow()
        test_data["updatedAt"] = datetime.utcnow()

        result = await Test.insert_one(test_data)
        created_test = await Test.find_one({"_id": result.inserted_id})
        if not created_test:
            raise BadRequestError("Failed to create test")
        return created_test

    @staticmethod
    async def get_tests(
        skip: int = 0,
        limit: int = 10,
        subject: Optional[str] = None,
        test_type: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get tests with optional filters."""
        filter_dict = {}
        if subject:
            filter_dict["subject"] = subject
        if test_type:
            filter_dict["testType"] = test_type
        if difficulty:
            filter_dict["difficulty"] = difficulty

        tests = await Test.find_many(filter_dict, skip=skip, limit=limit)
        return tests

    @staticmethod
    async def get_test_by_id(test_id: str) -> Dict[str, Any]:
        """Get a test by ID."""
        test = await Test.find_one({"_id": test_id})
        if not test:
            raise NotFoundError("Test not found")
        return test

    @staticmethod
    async def get_test_with_questions(test_id: str) -> Dict[str, Any]:
        """Get a test with its questions."""
        # Get the test
        test = await Test.find_one({"_id": test_id})
        if not test:
            raise NotFoundError("Test not found")

        # Get all questions for this test
        questions = []
        for qid in test["questionIds"]:
            question = await Question.find_one({"_id": qid})
            if question:
                questions.append(question)

        # Add questions to test data
        test["questions"] = questions
        return test

    @staticmethod
    async def update_test(test_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a test."""
        # Validate question IDs if they're being updated
        if "questionIds" in update_data:
            for qid in update_data["questionIds"]:
                question = await Question.find_one({"_id": qid})
                if not question:
                    raise BadRequestError(f"Question with ID {qid} not found")

        update_data["updatedAt"] = datetime.utcnow()

        result = await Test.update_one(
            {"_id": test_id},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise NotFoundError("Test not found")

        updated_test = await Test.find_one({"_id": test_id})
        return updated_test

    @staticmethod
    async def delete_test(test_id: str) -> bool:
        """Delete a test."""
        result = await Test.delete_one({"_id": test_id})
        return result.deleted_count > 0

    @staticmethod
    async def get_tests_by_subject(
        subject: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get all tests for a specific subject."""
        tests = await Test.find_many(
            {"subject": subject},
            skip=skip,
            limit=limit
        )
        return tests

    @staticmethod
    async def get_tests_by_type(
        test_type: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get all tests of a specific type."""
        tests = await Test.find_many(
            {"testType": test_type},
            skip=skip,
            limit=limit
        )
        return tests 