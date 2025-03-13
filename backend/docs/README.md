# Rescroll API Documentation

Welcome to the Rescroll API documentation. This documentation provides detailed information about the available endpoints, authentication methods, and usage examples.

## Documentation Structure

- [API Documentation](api/index.md) - Main API documentation
  - [API v1](api/v1/index.md) - Documentation for API v1
    - [Authentication](api/v1/authentication.md) - Authentication guide
    - Endpoints:
      - [Authentication Endpoints](api/v1/endpoints/auth.md)
      - [User Endpoints](api/v1/endpoints/users.md)
      - [Paper Endpoints](api/v1/endpoints/papers.md)
      - [Profile Image Endpoints](api/v1/endpoints/profile_images.md)

## Postman Collection

A Postman collection is available for testing the API:
- [Rescroll API Postman Collection](rescroll_api_postman_collection.json)

## Legacy Documentation

The following documentation files are kept for reference but are being phased out in favor of the new structure:
- [API Documentation (Legacy)](api_documentation.md)
- [Authentication (Legacy)](authentication.md)
- [Paper Summary API (Legacy)](paper_summary_api.md)
- [Profile Image API (Legacy)](profile_image_api.md)

## Getting Started

To get started with the Rescroll API:

1. Set up the backend by following the instructions in the [main README](../README.md)
2. Use the [Postman Collection](rescroll_api_postman_collection.json) to test the API
3. Refer to the [API Documentation](api/index.md) for detailed information about the endpoints

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