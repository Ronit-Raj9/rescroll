from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from ..schemas.previous_year_paper import (
    PreviousYearPaperCreate,
    PreviousYearPaperResponse,
    PreviousYearPaperWithQuestionsResponse
)
from ..services.previous_year_paper_service import PreviousYearPaperService
from ..middlewares.role_verify import verify_role
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/api/previous-year-papers", tags=["previous-year-papers"])

@router.post("/", response_model=ApiResponse[PreviousYearPaperResponse])
async def create_paper(
    paper: PreviousYearPaperCreate,
    _=Depends(verify_role(["admin", "teacher"]))
):
    """Create a new previous year paper."""
    created_paper = await PreviousYearPaperService.create_paper(paper)
    return ApiResponse(data=created_paper)

@router.get("/", response_model=ApiResponse[List[PreviousYearPaperResponse]])
async def get_papers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    year: Optional[int] = None,
    subject: Optional[str] = None
):
    """Get previous year papers with optional filters."""
    papers = await PreviousYearPaperService.get_papers(
        skip=skip,
        limit=limit,
        year=year,
        subject=subject
    )
    return ApiResponse(data=papers)

@router.get("/{paper_id}", response_model=ApiResponse[PreviousYearPaperResponse])
async def get_paper(paper_id: str):
    """Get a previous year paper by ID."""
    paper = await PreviousYearPaperService.get_paper_by_id(paper_id)
    return ApiResponse(data=paper)

@router.get("/{paper_id}/questions", response_model=ApiResponse[PreviousYearPaperWithQuestionsResponse])
async def get_paper_with_questions(paper_id: str):
    """Get a previous year paper with its questions."""
    paper = await PreviousYearPaperService.get_paper_with_questions(paper_id)
    return ApiResponse(data=paper)

@router.get("/subject/{subject}", response_model=ApiResponse[List[PreviousYearPaperResponse]])
async def get_papers_by_subject(
    subject: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get papers by subject."""
    papers = await PreviousYearPaperService.get_papers_by_subject(
        subject=subject,
        skip=skip,
        limit=limit
    )
    return ApiResponse(data=papers)

@router.get("/year/{year}", response_model=ApiResponse[List[PreviousYearPaperResponse]])
async def get_papers_by_year(
    year: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get papers by year."""
    papers = await PreviousYearPaperService.get_papers_by_year(
        year=year,
        skip=skip,
        limit=limit
    )
    return ApiResponse(data=papers) 