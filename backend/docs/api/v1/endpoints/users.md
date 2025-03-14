# User Endpoints

## Get Users

Retrieve a list of users. Only accessible to admin users.

- **URL**: `/users/`
- **Method**: `GET`
- **Auth required**: Yes (Admin only)
- **Query Parameters**:
  - `skip` (integer, optional): Number of users to skip (default: 0)
  - `limit` (integer, optional): Maximum number of users to return (default: 10)

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  [
    {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "full_name": "User Name",
      "is_active": true,
      "is_superuser": false
    },
    {
      "id": 124,
      "email": "user2@example.com",
      "username": "username2",
      "full_name": "User Two",
      "is_active": true,
      "is_superuser": false
    }
  ]
  ```

### Error Response

- **Code**: 401 Unauthorized
- **Content example**:
  ```json
  {
    "detail": "Not authenticated"
  }
  ```

- **Code**: 403 Forbidden
- **Content example**:
  ```json
  {
    "detail": "The user doesn't have enough privileges"
  }
  ```

## Get User

Retrieve a specific user by ID.

- **URL**: `/users/{user_id}`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**:
  - `user_id` (integer): ID of the user to retrieve

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

- **Code**: 404 Not Found
- **Content example**:
  ```json
  {
    "detail": "User not found"
  }
  ```

## Get Current User

Retrieve the currently authenticated user.

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth required**: Yes

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

## Update Current User

Update the currently authenticated user's information.

- **URL**: `/users/me`
- **Method**: `PUT`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "full_name": "Updated Name",
    "email": "updated@example.com",
    "password": "newpassword123"  // Optional
  }
  ```

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "id": 123,
    "email": "updated@example.com",
    "username": "username",
    "full_name": "Updated Name",
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

## Create User

Create a new user (admin only).

- **URL**: `/users/`
- **Method**: `POST`
- **Auth required**: Yes (Admin only)
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "password123",
    "full_name": "New User",
    "is_superuser": false
  }
  ```

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "id": 125,
    "email": "newuser@example.com",
    "username": "newuser",
    "full_name": "New User",
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

## Update User

Update a specific user (admin only).

- **URL**: `/users/{user_id}`
- **Method**: `PUT`
- **Auth required**: Yes (Admin only)
- **URL Parameters**:
  - `user_id` (integer): ID of the user to update
- **Request Body**:
  ```json
  {
    "full_name": "Updated User",
    "email": "updated@example.com",
    "password": "newpassword123",  // Optional
    "is_active": true,
    "is_superuser": false
  }
  ```

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "id": 123,
    "email": "updated@example.com",
    "username": "username",
    "full_name": "Updated User",
    "is_active": true,
    "is_superuser": false
  }
  ```

### Error Response

- **Code**: 404 Not Found
- **Content example**:
  ```json
  {
    "detail": "User not found"
  }
  ``` 