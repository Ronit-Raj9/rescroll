import requests
import os
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_browser_auth():
    """
    Test authentication in a browser-like environment.
    """
    print("Starting browser-like authentication test...")
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Set user agent to mimic a browser
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    })
    
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
    
    # Print detailed cookie information
    print("\nDetailed cookie information:")
    for cookie in session.cookies:
        print(f"Cookie name: {cookie.name}")
        print(f"Cookie value: {cookie.value[:10]}...")
        print(f"Cookie domain: {cookie.domain}")
        print(f"Cookie path: {cookie.path}")
        print(f"Cookie secure: {cookie.secure}")
        print(f"Cookie httponly: {cookie.has_nonstandard_attr('HttpOnly')}")
        print(f"Cookie samesite: {cookie.get_nonstandard_attr('SameSite')}")
        print(f"Cookie expires: {cookie.expires}")
        print("---")
    
    # 3. Try to access a protected endpoint using the session cookies
    print("\nTrying with session cookies...")
    session_response = session.get(f"{BASE_URL}/users/me")
    
    print(f"Session cookie response status: {session_response.status_code}")
    if session_response.status_code == 200:
        print("✅ Session cookies authentication successful")
        print(f"Response: {session_response.text}")
    else:
        print("❌ Session cookies authentication failed")
        print(f"Response: {session_response.text}")
    
    # 4. Test logout
    print("\nTesting logout...")
    logout_response = session.post(f"{BASE_URL}/auth/logout")
    
    print(f"Logout response status: {logout_response.status_code}")
    if logout_response.status_code == 200:
        print("✅ Logout successful")
        print(f"Cookies after logout: {session.cookies.get_dict()}")
    else:
        print("❌ Logout failed")
        print(f"Response: {logout_response.text}")
    
    print("\nBrowser-like authentication test completed!")

if __name__ == "__main__":
    test_browser_auth() 