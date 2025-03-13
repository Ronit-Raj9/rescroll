# Rescroll API Documentation

## Overview

This document provides detailed information about all user-related APIs in the Rescroll application. The API follows RESTful principles and uses JWT (JSON Web Token) for authentication.

## Base URL

All API endpoints are prefixed with:

```
http://localhost:8000/api/v1
```

For production environments, replace `localhost:8000` with your domain.

## Authentication

The API supports two authentication methods:

1. **Bearer Token Authentication**: Include the access token in the `Authorization` header
2. **Cookie-based Authentication**: Tokens are stored in HTTP-only cookies

### Authentication Headers

For Bearer token authentication, include the following header:

```
Authorization: Bearer <access_token>
```

### Authentication Cookies

For cookie-based authentication, the following cookies are used:

- `access_token`: Contains the JWT access token
- `refresh_token`: Contains the JWT refresh token

These cookies are set automatically when using the login endpoint with a browser. They are configured with:
- `httponly`: True (prevents JavaScript access)
- `secure`: True (requires HTTPS)
- `samesite`: "none" (allows cross-origin requests)
- `domain`: "localhost" (for local development)

## Response Format

All responses are in JSON format. Successful responses typically include:

```json
{
  "field1": "value1",
  "field2": "value2",
  ...
}
```

Error responses include:

```json
{
  "detail": "Error message"
}
```

## Status Codes

The API uses standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Authentication APIs

### Register User

Creates a new user account.

**URL**: `/auth/register`

**Method**: `POST`

**Auth required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "User Name"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "User Name",
  "is_active": true,
  "is_superuser": false,
  "profile_image": null
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "detail": "A user with this email already exists."
}
```

OR

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "detail": "A user with this username already exists."
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "password123",
    "full_name": "User Name"
  }'
```

### Login

Authenticates a user and returns access and refresh tokens.

**URL**: `/auth/login`

**Method**: `POST`

**Auth required**: No

**Content-Type**: `application/x-www-form-urlencoded`

**Form Parameters**:
- `username`: Email address
- `password`: Password

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Cookies**: Sets `access_token` and `refresh_token` HTTP-only cookies

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "detail": "Incorrect email or password"
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=user@example.com&password=password123"
```

For browser-based applications (with cookie storage):
```javascript
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'username=user@example.com&password=password123',
  credentials: 'include'  // Important for cookies
})
```

### Refresh Token

Refreshes an expired access token using a valid refresh token.

**URL**: `/auth/refresh-token`

**Method**: `POST`

**Auth required**: No

**Request Sources**:
1. Cookie: `refresh_token`
2. Request Body:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Cookies**: Updates `access_token` and `refresh_token` HTTP-only cookies

**Error Responses**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Refresh token is required"
}
```

OR

- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Invalid refresh token"
}
```

**Example**:
```bash
# Using request body
curl -X POST http://localhost:8000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Using cookie (browser)
fetch('http://localhost:8000/api/v1/auth/refresh-token', {
  method: 'POST',
  credentials: 'include'  // Important for cookies
})
```

### Logout

Logs out a user by clearing authentication cookies.

**URL**: `/auth/logout`

**Method**: `POST`

**Auth required**: No

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Successfully logged out"
}
```
- **Cookies**: Clears `access_token` and `refresh_token` cookies

**Example**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout
```

For browser-based applications:
```javascript
fetch('http://localhost:8000/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include'  // Important for cookies
})
```

### Test Token

Tests if an access token is valid.

**URL**: `/auth/login/test-token`

**Method**: `POST`

**Auth required**: Yes

**Success Response**:
- **Code**: 200 OK
- **Content**: User object

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

**Example**:
```bash
# Using Bearer token
curl -X POST http://localhost:8000/api/v1/auth/login/test-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookies (browser)
fetch('http://localhost:8000/api/v1/auth/login/test-token', {
  method: 'POST',
  credentials: 'include'  // Important for cookies
})
```

## User Management APIs

### Get Current User

Retrieves the profile of the currently authenticated user.

**URL**: `/users/me`

**Method**: `GET`

**Auth required**: Yes

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "User Name",
  "is_active": true,
  "is_superuser": false,
  "profile_image": "https://res.cloudinary.com/example/image/upload/v1234567890/profile_images/user_image.jpg"
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

**Example**:
```bash
# Using Bearer token
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookies (browser)
fetch('http://localhost:8000/api/v1/users/me', {
  method: 'GET',
  credentials: 'include'  // Important for cookies
})
```

### Update Current User

Updates the profile of the currently authenticated user.

**URL**: `/users/me`

**Method**: `PUT`

**Auth required**: Yes

**Request Body**:
```json
{
  "email": "updated@example.com",
  "username": "updated_username",
  "full_name": "Updated Name",
  "password": "new_password123"  // Optional
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "id": 1,
  "email": "updated@example.com",
  "username": "updated_username",
  "full_name": "Updated Name",
  "is_active": true,
  "is_superuser": false,
  "profile_image": "https://res.cloudinary.com/example/image/upload/v1234567890/profile_images/user_image.jpg"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "detail": "A user with this email already exists."
}
```

OR

- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

**Example**:
```bash
# Using Bearer token
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "username": "updated_username",
    "full_name": "Updated Name"
  }'

