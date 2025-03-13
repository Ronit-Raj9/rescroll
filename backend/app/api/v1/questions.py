from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from ..schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from ..models.question import Question
from ..core.security import get_current_user, verify_role
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/upload", response_model=QuestionResponse)
async def upload_question(
    question: QuestionCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify admin role
    verify_role(current_user, ["admin"])
    
    # Create question
    question_dict = question.dict()
    result = await Question.insert_one(question_dict)
    created_question = await Question.find_one({"_id": result.inserted_id})
    
    return QuestionResponse(**created_question)

@router.get("/get", response_model=List[QuestionResponse])
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    # Verify user or admin role
    verify_role(current_user, ["admin", "user"])
    
    # Build filter
    filter_dict = {}
    if subject:
        filter_dict["subject"] = subject
    if topic:
        filter_dict["topic"] = topic
    if difficulty:
        filter_dict["difficulty"] = difficulty
    
    questions = await Question.find_many(filter_dict, skip=skip, limit=limit)
    return [QuestionResponse(**q) for q in questions]

@router.get("/get/{question_id}", response_model=QuestionResponse)
async def get_question_by_id(
    question_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Verify user or admin role
    verify_role(current_user, ["admin", "user"])
    
    question = await Question.find_one({"_id": question_id})
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return QuestionResponse(**question)

@router.patch("/update/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: str,
    question_update: QuestionUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Verify admin role
    verify_role(current_user, ["admin"])
    
    # Check if question exists
    existing_question = await Question.find_one({"_id": question_id})
    if not existing_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update question
    update_data = question_update.dict(exclude_unset=True)
    if update_data:
        await Question.update_one(
            {"_id": question_id},
            {"$set": update_data}
        )
    
    updated_question = await Question.find_one({"_id": question_id})
    return QuestionResponse(**updated_question)

@router.delete("/delete/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Verify admin role
    verify_role(current_user, ["admin"])
    
    # Check if question exists
    existing_question = await Question.find_one({"_id": question_id})
    if not existing_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Delete question
    await Question.delete_one({"_id": question_id}) 