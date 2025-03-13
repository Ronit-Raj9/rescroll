#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")/../.." || exit

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Default values
RUN_ALL=false
RUN_AUTH=false
RUN_USERS=false
RUN_PAPERS=false
VERBOSE=false

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --all)
            RUN_ALL=true
            ;;
        --auth)
            RUN_AUTH=true
            ;;
        --users)
            RUN_USERS=true
            ;;
        --papers)
            RUN_PAPERS=true
            ;;
        --verbose)
            VERBOSE=true
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --all       Run all tests"
            echo "  --auth      Run authentication tests"
            echo "  --users     Run user management tests"
            echo "  --papers    Run paper-related tests"
            echo "  --verbose   Show verbose output"
            echo "  --help      Show this help message"
            exit 0
            ;;
    esac
done

# If no specific test type is selected, run all tests
if [ "$RUN_ALL" = false ] && [ "$RUN_AUTH" = false ] && [ "$RUN_USERS" = false ] && [ "$RUN_PAPERS" = false ]; then
    RUN_ALL=true
fi

# Function to run tests with proper output
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo "Running $test_name tests..."
    
    if [ "$VERBOSE" = true ]; then
        python -m pytest "$test_file" -v
    else
        python -m pytest "$test_file"
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "✅ $test_name tests passed"
    else
        echo "❌ $test_name tests failed"
    fi
    
    echo ""
    return $exit_code
}

# Initialize exit code
EXIT_CODE=0

# Run tests based on arguments
if [ "$RUN_ALL" = true ] || [ "$RUN_AUTH" = true ]; then
    run_test "tests/integration/auth" "Authentication"
    [ $? -ne 0 ] && EXIT_CODE=1
fi

if [ "$RUN_ALL" = true ] || [ "$RUN_USERS" = true ]; then
    run_test "tests/integration/users" "User Management"
    [ $? -ne 0 ] && EXIT_CODE=1
fi

if [ "$RUN_ALL" = true ] || [ "$RUN_PAPERS" = true ]; then
    run_test "tests/integration/papers" "Papers"
    [ $? -ne 0 ] && EXIT_CODE=1
fi

# Run unit tests if running all tests
if [ "$RUN_ALL" = true ]; then
    run_test "tests/unit" "Unit"
    [ $? -ne 0 ] && EXIT_CODE=1
fi

# Deactivate virtual environment if it was activated
if [ -d "venv" ]; then
    deactivate
fi

# Exit with appropriate code
exit $EXIT_CODE 