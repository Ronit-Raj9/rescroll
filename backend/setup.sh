#!/bin/bash

# Create necessary directories
mkdir -p app logs alembic

# Set permissions for directories
chmod 755 app
chmod 755 alembic
chmod 777 logs

# Create alembic.ini if it doesn't exist
if [ ! -f alembic.ini ]; then
    cp alembic.ini.example alembic.ini
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Set permissions for files
chmod 644 alembic.ini
chmod 644 .env
chmod 644 requirements.txt

# Create __init__.py files if they don't exist
touch app/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/api/v1/endpoints/__init__.py
touch app/core/__init__.py
touch app/crud/__init__.py
touch app/db/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/tasks/__init__.py
touch app/utils/__init__.py

# Set permissions for __init__.py files
find . -name "__init__.py" -exec chmod 644 {} \;

echo "Setup completed successfully!" 