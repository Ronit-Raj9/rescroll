import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_profile_image_workflow():
    """
    Test the complete profile image workflow:
    1. Register a new user
    2. Login to get access token
    3. Upload a profile image
    4. Get user profile to verify the image URL
    5. Update the profile image
    6. Delete the profile image by setting it to null
    """
    print("Starting profile image workflow test...")
    
    # 1. Register a new user
    username = f"testuser_{os.urandom(4).hex()}"
    email = f"{username}@example.com"
    password = "testpassword123"
    
    register_data = {
        "email": email,
        "username": username,
        "full_name": "Test User",
        "password": password
    }
    
    print(f"Registering user: {username}")
    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json=register_data
    )
    
    if register_response.status_code != 200:
        print(f"Failed to register user: {register_response.text}")
        return
    
    print("User registered successfully")
    user_id = register_response.json()["id"]
    
    # 2. Login to get access token
    login_data = {
        "username": email,  # OAuth2 uses username field for email
        "password": password
    }
    
    print("Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login/access-token",
        data=login_data
    )
    
    if login_response.status_code != 200:
        print(f"Failed to login: {login_response.text}")
        return
    
    tokens = login_response.json()
    access_token = tokens["access_token"]
    refresh_token = tokens.get("refresh_token")
    
    print(f"Login successful. Access token: {access_token[:10]}...")
    print(f"Refresh token: {refresh_token[:10] if refresh_token else 'None'}...")
    
    # Set up headers for authenticated requests
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # 3. Upload a profile image
    # For testing, we'll use a sample image file
    image_path = "test_image.jpg"
    
    # Create a test image if it doesn't exist
    if not os.path.exists(image_path):
        print("Creating a test image...")
        from PIL import Image
        img = Image.new('RGB', (100, 100), color = (73, 109, 137))
        img.save(image_path)
    
    print("Uploading profile image...")
    with open(image_path, "rb") as image_file:
        files = {"file": (os.path.basename(image_path), image_file, "image/jpeg")}
        upload_response = requests.post(
            f"{BASE_URL}/users/me/profile-image",
            headers=headers,
            files=files
        )
    
    if upload_response.status_code != 200:
        print(f"Failed to upload image: {upload_response.text}")
        return
    
    image_url = upload_response.json()["image_url"]
    print(f"Image uploaded successfully. URL: {image_url}")
    
    # 4. Get user profile to verify the image URL
    print("Getting user profile...")
    profile_response = requests.get(
        f"{BASE_URL}/users/me",
        headers=headers
    )
    
    if profile_response.status_code != 200:
        print(f"Failed to get profile: {profile_response.text}")
        return
    
    profile = profile_response.json()
    print(f"Profile retrieved. Image URL: {profile.get('profile_image')}")
    
    if profile.get("profile_image") != image_url:
        print("Warning: Profile image URL doesn't match the uploaded image URL")
    
    # 5. Update the profile image
    print("Uploading a new profile image...")
    with open(image_path, "rb") as image_file:
        files = {"file": (f"updated_{os.path.basename(image_path)}", image_file, "image/jpeg")}
        update_response = requests.post(
            f"{BASE_URL}/users/me/profile-image",
            headers=headers,
            files=files
        )
    
    if update_response.status_code != 200:
        print(f"Failed to update image: {update_response.text}")
        return
    
    new_image_url = update_response.json()["image_url"]
    print(f"Image updated successfully. New URL: {new_image_url}")
    
    # 6. Delete the profile image by setting it to null
    print("Removing profile image...")
    update_data = {
        "profile_image": None
    }
    
    delete_response = requests.put(
        f"{BASE_URL}/users/me",
        headers=headers,
        json=update_data
    )
    
    if delete_response.status_code != 200:
        print(f"Failed to remove profile image: {delete_response.text}")
        return
    
    print("Profile image removed successfully")
    
    # Verify the image was removed
    print("Verifying profile image was removed...")
    final_profile_response = requests.get(
        f"{BASE_URL}/users/me",
        headers=headers
    )
    
    if final_profile_response.status_code != 200:
        print(f"Failed to get final profile: {final_profile_response.text}")
        return
    
    final_profile = final_profile_response.json()
    if final_profile.get("profile_image") is None:
        print("Profile image successfully removed")
    else:
        print(f"Warning: Profile image still exists: {final_profile.get('profile_image')}")
    
    print("Profile image workflow test completed successfully!")

if __name__ == "__main__":
    test_profile_image_workflow() 