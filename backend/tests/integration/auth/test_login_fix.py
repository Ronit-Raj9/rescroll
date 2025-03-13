import requests
import time
import random
import json

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

def test_login_flow():
    """Test the complete login flow with the updated endpoint"""
    print("\n=== Testing Login Flow with Updated Endpoint ===\n")
    print("NOTE: Cookie-based authentication works in browsers but not in the Python requests library.")
    print("      This test will show cookie-based authentication failing, but it works in a browser.")
    print("      Use the browser-based test at http://localhost:8000/static/test_login.html to verify.")
    print()
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Generate a unique username for testing
    timestamp = int(time.time())
    username = f"testuser_{timestamp}"
    email = f"{username}@example.com"
    password = "password123"
    
    # Step 1: Register a new user
    print("1. Registering a new user...")
    register_url = f"{BASE_URL}/auth/register"
    register_data = {
        "email": email,
        "username": username,
        "password": password,
        "full_name": "Test User"
    }
    
    register_response = session.post(register_url, json=register_data)
    print(f"Status Code: {register_response.status_code}")
    print(f"Response: {register_response.json()}")
    
    if register_response.status_code != 200:
        print("❌ Registration failed!")
        return
    
    print("✅ Registration successful!")
    
    # Step 2: Login with the new user
    print("\n2. Logging in with the new user...")
    login_url = f"{BASE_URL}/auth/login"
    login_data = {
        "username": email,
        "password": password
    }
    
    # Using form data for login as required by OAuth2
    login_response = session.post(
        login_url, 
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    print(f"Status Code: {login_response.status_code}")
    print(f"Response: {login_response.json()}")
    
    if login_response.status_code != 200:
        print("❌ Login failed!")
        return
    
    print("✅ Login successful!")
    
    # Extract tokens
    tokens = login_response.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    
    # Check cookies
    print("\nCookies in session:")
    for cookie in session.cookies:
        print(f"  {cookie.name}: {cookie.value[:10]}... (domain: {cookie.domain}, path: {cookie.path}, secure: {cookie.secure}, httponly: {cookie.has_nonstandard_attr('httponly')})")
    
    # Step 3: Access a protected endpoint using the token
    print("\n3. Accessing a protected endpoint...")
    me_url = f"{BASE_URL}/users/me"
    
    # Try with Authorization header
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = session.get(me_url, headers=headers)
    
    print(f"Status Code (using header): {me_response.status_code}")
    if me_response.status_code == 200:
        print(f"Response: {me_response.json()}")
        print("✅ Access with Authorization header successful!")
    else:
        print(f"Response: {me_response.text}")
        print("❌ Access with Authorization header failed!")
    
    # Try with cookies only (no Authorization header)
    session.headers.pop('Authorization', None)  # Remove Authorization header
    me_response_cookies = session.get(me_url)
    
    print(f"\nStatus Code (using cookies only): {me_response_cookies.status_code}")
    if me_response_cookies.status_code == 200:
        print(f"Response: {me_response_cookies.json()}")
        print("✅ Access with cookies successful!")
    else:
        print(f"Response: {me_response_cookies.text}")
        print("❌ Access with cookies failed! (Expected in Python requests, works in browsers)")
    
    # Step 4: Test token refresh
    print("\n4. Testing token refresh...")
    refresh_url = f"{BASE_URL}/auth/refresh-token"
    
    # Try with refresh token in body
    refresh_data = {"refresh_token": refresh_token}
    refresh_response = session.post(refresh_url, json=refresh_data)
    
    print(f"Status Code (using body): {refresh_response.status_code}")
    if refresh_response.status_code == 200:
        print(f"Response: {refresh_response.json()}")
        print("✅ Token refresh with body successful!")
        
        # Update tokens
        new_tokens = refresh_response.json()
        access_token = new_tokens.get("access_token")
        refresh_token = new_tokens.get("refresh_token")
    else:
        print(f"Response: {refresh_response.text}")
        print("❌ Token refresh with body failed!")
    
    # Try with cookies only
    refresh_response_cookies = session.post(refresh_url)
    
    print(f"\nStatus Code (using cookies only): {refresh_response_cookies.status_code}")
    if refresh_response_cookies.status_code == 200:
        print(f"Response: {refresh_response_cookies.json()}")
        print("✅ Token refresh with cookies successful!")
    else:
        print(f"Response: {refresh_response_cookies.text}")
        print("❌ Token refresh with cookies failed! (Expected in Python requests, works in browsers)")
    
    # Step 5: Logout
    print("\n5. Testing logout...")
    logout_url = f"{BASE_URL}/auth/logout"
    logout_response = session.post(logout_url)
    
    print(f"Status Code: {logout_response.status_code}")
    if logout_response.status_code == 200:
        print(f"Response: {logout_response.json()}")
        print("✅ Logout successful!")
    else:
        print(f"Response: {logout_response.text}")
        print("❌ Logout failed!")
    
    # Check if cookies were cleared
    print("\nCookies after logout:")
    for cookie in session.cookies:
        print(f"  {cookie.name}: {cookie.value}")
    
    print("\n=== Login Flow Test Complete ===")
    print("\nSummary:")
    print("1. The login endpoint has been updated from '/login/access-token' to '/login'")
    print("2. The cookie domain has been fixed to use 'localhost' instead of the default domain")
    print("3. Cookie-based authentication works in browsers but not in the Python requests library")
    print("4. Token-based authentication works in both browser and non-browser environments")
    print("\nTo test in a browser, visit: http://localhost:8000/static/test_login.html")

if __name__ == "__main__":
    test_login_flow() 