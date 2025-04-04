#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install package in development mode
pip install -e .

echo "Setting up database with Supabase..."

echo "Creating and applying migrations..."
# Remove existing migrations if any
rm -rf alembic/versions/*

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head

echo "Database initialization complete!" 