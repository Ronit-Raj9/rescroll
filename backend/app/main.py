import logging
import logging.config
from pathlib import Path
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
import time
import os

from app.core.config import Settings
from app.core.logging_config import LOGGING_CONFIG
from app.api.v1.api import api_router
from app.api.v1.endpoints import health
from app.utils.api_error import ApiError
from app.utils.api_response import ApiResponse
from app.middleware.metrics import add_metrics_middleware
from app.core.logging import setup_logging
from app.core.db import supabase
from app.db.utils import test_db_connection
from app.db.database import engine

# Configure logging
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("app")

# Create static directory if it doesn't exist
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

# Initialize settings
settings = Settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Set all CORS enabled origins
origins = [
    "http://localhost:19006",
    "http://localhost:19000", 
    "exp://localhost:19000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://10.0.2.2:8081",
    "http://10.0.2.2:8000",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site="none",
    https_only=settings.COOKIE_SECURE,
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Add metrics middleware
add_metrics_middleware(app)

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
app.include_router(health.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """Root endpoint to check API status."""
    logger.info("Root endpoint accessed")
    return {"status": "ok", "message": "Welcome to Rescroll API"}

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    except Exception as e:
        # Log the exception
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        
        # Check if this is a database connection error
        if "Network is unreachable" in str(e) or "Connection refused" in str(e):
            return Response(
                content='{"status": "error", "message": "Database connection error. Please try again later."}',
                status_code=503,
                media_type="application/json"
            )
            
        # Return a generic error for other exceptions
        return Response(
            content='{"status": "error", "message": "Internal server error"}',
            status_code=500,
            media_type="application/json"
        )

# Update startup_event to use the simplified connection test
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Test database connection
    logger.info("Testing database connection...")
    success, message = test_db_connection()
    if success:
        logger.info(f"✅ {message}")
    else:
        logger.error(f"❌ {message}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

