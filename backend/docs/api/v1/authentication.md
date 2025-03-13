# Authentication

## Overview

The Rescroll API uses a robust authentication system that supports both token-based and cookie-based authentication methods. This dual approach provides flexibility for different client types (browser applications, mobile apps, API clients).

## Authentication Methods

### 1. Token-Based Authentication (Bearer Token)

Token-based authentication uses JWT (JSON Web Tokens) and is implemented via the OAuth2 password flow:

- Clients send credentials (username/password) to obtain access and refresh tokens
- Access tokens are short-lived (default: 8 days)
- Refresh tokens are long-lived (default: 30 days) and can be used to obtain new access tokens
- Tokens must be included in the `Authorization` header as `Bearer {token}`

### 2. Cookie-Based Authentication

Cookie-based authentication stores the same JWT tokens in HTTP-only cookies:

- Access tokens and refresh tokens are stored in cookies named `access_token` and `refresh_token`
- Cookies are HTTP-only (not accessible via JavaScript) for security
- SameSite is set to "none" to allow cross-origin requests (with Secure flag)
- Secure flag is enabled to ensure cookies are only sent over HTTPS (in production)

## Authentication Flow

### Registration

1. Client sends user details to `/auth/register` endpoint
2. Server creates a new user and returns user information
3. Client must then login to obtain tokens

### Login

1. Client sends credentials to `/auth/login` endpoint
2. Server validates credentials and returns:
   - Access token and refresh token in the response body
   - Access token and refresh token in HTTP-only cookies

### Token Refresh

1. Client sends a refresh token to `/auth/refresh-token` endpoint
   - Token can be sent in the request body or via cookie
2. Server validates the refresh token and returns:
   - New access token and refresh token in the response body
   - New access token and refresh token in HTTP-only cookies

### Logout

1. Client sends a request to `/auth/logout` endpoint
2. Server clears the authentication cookies

## Security Considerations

### Token Storage

- In browser applications:
  - Tokens are stored in HTTP-only cookies
  - This protects against XSS attacks as JavaScript cannot access the cookies
  
- In non-browser applications:
  - Tokens should be stored securely according to platform best practices
  - For mobile apps, use secure storage mechanisms provided by the platform

### CORS Configuration

The application is configured to allow cross-origin requests with credentials:

- Specific origins are allowed (not wildcard `*`)
- `Access-Control-Allow-Credentials` is set to `true`
- Cookies use `SameSite=None` and `Secure=True` for cross-origin requests

### Cookie Settings

All authentication cookies have the following security settings:

- `httponly=True`: Prevents JavaScript access
- `secure=True`: Ensures cookies are only sent over HTTPS
- `samesite="none"`: Allows cross-origin requests (with Secure flag)
- Appropriate expiration times matching the token lifetimes

## Troubleshooting

### Common Issues

1. **"Not authenticated" errors**
   - Check that cookies are being sent with requests (credentials: 'include')
   - Verify that CORS is properly configured for your domain
   - Ensure cookies are not being blocked by browser settings

2. **CORS issues**
   - Ensure your frontend origin is in the allowed origins list
   - Check that credentials are included in requests
   - Verify that SameSite and Secure cookie settings are appropriate

3. **Token extraction issues**
   - Check browser console for any errors
   - Verify that cookies are being set correctly
   - Ensure the token format is correct (no extra quotes or Bearer prefix in cookies) 