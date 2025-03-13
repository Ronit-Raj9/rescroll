import requests
import os
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_auth_system():
    """
    Test the authentication system to verify it's working correctly.
    """
    print("Starting authentication system test...")
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # 1. Register a new user
    username = f"testuser_{int(time.time())}"
    email = f"{username}@example.com"
    password = "testpassword123"
    
    register_data = {
        "email": email,
        "username": username,
        "full_name": "Test User",
        "password": password
    }
    
    print(f"Registering user: {username}")
    register_response = session.post(
        f"{BASE_URL}/auth/register",
        json=register_data
    )
    
    print(f"Register response status: {register_response.status_code}")
    print(f"Register response: {register_response.text}")
    
    if register_response.status_code != 200:
        print(f"Failed to register user: {register_response.text}")
        return
    
    print("User registered successfully")
    
    # 2. Login to get cookies and tokens
    login_data = {
        "username": email,  # OAuth2 uses username field for email
        "password": password
    }
    
    print("Logging in...")
    login_response = session.post(
        f"{BASE_URL}/auth/login/access-token",
        data=login_data
    )
    
    print(f"Login response status: {login_response.status_code}")
    print(f"Login response: {login_response.text}")
    
    if login_response.status_code != 200:
        print(f"Failed to login: {login_response.text}")
        return
    
    tokens = login_response.json()
    access_token = tokens["access_token"]
    refresh_token = tokens.get("refresh_token")
    
    print(f"Login successful. Access token: {access_token[:10]}...")
    print(f"Refresh token: {refresh_token[:10] if refresh_token else 'None'}...")
    print(f"Cookies: {session.cookies.get_dict()}")
    
    # Detailed cookie inspection
    print("\nDetailed cookie inspection:")
    for cookie in session.cookies:
        print(f"Cookie name: {cookie.name}")
        print(f"Cookie value: {cookie.value}")
        print(f"Cookie domain: {cookie.domain}")
        print(f"Cookie path: {cookie.path}")
        print(f"Cookie secure: {cookie.secure}")
        print(f"Cookie httponly: {cookie.has_nonstandard_attr('HttpOnly')}")
        print(f"Cookie samesite: {cookie.get_nonstandard_attr('SameSite')}")
        print(f"Cookie expires: {cookie.expires}")
        print("---")
    
    # Try with explicit Authorization header
    print("\nTrying with explicit Authorization header...")
    auth_header_response = session.get(
        f"{BASE_URL}/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    print(f"Auth header response status: {auth_header_response.status_code}")
    print(f"Auth header response: {auth_header_response.text}")
    
    if auth_header_response.status_code != 200:
        print(f"Failed to access protected endpoint with Authorization header")
        return
    
    print("Successfully accessed protected endpoint with Authorization header")
    
    # 4. Logout
    print("Logging out...")
    logout_response = session.post(f"{BASE_URL}/auth/logout")
    
    print(f"Logout response status: {logout_response.status_code}")
    print(f"Logout response: {logout_response.text}")
    
    if logout_response.status_code != 200:
        print(f"Failed to logout: {logout_response.text}")
        return
    
    print("Successfully logged out")
    print(f"Cookies after logout: {session.cookies.get_dict()}")
    
    print("Authentication system test completed successfully!")

if __name__ == "__main__":
    test_auth_system() 