import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.config import settings
from app.tests.utils.utils import get_superuser_token_headers, get_normal_user_token_headers
from app.tests.utils.user import create_random_user

client = TestClient(app)

def test_read_users_me(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    r = client.get("/api/v1/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert r.status_code == 200
    assert current_user["is_active"] is True
    assert current_user["is_superuser"] is False
    assert current_user["email"] is not None

def test_read_users_me_superuser(
    db: AsyncSession,
    superuser_token_headers: dict,
):
    r = client.get("/api/v1/users/me", headers=superuser_token_headers)
    current_user = r.json()
    assert r.status_code == 200
    assert current_user["is_active"] is True
    assert current_user["is_superuser"] is True
    assert current_user["email"] == settings.FIRST_SUPERUSER

def test_read_user_by_id(
    db: AsyncSession,
    superuser_token_headers: dict,
):
    user = create_random_user(db)
    r = client.get(f"/api/v1/users/{user.id}", headers=superuser_token_headers)
    assert r.status_code == 200
    api_user = r.json()
    assert api_user["email"] == user.email
    assert api_user["username"] == user.username

def test_read_user_by_id_normal_user(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    user = create_random_user(db)
    r = client.get(f"/api/v1/users/{user.id}", headers=normal_user_token_headers)
    assert r.status_code == 400
    assert "detail" in r.json()

def test_update_user_me(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    data = {"full_name": "Updated Name"}
    r = client.put("/api/v1/users/me", headers=normal_user_token_headers, json=data)
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["full_name"] == data["full_name"]

def test_update_user_me_email(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    data = {"email": "updated@example.com"}
    r = client.put("/api/v1/users/me", headers=normal_user_token_headers, json=data)
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["email"] == data["email"]

def test_update_user_me_password(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    data = {"password": "newpassword123"}
    r = client.put("/api/v1/users/me", headers=normal_user_token_headers, json=data)
    assert r.status_code == 200
    updated_user = r.json()
    assert "password" not in updated_user

def test_update_user_me_invalid_email(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    data = {"email": "invalid-email"}
    r = client.put("/api/v1/users/me", headers=normal_user_token_headers, json=data)
    assert r.status_code == 422
    assert "detail" in r.json()

def test_upload_profile_image(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    # Create a test image file
    files = {
        "file": ("test.jpg", b"test image content", "image/jpeg")
    }
    r = client.post(
        "/api/v1/users/me/profile-image",
        headers=normal_user_token_headers,
        files=files
    )
    assert r.status_code == 200
    assert "image_url" in r.json()

def test_delete_profile_image(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    # First upload an image
    files = {
        "file": ("test.jpg", b"test image content", "image/jpeg")
    }
    client.post(
        "/api/v1/users/me/profile-image",
        headers=normal_user_token_headers,
        files=files
    )
    
    # Then delete it
    r = client.delete(
        "/api/v1/users/me/profile-image",
        headers=normal_user_token_headers
    )
    assert r.status_code == 200
    assert r.json()["profile_image"] is None

def test_delete_profile_image_nonexistent(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    r = client.delete(
        "/api/v1/users/me/profile-image",
        headers=normal_user_token_headers
    )
    assert r.status_code == 400
    assert "detail" in r.json()

def test_create_user(
    db: AsyncSession,
    superuser_token_headers: dict,
):
    data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "newpassword123",
        "full_name": "New User"
    }
    r = client.post("/api/v1/users/", headers=superuser_token_headers, json=data)
    assert r.status_code == 200
    created_user = r.json()
    assert created_user["email"] == data["email"]
    assert created_user["username"] == data["username"]
    assert created_user["full_name"] == data["full_name"]
    assert "password" not in created_user

def test_create_user_existing_email(
    db: AsyncSession,
    superuser_token_headers: dict,
):
    data = {
        "email": settings.FIRST_SUPERUSER,
        "username": "newuser",
        "password": "newpassword123",
        "full_name": "New User"
    }
    r = client.post("/api/v1/users/", headers=superuser_token_headers, json=data)
    assert r.status_code == 400
    assert "detail" in r.json()

def test_create_user_normal_user(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "newpassword123",
        "full_name": "New User"
    }
    r = client.post("/api/v1/users/", headers=normal_user_token_headers, json=data)
    assert r.status_code == 403
    assert "detail" in r.json() 