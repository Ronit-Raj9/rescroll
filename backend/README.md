# Rescroll Backend

FastAPI backend for the Rescroll application.

## Project Structure

```
fastapi_backend/
├── app/
│   ├── api/           # API routes and dependencies
│   ├── core/          # Core configurations
│   ├── db/           # Database models and connections
│   ├── models/       # Pydantic models
│   ├── schemas/      # Request/Response schemas
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── static/          # Static files
│   ├── avatars/     # User avatars
│   ├── covers/      # Cover images
│   └── test_login.html  # Authentication test page
├── docs/           # API documentation
│   ├── README.md                          # Documentation overview
│   ├── api_documentation.md               # Detailed API documentation
│   └── rescroll_api_postman_collection.json  # Postman collection
└── logs/           # Application logs
```

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with the following content:
```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=rescroll
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_MINUTES=10080
EMAIL_RESET_TOKEN_EXPIRE_HOURS=48
ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## Running the Application

1. Make sure MongoDB is running on your system.

2. Run the application:
```bash
./run.sh
```

Or manually:
```bash
cd fastapi_backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

## API Documentation

### Interactive Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Detailed Documentation
- Documentation Overview: [docs/README.md](docs/README.md)
- API Documentation: [docs/api_documentation.md](docs/api_documentation.md)
- Postman Collection: [docs/rescroll_api_postman_collection.json](docs/rescroll_api_postman_collection.json)

### Testing the API
- Test Login Page: http://localhost:8000/static/test_login.html
- Test Scripts:
  - `test_login_fix.py`: Tests the login flow with the updated endpoint
  - `test_auth_fix.py`: Tests basic authentication
  - `test_cookie_auth.py`: Tests cookie-based authentication
  - `test_browser_auth.py`: Tests browser-like authentication flow
  - `test_cors.py`: Tests CORS configuration

## Recent API Changes

1. The login endpoint has been updated from `/login/access-token` to `/login`
2. The cookie domain has been fixed to use 'localhost' instead of the default domain
3. Cookie-based authentication works in browsers but not in the Python requests library
4. Token-based authentication works in both browser and non-browser environments

## Development

- Code formatting: `black .`
- Import sorting: `isort .`
- Type checking: `mypy .`
- Run tests: `pytest`

## Pre-commit Hooks

To set up pre-commit hooks:

```bash
pre-commit install
```

This will run the following checks before each commit:
- Code formatting (black)
- Import sorting (isort)
- Type checking (mypy)
- YAML validation
- File formatting
