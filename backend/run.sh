#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated."
else
    echo "No virtual environment found. Consider creating one with: python -m venv venv"
fi

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
mkdir -p static/{avatars,covers}

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Start Redis server if not running
if command -v redis-server &> /dev/null; then
    if ! pgrep redis-server > /dev/null; then
        echo "Starting Redis server..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start redis-server
        else
            redis-server --daemonize yes
        fi
        # Wait for Redis to start
        sleep 2
    else
        echo "Redis server is already running."
    fi
else
    echo "Redis server not found. Skipping Redis startup."
fi

# Start FastAPI application with uvicorn
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload