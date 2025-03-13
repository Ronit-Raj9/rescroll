# Paper Endpoints

## Overview

The Paper endpoints provide functionality for searching academic papers on arXiv, retrieving detailed information about specific papers, and generating AI-powered summaries using Google's Gemini AI.

## Search Papers

Search for papers on arXiv based on a query string.

- **URL**: `/papers/search/`
- **Method**: `GET`
- **Auth required**: Yes
- **Query Parameters**:
  - `query` (string, required): Search query for papers
  - `start` (integer, optional, default=0): Starting index for pagination
  - `max_results` (integer, optional, default=10): Maximum number of results to return

### Success Response

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

### Error Response

- **Code**: 500 Internal Server Error
- **Content example**:
  ```json
  {
    "detail": "Failed to search papers: Connection error"
  }
  ```

## Get Paper Details

Retrieve detailed information about a specific paper from arXiv.

- **URL**: `/papers/arxiv/{paper_id}`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**:
  - `paper_id` (string, required): The arXiv ID of the paper

### Success Response

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

### Error Response

- **Code**: 500 Internal Server Error
- **Content example**:
  ```json
  {
    "detail": "Failed to fetch paper details: Paper with ID 2304.12345 not found"
  }
  ```

## Get Paper Summary

Generate an AI-powered summary for a specific paper using Google's Gemini AI.

- **URL**: `/papers/arxiv/{paper_id}/summary`
- **Method**: `GET`
- **Auth required**: Yes
- **URL Parameters**:
  - `paper_id` (string, required): The arXiv ID of the paper

### Success Response

- **Code**: 200 OK
- **Content example**:
  ```json
  {
    "paper_id": "2304.12345",
    "summary": "This paper investigates the potential of quantum computing to enhance machine learning algorithms. The authors demonstrate that quantum algorithms can provide exponential speedups for certain machine learning tasks, particularly in the areas of classification and clustering. The methodology involves implementing quantum versions of classical algorithms on simulated quantum hardware. Key findings include a 20% improvement in accuracy for quantum support vector machines compared to classical approaches. The research has significant implications for the future of AI, potentially enabling more efficient processing of large datasets. However, the authors note limitations related to current quantum hardware capabilities and suggest future work on error correction techniques.",
    "cached": false
  }
  ```

### Error Response

- **Code**: 500 Internal Server Error
- **Content example**:
  ```json
  {
    "detail": "Failed to generate summary: Error connecting to Gemini API"
  }
  ```

## Implementation Details

### arXiv API Integration

The Paper endpoints integrate with the arXiv API to search for and retrieve paper information. The integration uses the following endpoint:
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