import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Log request
        start_time = time.time()
        request_body = await request.body()
        request_body_str = request_body.decode() if request_body else ""
        
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                "request_id": request.headers.get("X-Request-ID", "no-request-id"),
                "client_ip": request.client.host,
                "request_body": request_body_str,
                "headers": dict(request.headers)
            }
        )
        
        try:
            response = await call_next(request)
            
            # Log response
            process_time = time.time() - start_time
            response_body = b""
            async for chunk in response.body_iterator:
                response_body += chunk
            
            # Reconstruct response body iterator
            async def new_body_iterator():
                yield response_body
            
            response.body_iterator = new_body_iterator()
            
            logger.info(
                f"Response: {response.status_code}",
                extra={
                    "request_id": request.headers.get("X-Request-ID", "no-request-id"),
                    "process_time": f"{process_time:.2f}s",
                    "response_body": response_body.decode() if response_body else ""
                }
            )
            
            return response
            
        except Exception as e:
            # Log error
            process_time = time.time() - start_time
            logger.error(
                f"Error processing request: {str(e)}",
                extra={
                    "request_id": request.headers.get("X-Request-ID", "no-request-id"),
                    "process_time": f"{process_time:.2f}s",
                    "error": str(e)
                },
                exc_info=True
            )
            raise 