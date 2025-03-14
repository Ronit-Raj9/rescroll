from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException

router = APIRouter()

@router.post("/register", response_model=Dict[str, Any])
def simple_register(
    user_data: Dict[str, Any] = Body(...),
) -> Any:
    """
    Simple test endpoint to register a user without using any models.
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
        # Log the error
        print(f"Error in simple_register endpoint: {str(e)}")
        # Re-raise the exception with more details
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during simple registration: {str(e)}",
        ) 