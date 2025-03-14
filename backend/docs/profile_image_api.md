# Profile Image API Documentation

This document provides detailed information about the Profile Image API endpoints, which allow users to upload, update, and remove profile images.

## Overview

The Profile Image API provides functionality for managing user profile images. Images are stored in Cloudinary, a cloud-based image management service, and the URLs are saved in the user's profile.

## Authentication

All endpoints require authentication using a Bearer token. To obtain a token, use the `/api/v1/auth/login/access-token` endpoint.

## Endpoints

### Upload Profile Image

Upload a new profile image for the authenticated user. If the user already has a profile image, the old one will be deleted from Cloudinary.

**URL**: `/api/v1/users/me/profile-image`

**Method**: `POST`

**Auth required**: Yes (Bearer Token)

**Content-Type**: `multipart/form-data`

**Form Parameters**:

| Name | Type   | Description                                |
|------|--------|--------------------------------------------|
| file | File   | The image file to upload (JPEG, PNG, etc.) |

**Success Response**:

- **Code**: 200 OK
- **Content**:
  ```json
  {
    "image_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/profile_images/abc123.jpg"
  }
  ```

**Error Responses**:

- **Code**: 401 Unauthorized
  - **Content**: `{"detail": "Not authenticated"}`

- **Code**: 400 Bad Request
  - **Content**: `{"detail": "Invalid file format"}`

- **Code**: 500 Internal Server Error
  - **Content**: `{"detail": "Error uploading image"}`

**Example**:

```bash
curl -X POST \
  http://localhost:8000/api/v1/users/me/profile-image \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -F 'file=@/path/to/your/image.jpg'
```

### Get User Profile with Image

Retrieve the authenticated user's profile, which includes the profile image URL if one exists.

**URL**: `/api/v1/users/me`

**Method**: `GET`

**Auth required**: Yes (Bearer Token)

**Success Response**:

- **Code**: 200 OK
- **Content**:
  ```json
  {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "full_name": "User Name",
    "profile_image": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/profile_images/abc123.jpg",
    "is_active": true,
    "is_superuser": false
  }
  ```

**Error Response**:

- **Code**: 401 Unauthorized
  - **Content**: `{"detail": "Not authenticated"}`

**Example**:

```bash
curl -X GET \
  http://localhost:8000/api/v1/users/me \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

### Update User Profile (Including Image URL)

Update the user's profile, which can include setting the profile image URL to null to remove it.

**URL**: `/api/v1/users/me`

**Method**: `PUT`

**Auth required**: Yes (Bearer Token)

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "profile_image": null
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**: Updated user object

**Error Response**:

- **Code**: 401 Unauthorized
  - **Content**: `{"detail": "Not authenticated"}`

**Example**:

```bash
curl -X PUT \
  http://localhost:8000/api/v1/users/me \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"profile_image": null}'
```

## Implementation Details

### Image Storage

Images are stored in Cloudinary with the following configuration:

- **Folder**: `profile_images`
- **Filename**: Generated using UUID to ensure uniqueness
- **Access**: Public (accessible via URL)

### Image Deletion

When a user uploads a new profile image or sets their profile image to null, the old image is automatically deleted from Cloudinary to save storage space.

### Error Handling

The API includes robust error handling for various scenarios:

- Invalid file formats
- Failed uploads
- Authentication issues
- Permission issues

## Testing

A test script is provided in `test_profile_image.py` that demonstrates the complete workflow:

1. Register a new user
2. Login to get an access token
3. Upload a profile image
4. Get the user profile to verify the image URL
5. Update the profile image
6. Delete the profile image by setting it to null

Run the test script with:

```bash
python test_profile_image.py
``` 