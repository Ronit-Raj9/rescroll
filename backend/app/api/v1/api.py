from fastapi import APIRouter

from app.api.v1.endpoints import users, auth, papers, connection_test

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(papers.router, prefix="/papers", tags=["papers"])
api_router.include_router(connection_test.router, prefix="/system", tags=["system"]) 