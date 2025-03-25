import logging
import logging.config
from pathlib import Path
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import Settings
from app.core.logging_config import LOGGING_CONFIG
from app.api.v1.api import api_router
from app.api.v1.endpoints import health
from app.utils.api_error import ApiError
from app.utils.api_response import ApiResponse

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
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
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
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

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
    response = await call_next(request)
    return response