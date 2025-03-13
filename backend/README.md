# Rescroll Backend

This is the FastAPI backend for the Rescroll application.

## Project Structure

- `app/`: Main application directory
  - `api/`: API routes
  - `core/`: Core configurations
  - `db/`: Database models and connections
  - `models/`: SQLAlchemy models
  - `schemas/`: Pydantic models/schemas
  - `services/`: Business logic services
  - `utils/`: Utility functions
- `static/`: Static files
- `docs/`: API documentation
  - `api/`: Structured API documentation
  - Legacy documentation files
- `tests/`: Test files
  - `integration/`: Integration tests
  - `unit/`: Unit tests
  - `scripts/`: Test scripts
- `logs/`: Log files
- `alembic/`: Database migrations

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   # Project information
   PROJECT_NAME=Rescroll
   VERSION=0.1.0
   DESCRIPTION="Rescroll API"
   
   # CORS
   BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
   
   # PostgreSQL
   POSTGRES_SERVER=localhost
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=rescroll
   POSTGRES_PORT=5432
   
   # MongoDB
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=rescroll
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   REDIS_URL=redis://localhost:6379/0
   
   # JWT
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # AI/ML
   GEMINI_API_KEY=your-gemini-api-key
   MODEL_NAME=gemini-pro
   MAX_TOKENS=1024
   
   # Research Paper API
   RESEARCH_PAPER_API_URL=https://api.example.com/papers
   
   # Analytics DB
   ANALYTICS_DB_URL=postgresql://postgres:password@localhost:5432/rescroll_analytics
   
   # Celery
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/0
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## Running the Application

Make sure MongoDB is running, then:

1. Run the application using the script:
   ```bash
   ./run.sh
   ```

   Or manually:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Access the API at `http://localhost:8000`

## API Documentation

- Interactive API documentation (Swagger UI): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Detailed API documentation: [docs/api/index.md](docs/api/index.md)
- Postman collection: [docs/rescroll_api_postman_collection.json](docs/rescroll_api_postman_collection.json)

## Testing the API

The `tests` directory contains tests for different aspects of the API:

### Running Tests

Use the test runner script to run tests:

```bash
# Run all tests
./tests/scripts/run_tests.sh --all

# Run authentication tests
./tests/scripts/run_tests.sh --auth

# Run user management tests
./tests/scripts/run_tests.sh --users

# Run paper tests
./tests/scripts/run_tests.sh --papers
```

Or run individual test scripts:

```bash
# Run paper summary test
./tests/scripts/test_paper_summary.sh

# Run profile image test
./tests/scripts/test_delete_profile_image.sh
```

## Recent API Changes

- Added Paper Summary API for retrieving and summarizing arXiv papers
- Updated authentication endpoints to use `/auth/` prefix
- Added profile image upload and deletion functionality
- Improved error handling and validation
- Restructured API documentation for better organization
- Reorganized test files into a structured directory

## Development

- Follow PEP 8 style guidelines
- Use type hints
- Write tests for new features
- Document API endpoints

## Pre-commit Hooks

Set up pre-commit hooks to ensure code quality:

```bash
pre-commit install
```

This will run the following checks before each commit:
- Code formatting (black)
- Import sorting (isort)
- Type checking (mypy)
- YAML validation
- File formatting
