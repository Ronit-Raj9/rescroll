from typing import Optional, List, Dict, Any
from ..models.previous_year_paper import PreviousYearPaper
from ..models.question import Question
from ..schemas.previous_year_paper import PreviousYearPaperCreate
from ..utils.api_error import NotFoundError, BadRequestError
from bson import ObjectId

class PreviousYearPaperService:
    @staticmethod
    async def create_paper(paper_data: PreviousYearPaperCreate) -> Dict[str, Any]:
        """Create a new previous year paper."""
        # Validate that all question IDs exist
        for qid in paper_data.questionIds:
            question = await Question.find_one({"_id": qid})
            if not question:
                raise BadRequestError(f"Question with ID {qid} not found")

        paper_dict = paper_data.dict()
        result = await PreviousYearPaper.insert_one(paper_dict)
        created_paper = await PreviousYearPaper.find_one({"_id": result.inserted_id})
        if not created_paper:
            raise BadRequestError("Failed to create previous year paper")
        return created_paper

    @staticmethod
    async def get_papers(
        skip: int = 0,
        limit: int = 10,
        year: Optional[int] = None,
        subject: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get previous year papers with optional filters."""
        filter_dict = {}
        if year:
            filter_dict["year"] = year
        if subject:
            filter_dict["subject"] = subject

        papers = await PreviousYearPaper.find_many(filter_dict, skip=skip, limit=limit)
        return papers

    @staticmethod
    async def get_paper_by_id(paper_id: str) -> Dict[str, Any]:
        """Get a previous year paper by ID."""
        paper = await PreviousYearPaper.find_one({"_id": paper_id})
        if not paper:
            raise NotFoundError("Previous year paper not found")
        return paper

    @staticmethod
    async def get_paper_with_questions(paper_id: str) -> Dict[str, Any]:
        """Get a previous year paper with its questions."""
        # Get the paper
        paper = await PreviousYearPaper.find_one({"_id": paper_id})
        if not paper:
            raise NotFoundError("Previous year paper not found")

        # Get all questions for this paper
        questions = []
        for qid in paper["questionIds"]:
            question = await Question.find_one({"_id": qid})
            if question:
                questions.append(question)

        # Add questions to paper data
        paper["questions"] = questions
        return paper

    @staticmethod
    async def get_papers_by_subject(
        subject: str,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get all papers for a specific subject."""
        papers = await PreviousYearPaper.find_many(
            {"subject": subject},
            skip=skip,
            limit=limit
        )
        return papers

    @staticmethod
    async def get_papers_by_year(
        year: int,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get all papers for a specific year."""
        papers = await PreviousYearPaper.find_many(
            {"year": year},
            skip=skip,
            limit=limit
        )
        return papers 