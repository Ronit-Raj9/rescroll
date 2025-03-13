import requests
import os
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_all_auth_methods():
    """
    Test all authentication methods:
    1. Session cookies
    2. Explicit Cookie header
    3. Authorization header
    4. Refresh token
    5. Logout
    """
    print("Starting comprehensive authentication test...")
    
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
    user_id = register_response.json()["id"]
    
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
    refresh_token = tokens["refresh_token"]
    
    print(f"Login successful. Access token: {access_token[:10]}...")
    print(f"Refresh token: {refresh_token[:10]}...")
    print(f"Session cookies: {session.cookies.get_dict()}")
    
    # 3. Test session cookies
    print("\nTesting session cookies...")
    session_response = session.get(f"{BASE_URL}/users/me")
    
    print(f"Session cookie response status: {session_response.status_code}")
    if session_response.status_code == 200:
        print("✅ Session cookies authentication successful")
    else:
        print("❌ Session cookies authentication failed")
        print(f"Response: {session_response.text}")
    
    # 4. Test explicit Cookie header
    print("\nTesting explicit Cookie header...")
    cookie_response = requests.get(
        f"{BASE_URL}/users/me",
        headers={"Cookie": f"access_token={access_token}"}
    )
    
    print(f"Explicit cookie header response status: {cookie_response.status_code}")
    if cookie_response.status_code == 200:
        print("✅ Explicit Cookie header authentication successful")
    else:
        print("❌ Explicit Cookie header authentication failed")
        print(f"Response: {cookie_response.text}")
    
    # 5. Test Authorization header
    print("\nTesting Authorization header...")
    auth_response = requests.get(
        f"{BASE_URL}/users/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    print(f"Authorization header response status: {auth_response.status_code}")
    if auth_response.status_code == 200:
        print("✅ Authorization header authentication successful")
    else:
        print("❌ Authorization header authentication failed")
        print(f"Response: {auth_response.text}")
    
    # 6. Test refresh token
    print("\nTesting refresh token...")
    refresh_response = session.post(f"{BASE_URL}/auth/refresh-token")
    
    print(f"Refresh token response status: {refresh_response.status_code}")
    if refresh_response.status_code == 200:
        print("✅ Refresh token successful")
        new_tokens = refresh_response.json()
        new_access_token = new_tokens["access_token"]
        new_refresh_token = new_tokens["refresh_token"]
        print(f"New access token: {new_access_token[:10]}...")
        print(f"New refresh token: {new_refresh_token[:10]}...")
        
        # Test with new tokens
        print("\nTesting with new tokens...")
        new_session_response = session.get(f"{BASE_URL}/users/me")
        print(f"New session response status: {new_session_response.status_code}")
        if new_session_response.status_code == 200:
            print("✅ Authentication with new tokens successful")
        else:
            print("❌ Authentication with new tokens failed")
            print(f"Response: {new_session_response.text}")
    else:
        print("❌ Refresh token failed")
        print(f"Response: {refresh_response.text}")
    
    # 7. Test logout
    print("\nTesting logout...")
    logout_response = session.post(f"{BASE_URL}/auth/logout")
    
    print(f"Logout response status: {logout_response.status_code}")
    if logout_response.status_code == 200:
        print("✅ Logout successful")
        print(f"Cookies after logout: {session.cookies.get_dict()}")
        
        # Test authentication after logout
        after_logout_response = session.get(f"{BASE_URL}/users/me")
        print(f"After logout response status: {after_logout_response.status_code}")
        if after_logout_response.status_code == 401:
            print("✅ Authentication correctly fails after logout")
        else:
            print("❌ Authentication still works after logout")
            print(f"Response: {after_logout_response.text}")
    else:
        print("❌ Logout failed")
        print(f"Response: {logout_response.text}")
    
    print("\nComprehensive authentication test completed!")

if __name__ == "__main__":
    test_all_auth_methods() 