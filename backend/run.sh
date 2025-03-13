#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Create necessary directories if they don't exist
mkdir -p fastapi_backend/static/{avatars,covers}
mkdir -p fastapi_backend/logs

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi

# Run the FastAPI application with uvicorn
cd fastapi_backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 