# Using cookies (browser)
fetch('http://localhost:8000/api/v1/users/me', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'updated@example.com',
    username: 'updated_username',
    full_name: 'Updated Name'
  }),
  credentials: 'include'  // Important for cookies
})
```

### Upload Profile Image

Uploads a profile image for the currently authenticated user.

**URL**: `/users/me/profile-image`

**Method**: `POST`

**Auth required**: Yes

**Content-Type**: `multipart/form-data`

**Form Parameters**:
- `file`: Image file (JPEG, PNG, etc.)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "User Name",
  "is_active": true,
  "is_superuser": false,
  "profile_image": "https://res.cloudinary.com/example/image/upload/v1234567890/profile_images/user_image.jpg"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "detail": "Invalid image file"
}
```

OR

- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

**Example**:
```bash
# Using Bearer token
curl -X POST http://localhost:8000/api/v1/users/me/profile-image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/image.jpg"

# Using cookies (browser)
const formData = new FormData();
formData.append('file', imageFile);

fetch('http://localhost:8000/api/v1/users/me/profile-image', {
  method: 'POST',
  body: formData,
  credentials: 'include'  // Important for cookies
})
```

### Delete Profile Image

Removes the profile image of the currently authenticated user.

**URL**: `/users/me/profile-image`

**Method**: `DELETE`

**Auth required**: Yes

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "User Name",
  "is_active": true,
  "is_superuser": false,
  "profile_image": null
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

**Example**:
```bash
# Using Bearer token
curl -X DELETE http://localhost:8000/api/v1/users/me/profile-image \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookies (browser)
fetch('http://localhost:8000/api/v1/users/me/profile-image', {
  method: 'DELETE',
  credentials: 'include'  // Important for cookies
})
```

### Get User by ID

Retrieves a user profile by ID.

**URL**: `/users/{user_id}`

**Method**: `GET`

**Auth required**: Yes

**URL Parameters**:
- `user_id`: ID of the user to retrieve

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "User Name",
  "is_active": true,
  "is_superuser": false,
  "profile_image": "https://res.cloudinary.com/example/image/upload/v1234567890/profile_images/user_image.jpg"
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "detail": "User not found"
}
```

OR

- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

**Example**:
```bash
# Using Bearer token
curl -X GET http://localhost:8000/api/v1/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookies (browser)
fetch('http://localhost:8000/api/v1/users/1', {
  method: 'GET',
  credentials: 'include'  // Important for cookies
})
```

### Get Users

Retrieves a list of users with pagination.

**URL**: `/users/`

**Method**: `GET`

**Auth required**: Yes (Admin only)

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
[
  {
    "id": 1,
    "email": "user1@example.com",
    "username": "username1",
    "full_name": "User One",
    "is_active": true,
    "is_superuser": false,
    "profile_image": "https://res.cloudinary.com/example/image/upload/v1234567890/profile_images/user1_image.jpg"
  },
  {
    "id": 2,
    "email": "user2@example.com",
    "username": "username2",
    "full_name": "User Two",
    "is_active": true,
    "is_superuser": false,
    "profile_image": null
  }
]
```

**Error Responses**:
- **Code**: 401 Unauthorized
- **Content**:
```json
{
  "detail": "Not authenticated"
}
```

OR

- **Code**: 403 Forbidden
- **Content**:
```json
{
  "detail": "Not enough permissions"
}
```

**Example**:
```bash
# Using Bearer token
curl -X GET "http://localhost:8000/api/v1/users/?skip=0&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Using cookies (browser)
fetch('http://localhost:8000/api/v1/users/?skip=0&limit=10', {
  method: 'GET',
  credentials: 'include'  // Important for cookies
})
```

