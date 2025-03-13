from functools import wraps
from typing import Callable, Any
from fastapi import Request
from .api_error import ApiError
import logging

logger = logging.getLogger(__name__)

def async_handler(func: Callable) -> Callable:
    """
    Decorator for handling async route functions.
    Provides consistent error handling and logging.
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        try:
            return await func(*args, **kwargs)
        except ApiError as e:
            # Re-raise API errors as they are already formatted
            raise
        except Exception as e:
            # Log unexpected errors
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}", exc_info=True)
            # Convert to API error
            raise ApiError(
                status_code=500,
                message="Internal server error",
                errors={"detail": str(e)}
            )
    return wrapper 