import requests
import os
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_cookie_auth():
    """
    Test the cookie authentication specifically.
    """
    print("Starting cookie authentication test...")
    
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
    
    if register_response.status_code != 200:
        print(f"Failed to register user: {register_response.text}")
        return
    
    print("User registered successfully")
    
    # 2. Login to get tokens
    login_data = {
        "username": email,  # OAuth2 uses username field for email
        "password": password
    }
    
    print("Logging in...")
    login_response = session.post(
        f"{BASE_URL}/auth/login/access-token",
        data=login_data
    )
    
    if login_response.status_code != 200:
        print(f"Failed to login: {login_response.text}")
        return
    
    tokens = login_response.json()
    access_token = tokens["access_token"]
    
    print(f"Login successful. Access token: {access_token[:10]}...")
    print(f"Session cookies: {session.cookies.get_dict()}")
    
    # 3. Try to access a protected endpoint using the session cookies
    print("\nTrying with session cookies...")
    session_response = session.get(f"{BASE_URL}/users/me")
    
    print(f"Session cookie response status: {session_response.status_code}")
    print(f"Session cookie response: {session_response.text}")
    
    # Try with explicit Cookie header
    print("\nTrying with explicit Cookie header...")
    explicit_response = requests.get(
        f"{BASE_URL}/users/me",
        headers={"Cookie": f"access_token={access_token}"}
    )
    
    print(f"Explicit cookie header response status: {explicit_response.status_code}")
    print(f"Explicit cookie header response: {explicit_response.text}")
    
    # Try with Authorization header for comparison
    print("\nTrying with Authorization header for comparison...")
    auth_response = requests.get(
        f"{BASE_URL}/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    print(f"Auth header response status: {auth_response.status_code}")
    print(f"Auth header response: {auth_response.text}")
    
    if session_response.status_code == 200:
        print("Successfully accessed protected endpoint with session cookies")
    elif explicit_response.status_code == 200:
        print("Successfully accessed protected endpoint with explicit cookie header")
    else:
        print("Failed to access protected endpoint with cookies")
        if auth_response.status_code == 200:
            print("But succeeded with Authorization header")
    
    print("Cookie authentication test completed!")

if __name__ == "__main__":
    test_cookie_auth() 