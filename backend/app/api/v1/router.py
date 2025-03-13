from fastapi import APIRouter
from app.api.v1.endpoints import auth, papers

router = APIRouter()

# Include all endpoint routers here
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(papers.router, prefix="/papers", tags=["papers"]) 