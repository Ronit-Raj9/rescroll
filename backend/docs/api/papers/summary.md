# Paper Summary API

This endpoint provides AI-generated summaries of research papers from arXiv.

## Get Paper Summary

Retrieves an AI-generated summary of a specific paper from arXiv.

**URL**: `/api/v1/papers/arxiv/{paper_id}/summary`

**Method**: `GET`

**Authentication**: Required

**URL Parameters**:

- `paper_id`: The arXiv ID of the paper (e.g., `1901.00001`)

**Query Parameters**: None

### Success Response

**Code**: `200 OK`

**Content Example**:

```json
{
  "paper_id": "1901.00001",
  "title": "Example Paper Title",
  "summary": "This paper introduces a novel approach to quantum computing...",
  "cached": true,
  "created_at": "2023-03-15T10:30:45.123Z"
}
```

**Response Fields**:

- `paper_id`: The arXiv ID of the paper
- `title`: The title of the paper
- `summary`: The AI-generated summary of the paper
- `cached`: Whether the summary was retrieved from cache or newly generated
- `created_at`: The timestamp when the summary was created

### Error Responses

**Condition**: Paper ID not found

**Code**: `404 Not Found`

**Content**:

```json
{
  "detail": "Paper not found"
}
```

**Condition**: Invalid paper ID format

**Code**: `422 Unprocessable Entity`

**Content**:

```json
{
  "detail": "Invalid paper ID format"
}
```

**Condition**: Error generating summary

**Code**: `500 Internal Server Error`

**Content**:

```json
{
  "detail": "Failed to generate summary"
}
```

## Implementation Details

- The endpoint first checks if a summary for the requested paper already exists in the database.
- If a cached summary is found, it is returned immediately.
- If no cached summary is found, the endpoint:
  1. Retrieves the paper details from the arXiv API
  2. Generates a summary using Google's Gemini AI
  3. Stores the summary in the database for future requests
  4. Returns the generated summary

## Rate Limiting

This endpoint is subject to rate limiting to prevent abuse of the AI generation service. Users are limited to 10 new summary generations per hour.

## Example Usage

### cURL

```bash
curl -X GET "http://localhost:8000/api/v1/papers/arxiv/1901.00001/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Python

```python
import requests

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(
    "http://localhost:8000/api/v1/papers/arxiv/1901.00001/summary",
    headers=headers
)

if response.status_code == 200:
    summary = response.json()
    print(f"Summary: {summary['summary']}")
else:
    print(f"Error: {response.text}")
``` 