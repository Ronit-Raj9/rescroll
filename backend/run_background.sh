#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Function to kill process using a port
kill_port() {
    port=$1
    pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process using port $port..."
        kill -9 $pid
    fi
}

# Kill Flower if running
kill_port 5555

# Start Celery worker
echo "Starting Celery worker..."
celery -A app.services.celery_tasks worker --loglevel=info &

# Start Celery beat for scheduled tasks
echo "Starting Celery beat..."
celery -A app.services.celery_tasks beat --loglevel=info &

# Start Flower for monitoring Celery
echo "Starting Flower..."
celery -A app.services.celery_tasks flower --port=5555 &

# Keep script running
tail -f /dev/null 