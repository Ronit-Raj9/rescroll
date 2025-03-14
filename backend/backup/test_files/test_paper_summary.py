#!/usr/bin/env python3
"""
Test script for the Paper Summary API.
This script tests the complete workflow:
1. Register a new user
2. Login to get access token
3. Search for papers
4. Get paper details
5. Get paper summary
"""

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

def main():
    """Run the complete test workflow."""
    print("=== Starting Paper Summary API Test ===")
    
    # Register a new user
    user_data = register_user()
    if not user_data:
        print("Test failed: Could not register user")
        return
    
    # Login to get access token
    token = login_user(user_data["username"], user_data["password"])
    if not token:
        print("Test failed: Could not login")
        return
    
    # Search for papers
    search_results = search_papers(token)
    if not search_results or not search_results.get('papers'):
        print("Test failed: Could not search papers")
        return
    
    # Get the first paper from search results
    first_paper = search_results['papers'][0]
    paper_id = first_paper['paper_id']
    
    # Get paper details
    paper_details = get_paper_details(token, paper_id)
    if not paper_details:
        print("Test failed: Could not get paper details")
        return
    
    # Get paper summary
    summary = get_paper_summary(token, paper_id)
    if not summary:
        print("Test failed: Could not get paper summary")
        return
    
    print("\n=== Test completed successfully! ===")

if __name__ == "__main__":
    main() 