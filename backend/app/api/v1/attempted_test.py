from fastapi import APIRouter, Depends, Query
from typing import List
from ..schemas.attempted_test import TestSubmission, TestUpdate, TestResponse, TestStatistics
from ..services.attempted_test_service import AttemptedTestService
from ..middlewares.role_verify import verify_role, get_current_user
from ..utils.api_response import ApiResponse

router = APIRouter(prefix="/api/attempted-tests", tags=["attempted-tests"])

@router.post("/", response_model=ApiResponse[TestResponse])
async def submit_test(
    test: TestSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit a test attempt."""
    submitted_test = await AttemptedTestService.submit_test(test, current_user["_id"])
    return ApiResponse(data=submitted_test)

@router.get("/analysis", response_model=ApiResponse[List[TestResponse]])
async def get_user_test_analysis(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get test analysis for the current user."""
    tests = await AttemptedTestService.get_user_test_analysis(
        user_id=current_user["_id"],
        skip=skip,
        limit=limit
    )
    return ApiResponse(data=tests)

@router.put("/{test_id}", response_model=ApiResponse[TestResponse])
async def update_test_results(
    test_id: str,
    test_update: TestUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update test results."""
    updated_test = await AttemptedTestService.update_test_results(
        test_id=test_id,
        user_id=current_user["_id"],
        test_update=test_update
    )
    return ApiResponse(data=updated_test)

@router.delete("/{test_id}", response_model=ApiResponse[bool])
async def delete_test_results(
    test_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete test results."""
    result = await AttemptedTestService.delete_test_results(
        test_id=test_id,
        user_id=current_user["_id"]
    )
    return ApiResponse(data=result)

@router.get("/statistics", response_model=ApiResponse[TestStatistics])
async def get_test_statistics(
    current_user: dict = Depends(get_current_user)
):
    """Get test statistics for the current user."""
    stats = await AttemptedTestService.get_test_statistics(current_user["_id"])
    return ApiResponse(data=stats) 