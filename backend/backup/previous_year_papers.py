from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from ..schemas.previous_year_paper import PreviousYearPaperCreate, PreviousYearPaperResponse
from ..models.previous_year_paper import PreviousYearPaper
from ..core.security import get_current_user, verify_role
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/add", response_model=PreviousYearPaperResponse)
async def add_previous_year_test(
    paper: PreviousYearPaperCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify admin role
    verify_role(current_user, ["admin"])
    
    # Create paper
    paper_dict = paper.dict()
    result = await PreviousYearPaper.insert_one(paper_dict)
    created_paper = await PreviousYearPaper.find_one({"_id": result.inserted_id})
    
    return PreviousYearPaperResponse(**created_paper)

@router.get("/get", response_model=List[PreviousYearPaperResponse])
async def get_previous_year_tests(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    year: Optional[int] = None,
    subject: Optional[str] = None
):
    # Build filter
    filter_dict = {}
    if year:
        filter_dict["year"] = year
    if subject:
        filter_dict["subject"] = subject
    
    papers = await PreviousYearPaper.find_many(filter_dict, skip=skip, limit=limit)
    return [PreviousYearPaperResponse(**paper) for paper in papers]

@router.get("/get/{paper_id}", response_model=PreviousYearPaperResponse)
async def get_test_details(paper_id: str):
    paper = await PreviousYearPaper.find_one({"_id": paper_id})
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Previous year paper not found"
        )
    
    return PreviousYearPaperResponse(**paper) 