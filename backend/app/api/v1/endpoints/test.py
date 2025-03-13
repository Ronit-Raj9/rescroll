from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

@router.get("/", response_model=Dict[str, str])
def test_endpoint() -> Any:
    """
    Test endpoint to check if the API is working correctly.
    """
    return {"status": "ok", "message": "Test API is working correctly"}

@router.post("/register", response_model=Dict[str, Any])
def test_register(
    *,
    user_data: Dict[str, Any],
) -> Any:
    """
    Test endpoint to simulate user registration without using the database.
    """
    try:
        # Validate required fields
        required_fields = ["email", "username", "full_name", "password"]
        for field in required_fields:
            if field not in user_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}",
                )
        
        # Return a mock response
        return {
            "id": 1,
            "email": user_data["email"],
            "username": user_data["username"],
            "full_name": user_data["full_name"],
            "is_active": True,
            "is_superuser": False,
        }
    except Exception as e:
        # Re-raise the exception with more details
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during test registration: {str(e)}",
        ) 