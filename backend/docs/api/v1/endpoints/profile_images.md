# Profile Image Endpoints

## Overview

The Profile Image endpoints provide functionality for managing user profile images. Images are stored in Cloudinary, a cloud-based image management service, and the URLs are saved in the user's profile.

## Upload Profile Image

Upload a new profile image for the authenticated user. If the user already has a profile image, the old one will be deleted from Cloudinary.

- **URL**: `/users/me/profile-image`
- **Method**: `POST`
- **Auth required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file` (File): The image file to upload (JPEG, PNG, etc.)

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "image_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/profile_images/abc123.jpg"
  }
  ```

### Error Response

- **Code**: 400 Bad Request
- **Content example**:
  ```json
  {
    "detail": "Invalid file format"
  }
  ```

- **Code**: 500 Internal Server Error
- **Content example**:
  ```json
  {
    "detail": "Error uploading image"
  }
  ```

## Delete Profile Image

Remove the profile image for the authenticated user.

- **URL**: `/users/me/profile-image`
- **Method**: `DELETE`
- **Auth required**: Yes

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "message": "Profile image deleted successfully"
  }
  ```

### Error Response

- **Code**: 404 Not Found
- **Content example**:
  ```json
  {
    "detail": "User has no profile image"
  }
  ```

- **Code**: 500 Internal Server Error
- **Content example**:
  ```json
  {
    "detail": "Error deleting image from Cloudinary"
  }
  ```

## Implementation Details

### Image Storage

Images are stored in Cloudinary with the following configuration:

- **Folder**: `profile_images`
- **Filename**: Generated using UUID to ensure uniqueness
- **Access**: Public (accessible via URL)

### Image Deletion

When a user uploads a new profile image or deletes their profile image, the old image is automatically deleted from Cloudinary to save storage space.

### Error Handling

The API includes robust error handling for various scenarios:

- Invalid file formats
- Failed uploads
- Authentication issues
- Permission issues

### Image URL in User Profile

The profile image URL is stored in the user's profile and is included in the response when retrieving user information via the `/users/me` endpoint. 