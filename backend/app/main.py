from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import logging.config
from motor.motor_asyncio import AsyncIOMotorClient

from .core.config import settings
from .core.logging_config import LOGGING_CONFIG
from .utils.api_error import ApiError
from .utils.api_response import ApiResponse
from .routers import (
    user,
    question,
    test,
    attempted_test,
    previous_year_paper
)

# Configure logging
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Rescroll API",
    description="API for Rescroll - An Online Learning Platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.mongodb = app.mongodb_client[settings.DB_NAME]
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    logger.info("Disconnected from MongoDB")

# Error handlers
@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    logger.error(f"API Error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail}
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error"}
    )

# Include routers
app.include_router(user.router)
app.include_router(question.router)
app.include_router(test.router)
app.include_router(attempted_test.router)
app.include_router(previous_year_paper.router)

@app.get("/")
async def root():
    """Root endpoint to check API status."""
    return ApiResponse(data={"status": "ok", "message": "Welcome to Rescroll API"})
