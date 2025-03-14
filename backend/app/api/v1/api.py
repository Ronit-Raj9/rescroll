from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, simple, papers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(simple.router, prefix="/simple", tags=["simple"])
api_router.include_router(papers.router, prefix="/papers", tags=["papers"]) 