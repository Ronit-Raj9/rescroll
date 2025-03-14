from typing import Optional, List, Dict, Any
from ..models.question import Question
from ..schemas.question import QuestionCreate, QuestionUpdate
from ..utils.api_error import NotFoundError, BadRequestError
from bson import ObjectId

class QuestionService:
    @staticmethod
    async def create_question(question_data: QuestionCreate) -> Dict[str, Any]:
        """Create a new question."""
        question_dict = question_data.dict()
        result = await Question.insert_one(question_dict)
        created_question = await Question.find_one({"_id": result.inserted_id})
        if not created_question:
            raise BadRequestError("Failed to create question")
        return created_question

    @staticmethod
    async def get_questions(
        skip: int = 0,
        limit: int = 10,
        subject: Optional[str] = None,
        topic: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get questions with optional filters."""
        filter_dict = {}
        if subject:
            filter_dict["subject"] = subject
        if topic:
            filter_dict["topic"] = topic
        if difficulty:
            filter_dict["difficulty"] = difficulty

        questions = await Question.find_many(filter_dict, skip=skip, limit=limit)
        return questions

    @staticmethod
    async def get_question_by_id(question_id: str) -> Dict[str, Any]:
        """Get a question by ID."""
        question = await Question.find_one({"_id": question_id})
        if not question:
            raise NotFoundError("Question not found")
        return question

    @staticmethod
    async def update_question(question_id: str, question_data: QuestionUpdate) -> Dict[str, Any]:
        """Update a question."""
        # Check if question exists
        existing_question = await Question.find_one({"_id": question_id})
        if not existing_question:
            raise NotFoundError("Question not found")

        # Update question
        update_data = question_data.dict(exclude_unset=True)
        if update_data:
            await Question.update_one(
                {"_id": question_id},
                {"$set": update_data}
            )

        updated_question = await Question.find_one({"_id": question_id})
        return updated_question

    @staticmethod
    async def delete_question(question_id: str) -> bool:
        """Delete a question."""
        # Check if question exists
        existing_question = await Question.find_one({"_id": question_id})
        if not existing_question:
            raise NotFoundError("Question not found")

        # Delete question
        result = await Question.delete_one({"_id": question_id})
        return bool(result.deleted_count)

    @staticmethod
    async def get_questions_by_ids(question_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple questions by their IDs."""
        questions = []
        for qid in question_ids:
            question = await Question.find_one({"_id": qid})
            if question:
                questions.append(question)
        return questions 