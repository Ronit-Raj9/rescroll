# Paper Search API

This endpoint allows searching for research papers on arXiv.

## Search Papers

Searches for papers on arXiv based on a query string.

**URL**: `/api/v1/papers/search/`

**Method**: `GET`

**Authentication**: Required

**Query Parameters**:

- `query` (required): The search query string (e.g., "quantum computing")
- `start` (optional): The index of the first result to return (default: 0)
- `max_results` (optional): The maximum number of results to return (default: 10, max: 100)

### Success Response

**Code**: `200 OK`

**Content Example**:

```json
{
  "papers": [
    {
      "paper_id": "1901.00001",
      "title": "Example Paper Title",
      "authors": ["Author One", "Author Two"],
      "summary": "This is a brief summary of the paper...",
      "published": "2019-01-01T00:00:00Z",
      "updated": "2019-01-02T00:00:00Z",
      "categories": ["quant-ph", "cs.AI"],
      "doi": "10.1234/example.doi",
      "journal_ref": "Example Journal Vol. 1, Issue 2, 2019",
      "pdf_url": "https://arxiv.org/pdf/1901.00001.pdf"
    },
    {
      "paper_id": "1901.00002",
      "title": "Another Example Paper",
      "authors": ["Author Three"],
      "summary": "This is a brief summary of another paper...",
      "published": "2019-01-03T00:00:00Z",
      "updated": "2019-01-04T00:00:00Z",
      "categories": ["cs.CL", "cs.AI"],
      "doi": null,
      "journal_ref": null,
      "pdf_url": "https://arxiv.org/pdf/1901.00002.pdf"
    }
  ],
  "total": 1250,
  "start": 0,
  "max_results": 10,
  "query": "quantum computing"
}
```

**Response Fields**:

- `papers`: Array of paper objects with the following fields:
  - `paper_id`: The arXiv ID of the paper
  - `title`: The title of the paper
  - `authors`: Array of author names
  - `summary`: Brief summary or abstract of the paper
  - `published`: Publication date
  - `updated`: Last update date
  - `categories`: Array of arXiv categories
  - `doi`: Digital Object Identifier (if available)
  - `journal_ref`: Journal reference (if available)
  - `pdf_url`: URL to the PDF version of the paper
- `total`: Total number of results for the query
- `start`: Starting index of the returned results
- `max_results`: Maximum number of results returned
- `query`: The search query used

### Error Responses

**Condition**: Missing query parameter

**Code**: `422 Unprocessable Entity`

**Content**:

```json
{
  "detail": "Query parameter is required"
}
```

**Condition**: Invalid start or max_results parameter

**Code**: `422 Unprocessable Entity`

**Content**:

```json
{
  "detail": "start and max_results must be non-negative integers"
}
```

**Condition**: Error connecting to arXiv API

**Code**: `503 Service Unavailable`

**Content**:

```json
{
  "detail": "Unable to connect to arXiv API"
}
```

## Implementation Details

- The endpoint forwards the search query to the arXiv API.
- Results are parsed and formatted for easier consumption.
- The API respects arXiv's usage guidelines and implements appropriate rate limiting.

## Rate Limiting

This endpoint is subject to rate limiting to prevent abuse of the arXiv API. Users are limited to 100 search requests per hour.

## Example Usage

### cURL

```bash
curl -X GET "http://localhost:8000/api/v1/papers/search/?query=quantum%20computing&start=0&max_results=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Python

```python
import requests

headers = {
    "Authorization": f"Bearer {access_token}"
}

params = {
    "query": "quantum computing",
    "start": 0,
    "max_results": 5
}

response = requests.get(
    "http://localhost:8000/api/v1/papers/search/",
    params=params,
    headers=headers
)

if response.status_code == 200:
    results = response.json()
    print(f"Found {results['total']} papers")
    for paper in results['papers']:
        print(f"- {paper['title']} by {', '.join(paper['authors'])}")
else:
    print(f"Error: {response.text}")
``` 