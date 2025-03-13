# Rescroll API Documentation

This directory contains comprehensive documentation for the Rescroll API.

## Available Documentation

### API Documentation

- [**api_documentation.md**](./api_documentation.md): Detailed documentation of all API endpoints, including request/response formats, authentication methods, and examples.

### Postman Collection

- [**rescroll_api_postman_collection.json**](./rescroll_api_postman_collection.json): A ready-to-import Postman collection for testing all API endpoints.

## Quick Start

1. **Import the Postman Collection**:
   - Open Postman
   - Click "Import" > "File" > Select `rescroll_api_postman_collection.json`
   - Create an environment with a variable `base_url` set to `http://localhost:8000/api/v1`

2. **Test in Browser**:
   - Navigate to `http://localhost:8000/static/test_login.html` to test the authentication flow in a browser

## Authentication

The API supports two authentication methods:

1. **Bearer Token Authentication**: Include the access token in the `Authorization` header
   ```
   Authorization: Bearer <access_token>
   ```

2. **Cookie-based Authentication**: Tokens are stored in HTTP-only cookies, set automatically when using the login endpoint with a browser.

## Recent Changes

1. The login endpoint has been updated from `/login/access-token` to `/login`
2. The cookie domain has been fixed to use 'localhost' instead of the default domain
3. Cookie-based authentication works in browsers but not in the Python requests library
4. Token-based authentication works in both browser and non-browser environments

## Testing Tools

For testing the API, you can use:
- The browser-based test page at `/static/test_login.html`
- The Postman collection at `/docs/rescroll_api_postman_collection.json`
- Python test scripts like `test_login_fix.py` and `test_browser_auth.py` 