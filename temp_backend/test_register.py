import requests
import json

def test_register():
    url = "http://localhost:8000/api/v1/auth/register"
    headers = {"Content-Type": "application/json"}
    data = {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "password123"
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    try:
        print(f"JSON Response: {response.json()}")
    except:
        print("Could not parse JSON response")

if __name__ == "__main__":
    test_register() 