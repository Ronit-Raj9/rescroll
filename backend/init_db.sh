#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install package in development mode
pip install -e .

# Function to run PostgreSQL commands
run_psql() {
    sudo -u postgres psql -c "$1" || echo "Command failed but continuing: $1"
}

echo "Setting up PostgreSQL databases..."

# Create user and databases
run_psql "CREATE USER rescroll WITH PASSWORD 'postgres';"
run_psql "CREATE DATABASE rescroll;"
run_psql "CREATE DATABASE rescroll_analytics;"
run_psql "GRANT ALL PRIVILEGES ON DATABASE rescroll TO rescroll;"
run_psql "GRANT ALL PRIVILEGES ON DATABASE rescroll_analytics TO rescroll;"
run_psql "ALTER USER rescroll WITH SUPERUSER;"

echo "Creating and applying migrations..."
# Remove existing migrations if any
rm -rf alembic/versions/*

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head

echo "Database initialization complete!" 