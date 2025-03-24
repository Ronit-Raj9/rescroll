from fastapi import APIRouter

from app.api.v1.endpoints import users, auth, items, simple, test, papers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(simple.router, prefix="/simple", tags=["simple"])
api_router.include_router(test.router, prefix="/test", tags=["test"])
api_router.include_router(papers.router, prefix="/papers", tags=["papers"]) 