from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from ..schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from ..services.question_service import QuestionService
from ..middlewares.role_verify import verify_role
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.post("/", response_model=ApiResponse[QuestionResponse])
async def create_question(
    question: QuestionCreate,
    _=Depends(verify_role(["admin", "teacher"]))
):
    """Create a new question."""
    created_question = await QuestionService.create_question(question)
    return ApiResponse(data=created_question)

@router.get("/", response_model=ApiResponse[List[QuestionResponse]])
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Get questions with optional filters."""
    questions = await QuestionService.get_questions(
        skip=skip,
        limit=limit,
        subject=subject,
        topic=topic,
        difficulty=difficulty
    )
    return ApiResponse(data=questions)

@router.get("/{question_id}", response_model=ApiResponse[QuestionResponse])
async def get_question(question_id: str):
    """Get a question by ID."""
    question = await QuestionService.get_question_by_id(question_id)
    return ApiResponse(data=question)

@router.put("/{question_id}", response_model=ApiResponse[QuestionResponse])
async def update_question(
    question_id: str,
    question_update: QuestionUpdate,
    _=Depends(verify_role(["admin", "teacher"]))
):
    """Update a question."""
    updated_question = await QuestionService.update_question(question_id, question_update)
    return ApiResponse(data=updated_question)

@router.delete("/{question_id}", response_model=ApiResponse[bool])
async def delete_question(
    question_id: str,
    _=Depends(verify_role(["admin", "teacher"]))
):
    """Delete a question."""
    result = await QuestionService.delete_question(question_id)
    return ApiResponse(data=result) 