## Password Management APIs

### Password Recovery

Initiates the password recovery process by sending a reset token.

**URL**: `/auth/password-recovery/{email}`

**Method**: `POST`

**Auth required**: No

**URL Parameters**:
- `email`: Email address of the user

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "msg": "Password recovery email sent"
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "detail": "The user with this email does not exist in the system."
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/password-recovery/user@example.com
```

### Reset Password

Resets a user's password using a valid reset token.

**URL**: `/auth/reset-password/`

**Method**: `POST`

**Auth required**: No

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "new_password123"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "msg": "Password updated successfully"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "detail": "Invalid token"
}
```

OR

- **Code**: 404 Not Found
- **Content**:
```json
{
  "detail": "The user with this email does not exist in the system."
}
```

**Example**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "new_password": "new_password123"
  }'
```

## Client Implementation Guide

### Browser-based Applications

For browser-based applications, we recommend using cookie-based authentication:

1. **Login**:
```javascript
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      credentials: 'include'  // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

2. **Get User Profile**:
```javascript
async function getUserProfile() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/users/me', {
      method: 'GET',
      credentials: 'include'  // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}
```

3. **Refresh Token**:
```javascript
async function refreshToken() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/refresh-token', {
      method: 'POST',
      credentials: 'include'  // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}
```

4. **Logout**:
```javascript
async function logout() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include'  // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}
```

### Mobile/Desktop Applications

For non-browser applications, we recommend using token-based authentication:

1. **Login**:
```javascript
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    // Store tokens securely
    saveTokens(data.access_token, data.refresh_token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

2. **Get User Profile**:
```javascript
async function getUserProfile() {
  try {
    const accessToken = getAccessToken(); // Get from secure storage
    
    const response = await fetch('http://localhost:8000/api/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await refreshToken();
        return getUserProfile(); // Retry with new token
      }
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}
```

3. **Refresh Token**:
```javascript
async function refreshToken() {
  try {
    const refreshToken = getRefreshToken(); // Get from secure storage
    
    const response = await fetch('http://localhost:8000/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    // Store new tokens securely
    saveTokens(data.access_token, data.refresh_token);
    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}
```

## Error Handling

When working with the API, it's important to handle errors appropriately:

1. **401 Unauthorized**: The user is not authenticated or the token has expired
   - For expired tokens, try refreshing the access token
   - If refresh fails, redirect to login

2. **403 Forbidden**: The user doesn't have permission to access the resource
   - Display an appropriate error message
   - Do not retry the request

3. **404 Not Found**: The requested resource doesn't exist
   - Display an appropriate error message
   - Check if the resource ID is correct

4. **400 Bad Request**: The request contains invalid parameters
   - Display validation errors to the user
   - Check the request format

5. **500 Internal Server Error**: Server-side error
   - Display a generic error message
   - Consider implementing retry logic with backoff

## CORS Considerations

The API is configured to allow cross-origin requests with credentials. When making requests from a different domain:

1. Ensure your domain is in the allowed origins list
2. Always include `credentials: 'include'` in fetch requests
3. Set `withCredentials: true` in axios requests

## Testing the API

A test HTML page is available at `/static/test_login.html` that demonstrates the complete authentication flow. Use this page to:

1. Register a new user
2. Login to get tokens
3. Access protected endpoints
4. Refresh tokens
5. Logout

Additionally, you can use the provided test scripts:
- `test_login_fix.py`: Tests the login flow with the updated endpoint
- `test_auth_fix.py`: Tests basic authentication
- `test_cookie_auth.py`: Tests cookie-based authentication
- `test_browser_auth.py`: Tests browser-like authentication flow
- `test_cors.py`: Tests CORS configuration

## Known Issues and Workarounds

1. **Python Requests Library and Cookies**: The Python requests library doesn't handle cookies in the same way as browsers. Cookie-based authentication works in browsers but may fail in the Python requests library. Use token-based authentication for Python scripts.

2. **SameSite Cookie Attribute**: Cookies are set with `SameSite=None` and `Secure=True` to allow cross-origin requests. This requires HTTPS in production environments.

3. **Cookie Domain**: Cookies are set with the domain "localhost" for local development. In production, you'll need to set the appropriate domain.

## Recent Changes

1. The login endpoint has been updated from `/login/access-token` to `/login`
2. The cookie domain has been fixed to use 'localhost' instead of the default domain
3. Cookie-based authentication works in browsers but not in the Python requests library
4. Token-based authentication works in both browser and non-browser environments 