# Paper Summary API Documentation

## Overview

The Paper Summary API provides endpoints for searching academic papers on arXiv, retrieving detailed information about specific papers, and generating AI-powered summaries using Google's Gemini AI. This API is designed to help researchers and students quickly find and understand academic papers without having to read the entire text.

## Authentication

All endpoints require authentication using a Bearer token. To obtain a token, users must register and login through the authentication endpoints.

## Endpoints

### Search Papers

Search for papers on arXiv based on a query string.

- **URL**: `/api/v1/papers/search/`
- **Method**: `GET`
- **Auth required**: Yes (Bearer token)
- **Parameters**:
  - `query` (string, required): Search query for papers
  - `start` (integer, optional, default=0): Starting index for pagination
  - `max_results` (integer, optional, default=10): Maximum number of results to return

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
{
  "total": 50,
  "papers": [
    {
      "paper_id": "2304.12345",
      "title": "Quantum Computing Applications in Machine Learning",
      "summary": "This paper explores the intersection of quantum computing and machine learning...",
      "authors": ["John Doe", "Jane Smith"],
      "published_date": "2023-04-15T12:00:00Z",
      "categories": ["quant-ph", "cs.LG"],
      "pdf_link": "https://arxiv.org/pdf/2304.12345.pdf"
    },
    // More papers...
  ]
}
```

#### Error Response

- **Code**: 500 Internal Server Error
- **Content example**:

```json
{
  "detail": "Failed to search papers: Connection error"
}
```

### Get Paper Details

Retrieve detailed information about a specific paper from arXiv.

- **URL**: `/api/v1/papers/arxiv/{paper_id}`
- **Method**: `GET`
- **Auth required**: Yes (Bearer token)
- **URL Parameters**:
  - `paper_id` (string, required): The arXiv ID of the paper

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
{
  "paper_id": "2304.12345",
  "title": "Quantum Computing Applications in Machine Learning",
  "abstract": "In this paper, we explore how quantum computing can enhance machine learning algorithms...",
  "authors": ["John Doe", "Jane Smith"],
  "published_date": "2023-04-15T12:00:00Z",
  "categories": ["quant-ph", "cs.LG"],
  "pdf_link": "https://arxiv.org/pdf/2304.12345.pdf"
}
```

#### Error Response

- **Code**: 500 Internal Server Error
- **Content example**:

```json
{
  "detail": "Failed to fetch paper details: Paper with ID 2304.12345 not found"
}
```

### Get Paper Summary

Generate an AI-powered summary for a specific paper using Google's Gemini AI.

- **URL**: `/api/v1/papers/arxiv/{paper_id}/summary`
- **Method**: `GET`
- **Auth required**: Yes (Bearer token)
- **URL Parameters**:
  - `paper_id` (string, required): The arXiv ID of the paper

#### Success Response

- **Code**: 200 OK
- **Content example**:

```json
{
  "paper_id": "2304.12345",
  "summary": "This paper investigates the potential of quantum computing to enhance machine learning algorithms. The authors demonstrate that quantum algorithms can provide exponential speedups for certain machine learning tasks, particularly in the areas of classification and clustering. The methodology involves implementing quantum versions of classical algorithms on simulated quantum hardware. Key findings include a 20% improvement in accuracy for quantum support vector machines compared to classical approaches. The research has significant implications for the future of AI, potentially enabling more efficient processing of large datasets. However, the authors note limitations related to current quantum hardware capabilities and suggest future work on error correction techniques.",
  "cached": false
}
```

#### Error Response

- **Code**: 500 Internal Server Error
- **Content example**:

```json
{
  "detail": "Failed to generate summary: Error connecting to Gemini API"
}
```

## Implementation Details

### arXiv API Integration

The Paper Summary API integrates with the arXiv API to search for and retrieve paper information. The integration uses the following endpoint:
- `http://export.arxiv.org/api/query` - For searching papers and retrieving paper details

### Gemini AI Integration

For generating paper summaries, the API uses Google's Gemini AI model. The summary generation process:
1. Extracts the paper's title, authors, categories, and abstract from arXiv
2. Constructs a prompt that asks the AI to provide a comprehensive summary
3. Processes the response and returns it to the user

### Performance Considerations

- **Caching**: Summaries are cached in the database to avoid regenerating summaries for the same paper multiple times
- **Rate Limiting**: The API implements rate limiting to prevent abuse of the arXiv API and Gemini AI services
- **Asynchronous Processing**: API endpoints use asynchronous processing to improve performance and responsiveness

## Testing

You can test the complete workflow using the provided test script:

```python
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