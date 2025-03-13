from fastapi import APIRouter
from app.api.v1.endpoints import auth

router = APIRouter()

# Include all endpoint routers here
router.include_router(auth.router, prefix="/auth", tags=["auth"]) 