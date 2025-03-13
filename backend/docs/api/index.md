# Rescroll API Documentation

Welcome to the Rescroll API documentation. This documentation provides detailed information about the available endpoints, authentication methods, and usage examples.

## API Versions

- [API v1](/api/v1/index.md) - Current stable version

## Authentication

All API endpoints require authentication. For detailed information about authentication methods, see the [Authentication Guide](/api/v1/authentication.md).

## Available Resources

The Rescroll API provides the following resources:

- [Users](/api/v1/endpoints/users.md) - User management endpoints
- [Authentication](/api/v1/endpoints/auth.md) - Authentication endpoints
- [Papers](/api/v1/endpoints/papers.md) - Paper search and summary endpoints
- [Profile Images](/api/v1/endpoints/profile_images.md) - Profile image management

## Testing

For testing the API, you can use the provided [Postman Collection](/rescroll_api_postman_collection.json).

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of an error, the response will include a JSON object with an error message.

Example error response:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common error codes:

- `400 Bad Request` - The request was invalid or cannot be served
- `401 Unauthorized` - Authentication is required or has failed
- `403 Forbidden` - The authenticated user doesn't have permission
- `404 Not Found` - The requested resource doesn't exist
- `500 Internal Server Error` - An error occurred on the server 