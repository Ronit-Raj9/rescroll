#!/bin/bash

# Script to run the paper summary test

# Check if we're in a virtual environment, if not, try to activate it
if [[ -z "$VIRTUAL_ENV" ]]; then
    if [[ -d "venv" ]]; then
        echo "Activating virtual environment..."
        source venv/bin/activate
    else
        echo "No virtual environment found. Please create one and install dependencies."
        exit 1
    fi
fi

# Run the test script
echo "Running paper summary test..."
python test_paper_summary.py

# Deactivate virtual environment if we activated it
if [[ -n "$VIRTUAL_ENV" && "$VIRTUAL_ENV" == *"venv"* ]]; then
    echo "Deactivating virtual environment..."
    deactivate
fi 