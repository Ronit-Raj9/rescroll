#!/bin/bash

# Base paths
BACKEND_DIR="/media/ronit/New Volume1/CODDING/PROJECTS/rescroll/backend"
TEST_DIR="$BACKEND_DIR/tests"

# Create necessary directories
mkdir -p "$TEST_DIR/integration/auth"
mkdir -p "$TEST_DIR/integration/users"
mkdir -p "$TEST_DIR/integration/papers"
mkdir -p "$TEST_DIR/unit"
mkdir -p "$TEST_DIR/scripts"

# Move authentication test files
echo "Moving authentication test files..."
cp "$BACKEND_DIR/test_all_auth.py" "$TEST_DIR/integration/auth/"
cp "$BACKEND_DIR/test_auth_fix.py" "$TEST_DIR/integration/auth/"
cp "$BACKEND_DIR/test_browser_auth.py" "$TEST_DIR/integration/auth/"
cp "$BACKEND_DIR/test_cookie_auth.py" "$TEST_DIR/integration/auth/"
cp "$BACKEND_DIR/test_login_fix.py" "$TEST_DIR/integration/auth/"
cp "$BACKEND_DIR/test_register.py" "$TEST_DIR/integration/auth/"

# Move user-related test files
echo "Moving user-related test files..."
cp "$BACKEND_DIR/test_profile_image.py" "$TEST_DIR/integration/users/"
cp "$BACKEND_DIR/test_delete_profile_image.py" "$TEST_DIR/integration/users/"

# Move paper-related test files
echo "Moving paper-related test files..."
cp "$BACKEND_DIR/test_paper_summary.py" "$TEST_DIR/integration/papers/"

# Move unit test files
echo "Moving unit test files..."
cp "$BACKEND_DIR/test_db.py" "$TEST_DIR/unit/"
cp "$BACKEND_DIR/test_cors.py" "$TEST_DIR/unit/"

# Move shell scripts
echo "Moving shell scripts..."
cp "$BACKEND_DIR/test_paper_summary.sh" "$TEST_DIR/scripts/"
cp "$BACKEND_DIR/test_delete_profile_image.sh" "$TEST_DIR/scripts/"
cp "$BACKEND_DIR/open_test_login.sh" "$TEST_DIR/scripts/"
cp "$BACKEND_DIR/open_test_page.sh" "$TEST_DIR/scripts/"

echo "All test files have been moved to their appropriate directories."
echo "Original files are still in the backend directory."
echo "You can remove them manually after verifying the new structure." 