from typing import Any, Optional
from pydantic import BaseModel

class ApiResponse(BaseModel):
    statusCode: int = 200
    data: Optional[Any] = None
    message: str = "Success"
    success: bool = True

    @classmethod
    def success(cls, data: Any = None, message: str = "Success", statusCode: int = 200):
        return cls(
            statusCode=statusCode,
            data=data,
            message=message,
            success=True
        )

    @classmethod
    def error(cls, message: str = "Error occurred", statusCode: int = 500):
        return cls(
            statusCode=statusCode,
            message=message,
            success=False
        ) 