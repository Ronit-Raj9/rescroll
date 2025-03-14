from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.paper_summary_service import PaperSummaryService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/search/", response_model=Dict[str, Any])
async def search_papers(
    query: str = Query(..., description="Search query for papers"),
    start: int = Query(0, description="Starting index for pagination"),
    max_results: int = Query(10, description="Maximum number of results to return"),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Search for papers on arXiv based on the provided query.
    """
    try:
        results = await PaperSummaryService.search_papers(query, start, max_results)
        return results
    except Exception as e:
        logger.error(f"Error searching papers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search papers: {str(e)}")

@router.get("/arxiv/{paper_id}", response_model=Dict[str, Any])
async def get_paper_details(
    paper_id: str,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Get detailed information about a specific paper from arXiv.
    """
    try:
        paper_details = await PaperSummaryService.get_paper_details(paper_id)
        return paper_details
    except Exception as e:
        logger.error(f"Error getting paper details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get paper details: {str(e)}")

@router.get("/arxiv/{paper_id}/summary", response_model=Dict[str, Any])
async def get_paper_summary(
    paper_id: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Dict[str, Any]:
    """
    Generate a summary for a paper using Gemini AI.
    """
    try:
        # Log the request for analytics
        logger.info(f"API request to get paper summary for ID: {paper_id} by user: {current_user.id}")
        
        summary = await PaperSummaryService.generate_summary(paper_id, db, current_user.id)
        return summary
    except Exception as e:
        logger.error(f"Error generating paper summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate paper summary: {str(e)}") 