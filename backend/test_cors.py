import requests
import sys

def test_cors_preflight():
    """Test CORS preflight request to check if credentials are allowed"""
    base_url = "http://localhost:8000"
    
    # Test endpoint that requires authentication
    endpoint = f"{base_url}/api/v1/users/me"
    
    # Perform OPTIONS request (preflight)
    headers = {
        'Origin': 'http://localhost',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
    
    try:
        response = requests.options(endpoint, headers=headers)
        print(f"Status Code: {response.status_code}")
        print("\nResponse Headers:")
        for key, value in response.headers.items():
            print(f"{key}: {value}")
            
        # Check for the crucial CORS headers
        if 'Access-Control-Allow-Origin' in response.headers:
            origin = response.headers['Access-Control-Allow-Origin']
            print(f"\nAllowed Origin: {origin}")
            if origin == '*':
                print("WARNING: Wildcard origin (*) doesn't allow credentials!")
            else:
                print(f"Origin '{origin}' is explicitly allowed")
                
        if 'Access-Control-Allow-Credentials' in response.headers:
            allow_creds = response.headers['Access-Control-Allow-Credentials']
            print(f"Allow Credentials: {allow_creds}")
            if allow_creds.lower() == 'true':
                print("Credentials are allowed ✓")
            else:
                print("Credentials are NOT allowed ✗")
        else:
            print("Access-Control-Allow-Credentials header is missing ✗")
            
        # Check for other important headers
        if 'Access-Control-Allow-Methods' in response.headers:
            print(f"Allowed Methods: {response.headers['Access-Control-Allow-Methods']}")
            
        if 'Access-Control-Allow-Headers' in response.headers:
            print(f"Allowed Headers: {response.headers['Access-Control-Allow-Headers']}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    print("Testing CORS configuration...")
    success = test_cors_preflight()
    print("\nCORS Test:", "PASSED" if success else "FAILED")
    sys.exit(0 if success else 1) 