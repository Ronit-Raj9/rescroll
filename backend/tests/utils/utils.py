from typing import Dict, Generator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.config import settings
from app.core import security
from app.tests.utils.user import create_random_user

client = TestClient(app)

def get_superuser_token_headers() -> Dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    return {"Authorization": f"Bearer {a_token}"}

def get_normal_user_token_headers(db: AsyncSession) -> Dict[str, str]:
    user = create_random_user(db)
    return get_user_token_headers(user)

def get_user_token_headers(user) -> Dict[str, str]:
    login_data = {
        "username": user.email,
        "password": "testpass123",
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    return {"Authorization": f"Bearer {a_token}"}

def get_test_db() -> Generator:
    try:
        db = AsyncSession()
        yield db
    finally:
        db.close()

def create_test_user(db: AsyncSession, **kwargs):
    return create_random_user(db, **kwargs)

def get_test_token(user_id: int) -> str:
    return security.create_access_token(data={"sub": str(user_id)}) 