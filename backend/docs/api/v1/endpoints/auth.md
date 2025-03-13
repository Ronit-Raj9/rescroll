# Authentication Endpoints

## Register

Register a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123",
    "full_name": "User Name"
  }
  ```

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "full_name": "User Name",
    "is_active": true,
    "is_superuser": false
  }
  ```

### Error Response

- **Code**: 400 Bad Request
- **Content example**:
  ```json
  {
    "detail": "Email already registered"
  }
  ```

## Login

Authenticate a user and get access token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "username": "username",
    "password": "password123"
  }
  ```

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```
- **Cookies**: Sets `access_token` and `refresh_token` HTTP-only cookies

### Error Response

- **Code**: 401 Unauthorized
- **Content example**:
  ```json
  {
    "detail": "Incorrect username or password"
  }
  ```

## Refresh Token

Get a new access token using a refresh token.

- **URL**: `/auth/refresh-token`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Cookies**: Can also use the `refresh_token` cookie instead of request body

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```
- **Cookies**: Updates `access_token` and `refresh_token` HTTP-only cookies

### Error Response

- **Code**: 401 Unauthorized
- **Content example**:
  ```json
  {
    "detail": "Invalid refresh token"
  }
  ```

## Logout

Logout a user by clearing authentication cookies.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth required**: No

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Cookies**: Clears `access_token` and `refresh_token` cookies

## Test Token

Test if the current authentication token is valid.

- **URL**: `/auth/test-token`
- **Method**: `POST`
- **Auth required**: Yes (Bearer Token or Cookie)

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "full_name": "User Name",
    "is_active": true,
    "is_superuser": false
  }
  ```

### Error Response

- **Code**: 401 Unauthorized
- **Content example**:
  ```json
  {
    "detail": "Not authenticated"
  }
  ``` 