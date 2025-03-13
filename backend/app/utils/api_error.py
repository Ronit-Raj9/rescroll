from fastapi import HTTPException
from typing import Any, Dict, Optional

class ApiError(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        errors: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "message": message,
                "errors": errors or {}
            },
            headers=headers
        )
        self.message = message
        self.errors = errors or {}

class BadRequestError(ApiError):
    def __init__(self, message: str = "Bad request", errors: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=400, message=message, errors=errors)

class UnauthorizedError(ApiError):
    def __init__(self, message: str = "Unauthorized access", errors: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=401, message=message, errors=errors)

class ForbiddenError(ApiError):
    def __init__(self, message: str = "Forbidden access", errors: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=403, message=message, errors=errors)

class NotFoundError(ApiError):
    def __init__(self, message: str = "Resource not found", errors: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=404, message=message, errors=errors) 