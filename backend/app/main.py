import logging
import logging.config
from pathlib import Path
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.core.logging_config import LOGGING_CONFIG
from app.api.v1.api import api_router
from app.utils.api_error import ApiError
from app.utils.api_response import ApiResponse

# Configure logging
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("app")

# Create static directory if it doesn't exist
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # If no specific origins are set, allow all origins that need credentials
    # Note: In production, you should specify exact origins instead of using wildcard
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:8000", "http://localhost:5173", 
                      "http://127.0.0.1:3000", "http://127.0.0.1:8000", "http://127.0.0.1:5173",
                      "http://localhost", "http://127.0.0.1"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

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

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """Root endpoint to check API status."""
    logger.info("Root endpoint accessed")
    return ApiResponse(data={"status": "ok", "message": "Welcome to Rescroll API"})

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    response = await call_next(request)
    return response