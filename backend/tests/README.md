# Rescroll API Tests

This directory contains tests for the Rescroll API. The tests are organized into the following structure:

## Directory Structure

- `integration/`: Integration tests that test the API endpoints
  - `auth/`: Authentication-related tests
  - `users/`: User management tests
  - `papers/`: Paper-related tests
- `unit/`: Unit tests for individual components
- `scripts/`: Shell scripts for running tests

## Running Tests

You can run the tests using the `run_tests.sh` script in the `scripts` directory:

```bash
# Run all tests
./scripts/run_tests.sh --all

# Run authentication tests
./scripts/run_tests.sh --auth

# Run user management tests
./scripts/run_tests.sh --users

# Run paper tests
./scripts/run_tests.sh --papers

# Run tests with verbose output
./scripts/run_tests.sh --all --verbose
```

## Individual Test Scripts

The `scripts` directory also contains individual test scripts for specific functionality:

- `test_paper_summary.sh`: Tests the paper summary functionality
- `test_delete_profile_image.sh`: Tests profile image deletion
- `open_test_login.sh`: Opens the login test page in a browser
- `open_test_page.sh`: Opens a test page in a browser

## Writing Tests

When writing new tests, follow these guidelines:

1. Place integration tests in the appropriate subdirectory under `integration/`
2. Place unit tests in the `unit/` directory
3. Use descriptive names for test files and functions
4. Include docstrings that explain what each test is testing
5. Use pytest fixtures for common setup and teardown
6. Add appropriate assertions to verify expected behavior

## Test Dependencies

The tests require the following dependencies:

- pytest
- requests
- python-dotenv

These dependencies are included in the main `requirements.txt` file.

## Test Descriptions

### Authentication Tests

- `test_auth.py`: Tests basic authentication functionality
- `test_cookie_auth.py`: Tests cookie-based authentication
- `test_browser_auth.py`: Tests browser-based authentication
- `test_all_auth.py`: Tests all authentication methods

### User Management Tests

- `test_profile_image.py`: Tests profile image upload functionality
- `test_delete_profile_image.py`: Tests profile image deletion
- `test_register.py`: Tests user registration

### Paper Tests

- `test_paper_summary.py`: Tests paper search and summary functionality 