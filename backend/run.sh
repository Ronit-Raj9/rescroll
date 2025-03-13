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

# Kill processes using our ports
kill_port 8000  # FastAPI
kill_port 5555  # Flower
kill_port 6379  # Redis

# Create necessary directories
mkdir -p logs static

# Start Redis server if not running
if ! pgrep redis-server > /dev/null; then
    echo "Starting Redis server..."
    sudo systemctl start redis-server
fi

# Wait for Redis to start
sleep 2

# Start FastAPI application with uvicorn
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 