"""
Common test fixtures for the Rescroll API tests.
"""
import os
import pytest
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base URL for API requests
BASE_URL = os.getenv("TEST_API_URL", "http://localhost:8000/api/v1")


@pytest.fixture
def api_base_url():
    """Return the base URL for API requests."""
    return BASE_URL


@pytest.fixture
def test_user():
    """Return test user credentials."""
    return {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Password123!",
        "full_name": "Test User"
    }


@pytest.fixture
def register_user(api_base_url, test_user):
    """Register a test user and return the response."""
    response = requests.post(
        f"{api_base_url}/auth/register",
        json=test_user
    )
    return response


@pytest.fixture
def auth_token(api_base_url, test_user):
    """Get an authentication token for the test user."""
    # Try to register the user (it's okay if it fails because the user already exists)
    requests.post(
        f"{api_base_url}/auth/register",
        json=test_user
    )
    
    # Login to get the token
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    response = requests.post(
        f"{api_base_url}/auth/login",
        data=login_data
    )
    
    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        pytest.fail(f"Failed to get auth token: {response.text}")


@pytest.fixture
def auth_headers(auth_token):
    """Return headers with authentication token."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def test_paper_id():
    """Return a test paper ID for paper-related tests."""
    return "1901.00001"  # A valid arXiv paper ID


@pytest.fixture
def cleanup_user(api_base_url, auth_headers):
    """Yield to the test and then clean up the test user."""
    yield
    # This will run after the test
    # Uncomment if you want to delete the test user after tests
    # requests.delete(f"{api_base_url}/users/me", headers=auth_headers) 