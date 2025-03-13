#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")/../.." || exit

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "=== Running Paper Summary API Tests ==="
python -m pytest tests/integration/papers/test_paper_summary.py -v

# Deactivate virtual environment if it was activated
if [ -d "venv" ]; then
    deactivate
fi 