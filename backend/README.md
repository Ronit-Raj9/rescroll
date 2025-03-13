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
│   └── covers/      # Cover images
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
ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:3000"]
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

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

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
