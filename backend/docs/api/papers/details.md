# Paper Details API

This endpoint retrieves detailed information about a specific research paper from arXiv.

## Get Paper Details

Retrieves detailed information about a specific paper from arXiv.

**URL**: `/api/v1/papers/arxiv/{paper_id}`

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
  "authors": ["Author One", "Author Two"],
  "summary": "This is a detailed abstract of the paper...",
  "published": "2019-01-01T00:00:00Z",
  "updated": "2019-01-02T00:00:00Z",
  "categories": ["quant-ph", "cs.AI"],
  "doi": "10.1234/example.doi",
  "journal_ref": "Example Journal Vol. 1, Issue 2, 2019",
  "pdf_url": "https://arxiv.org/pdf/1901.00001.pdf",
  "comment": "10 pages, 5 figures",
  "primary_category": "quant-ph"
}
```

**Response Fields**:

- `paper_id`: The arXiv ID of the paper
- `title`: The title of the paper
- `authors`: Array of author names
- `summary`: Detailed abstract of the paper
- `published`: Publication date
- `updated`: Last update date
- `categories`: Array of arXiv categories
- `doi`: Digital Object Identifier (if available)
- `journal_ref`: Journal reference (if available)
- `pdf_url`: URL to the PDF version of the paper
- `comment`: Additional comments about the paper (if available)
- `primary_category`: The primary arXiv category of the paper

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

**Condition**: Error connecting to arXiv API

**Code**: `503 Service Unavailable`

**Content**:

```json
{
  "detail": "Unable to connect to arXiv API"
}
```

## Implementation Details

- The endpoint retrieves paper details from the arXiv API.
- Results are parsed and formatted for easier consumption.
- The API respects arXiv's usage guidelines and implements appropriate rate limiting.

## Rate Limiting

This endpoint is subject to rate limiting to prevent abuse of the arXiv API. Users are limited to 200 paper detail requests per hour.

## Example Usage

### cURL

```bash
curl -X GET "http://localhost:8000/api/v1/papers/arxiv/1901.00001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Python

```python
import requests

headers = {
    "Authorization": f"Bearer {access_token}"
}

response = requests.get(
    "http://localhost:8000/api/v1/papers/arxiv/1901.00001",
    headers=headers
)

if response.status_code == 200:
    paper = response.json()
    print(f"Title: {paper['title']}")
    print(f"Authors: {', '.join(paper['authors'])}")
    print(f"Abstract: {paper['summary']}")
else:
    print(f"Error: {response.text}")
``` 