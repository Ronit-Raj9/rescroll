from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from ..schemas.attempted_test import TestSubmission, TestAnalysis, TestUpdate
from ..models.attempted_test import AttemptedTest
from ..core.security import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/submit", response_model=TestAnalysis)
async def submit_test(
    test_data: TestSubmission,
    current_user: dict = Depends(get_current_user)
):
    # Create test submission
    test_dict = test_data.dict()
    test_dict["userId"] = str(current_user["_id"])
    
    result = await AttemptedTest.insert_one(test_dict)
    created_test = await AttemptedTest.find_one({"_id": result.inserted_id})
    
    return TestAnalysis(**created_test)

@router.get("/analysis", response_model=List[TestAnalysis])
async def get_test_analysis(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    tests = await AttemptedTest.find_by_user(
        user_id=str(current_user["_id"]),
        skip=skip,
        limit=limit
    )
    return [TestAnalysis(**test) for test in tests]

@router.put("/update/{test_id}", response_model=TestAnalysis)
async def update_test_results(
    test_id: str,
    test_update: TestUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Check if test exists and belongs to user
    existing_test = await AttemptedTest.find_one({
        "_id": test_id,
        "userId": str(current_user["_id"])
    })
    
    if not existing_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found or access denied"
        )
    
    # Update test
    update_data = test_update.dict(exclude_unset=True)
    if update_data:
        await AttemptedTest.update_one(
            {"_id": test_id},
            {"$set": update_data}
        )
    
    updated_test = await AttemptedTest.find_one({"_id": test_id})
    return TestAnalysis(**updated_test)

@router.delete("/delete/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test_results(
    test_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Check if test exists and belongs to user
    existing_test = await AttemptedTest.find_one({
        "_id": test_id,
        "userId": str(current_user["_id"])
    })
    
    if not existing_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found or access denied"
        )
    
    # Delete test
    await AttemptedTest.delete_one({"_id": test_id}) 