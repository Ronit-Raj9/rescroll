import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.config import settings
from app.tests.utils.utils import get_superuser_token_headers
from app.tests.utils.user import create_random_user

client = TestClient(app)

def test_login_access_token():
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"
    assert "refresh_token" in tokens

def test_use_access_token():
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    tokens = r.json()
    r = client.post(
        "/api/v1/auth/login/test-token",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    result = r.json()
    assert r.status_code == 200
    assert "email" in result

def test_login_incorrect_password():
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": "incorrect",
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 400
    assert "detail" in r.json()

def test_login_inactive_user(db: AsyncSession):
    user = create_random_user(db, is_active=False)
    login_data = {
        "username": user.email,
        "password": "testpass123",
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    assert r.status_code == 400
    assert "detail" in r.json()

def test_refresh_token():
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    tokens = r.json()
    refresh_token = tokens["refresh_token"]
    
    r = client.post(
        "/api/v1/auth/refresh-token",
        json={"refresh_token": refresh_token}
    )
    new_tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    assert new_tokens["token_type"] == "bearer"

def test_refresh_token_invalid():
    r = client.post(
        "/api/v1/auth/refresh-token",
        json={"refresh_token": "invalid_token"}
    )
    assert r.status_code == 401
    assert "detail" in r.json()

def test_password_recovery():
    email = "test@example.com"
    r = client.post(f"/api/v1/auth/password-recovery/{email}")
    assert r.status_code == 200
    assert "msg" in r.json()
    assert "token" in r.json()

def test_reset_password():
    # First get a valid token
    email = "test@example.com"
    r = client.post(f"/api/v1/auth/password-recovery/{email}")
    token = r.json()["token"]
    
    # Try to reset password
    new_password = "newpassword123"
    r = client.post(
        "/api/v1/auth/reset-password/",
        params={"token": token, "new_password": new_password}
    )
    assert r.status_code == 200
    assert "msg" in r.json()

def test_reset_password_invalid_token():
    r = client.post(
        "/api/v1/auth/reset-password/",
        params={"token": "invalid_token", "new_password": "newpassword123"}
    )
    assert r.status_code == 400
    assert "detail" in r.json()

def test_logout():
    # First login to get tokens
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post("/api/v1/auth/login", data=login_data)
    tokens = r.json()
    
    # Try to logout
    r = client.post("/api/v1/auth/logout")
    assert r.status_code == 200
    assert "message" in r.json() 