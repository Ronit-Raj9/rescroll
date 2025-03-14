#!/usr/bin/env python3
"""
Test module for the Paper Summary API.

This module tests the complete workflow:
1. Register a new user
2. Login to get access token
3. Search for papers
4. Get paper details
5. Get paper summary
"""

import pytest
import requests
import json
import os
import random
import string
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base URL for API
BASE_URL = "http://localhost:8000/api/v1"

# Test data
TEST_QUERY = "quantum computing"
TEST_MAX_RESULTS = 5

def random_string(length=8):
    """Generate a random string for unique usernames/emails."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def register_user():
    """Register a new user and return the user data."""
    username = f"testuser_{random_string()}"
    email = f"{username}@example.com"
    password = "Password123!"
    
    user_data = {
        "username": username,
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    
    print(f"\n=== Registering user: {username} ===")
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    
    if response.status_code == 200:
        print("User registered successfully!")
        return user_data
    else:
        print(f"Failed to register user: {response.status_code}")
        print(response.text)
        return None

def login_user(username, password):
    """Login with the given credentials and return the access token."""
    login_data = {
        "username": username,
        "password": password
    }
    
    print(f"\n=== Logging in as: {username} ===")
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get("access_token")
        print("Login successful!")
        return access_token
    else:
        print(f"Failed to login: {response.status_code}")
        print(response.text)
        return None

def search_papers(token, query="quantum computing", start=0, max_results=5):
    """Search for papers with the given query."""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"\n=== Searching papers with query: '{query}' ===")
    response = requests.get(
        f"{BASE_URL}/papers/search/?query={query}&start={start}&max_results={max_results}",
        headers=headers
    )
    
    if response.status_code == 200:
        papers = response.json()
        print(f"Found {papers.get('total', 0)} papers")
        return papers
    else:
        print(f"Failed to search papers: {response.status_code}")
        print(response.text)
        return None

def get_paper_details(token, paper_id):
    """Get details for a specific paper."""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"\n=== Getting details for paper: {paper_id} ===")
    response = requests.get(
        f"{BASE_URL}/papers/arxiv/{paper_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        paper = response.json()
        print(f"Retrieved paper: {paper.get('title')}")
        return paper
    else:
        print(f"Failed to get paper details: {response.status_code}")
        print(response.text)
        return None

def get_paper_summary(token, paper_id):
    """Get a summary for a specific paper."""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"\n=== Getting summary for paper: {paper_id} ===")
    response = requests.get(
        f"{BASE_URL}/papers/arxiv/{paper_id}/summary",
        headers=headers
    )
    
    if response.status_code == 200:
        summary = response.json()
        print(f"Retrieved summary (cached: {summary.get('cached', False)})")
        print("\nSummary excerpt:")
        summary_text = summary.get('summary', '')
        print(summary_text[:300] + "..." if len(summary_text) > 300 else summary_text)
        return summary
    else:
        print(f"Failed to get paper summary: {response.status_code}")
        print(response.text)
        return None

def test_paper_search(api_base_url, auth_headers):
    """Test searching for papers."""
    response = requests.get(
        f"{api_base_url}/papers/search/?query={TEST_QUERY}&start=0&max_results={TEST_MAX_RESULTS}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "papers" in data
    assert "total" in data
    assert len(data["papers"]) <= TEST_MAX_RESULTS
    assert data["total"] > 0
    
    # Return the first paper ID for use in other tests
    return data["papers"][0]["paper_id"]

def test_paper_details(api_base_url, auth_headers, test_paper_id):
    """Test retrieving paper details."""
    # If test_paper_id is provided, use it; otherwise, search for a paper first
    paper_id = test_paper_id
    
    response = requests.get(
        f"{api_base_url}/papers/arxiv/{paper_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    paper = response.json()
    assert "title" in paper
    assert "authors" in paper
    assert "summary" in paper
    assert "paper_id" in paper
    assert paper["paper_id"] == paper_id

def test_paper_summary(api_base_url, auth_headers, test_paper_id):
    """Test retrieving a paper summary."""
    # If test_paper_id is provided, use it; otherwise, search for a paper first
    paper_id = test_paper_id
    
    response = requests.get(
        f"{api_base_url}/papers/arxiv/{paper_id}/summary",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    summary = response.json()
    assert "summary" in summary
    assert "paper_id" in summary
    assert "cached" in summary
    assert summary["paper_id"] == paper_id
    assert len(summary["summary"]) > 0

def test_complete_workflow(api_base_url, auth_headers):
    """Test the complete paper summary workflow."""
    # Step 1: Search for papers
    search_response = requests.get(
        f"{api_base_url}/papers/search/?query={TEST_QUERY}&start=0&max_results={TEST_MAX_RESULTS}",
        headers=auth_headers
    )
    
    assert search_response.status_code == 200
    search_data = search_response.json()
    assert len(search_data["papers"]) > 0
    
    # Get the first paper ID
    paper_id = search_data["papers"][0]["paper_id"]
    
    # Step 2: Get paper details
    details_response = requests.get(
        f"{api_base_url}/papers/arxiv/{paper_id}",
        headers=auth_headers
    )
    
    assert details_response.status_code == 200
    paper_details = details_response.json()
    assert paper_details["paper_id"] == paper_id
    
    # Step 3: Get paper summary
    summary_response = requests.get(
        f"{api_base_url}/papers/arxiv/{paper_id}/summary",
        headers=auth_headers
    )
    
    assert summary_response.status_code == 200
    summary_data = summary_response.json()
    assert summary_data["paper_id"] == paper_id
    assert len(summary_data["summary"]) > 0

if __name__ == "__main__":
    # This allows running the file directly for quick testing
    import sys
    
    # Add the parent directory to sys.path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
    
    # Run pytest
    pytest.main(["-xvs", __file__]) 