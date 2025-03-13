# Rescroll API v1

This is the documentation for version 1 of the Rescroll API.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000/api/v1
```

For production environments, replace `localhost:8000` with your domain.

## Authentication

All API endpoints require authentication. For detailed information about authentication methods, see the [Authentication Guide](authentication.md).

## Endpoints

The API is organized around the following resources:

### Authentication

- [Authentication Endpoints](endpoints/auth.md) - Register, login, refresh tokens, etc.

### Users

- [User Endpoints](endpoints/users.md) - User management, profiles, preferences

### Papers

- [Paper Endpoints](endpoints/papers.md) - Search papers, get details, generate summaries

### Profile Images

- [Profile Image Endpoints](endpoints/profile_images.md) - Upload and manage profile images

## Request & Response Format

All requests and responses use JSON format unless otherwise specified. For file uploads, `multipart/form-data` is used.

### Headers

For authenticated requests, include the following header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Pagination

Endpoints that return lists of items support pagination with the following query parameters:

- `skip` - Number of items to skip (default: 0)
- `limit` - Maximum number of items to return (default: 10, max: 100)

Example paginated response:

```json
{
  "total": 42,
  "items": [...],
  "skip": 0,
  "limit": 10
}
``` 