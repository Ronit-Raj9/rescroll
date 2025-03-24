import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.config import settings
from app.tests.utils.utils import get_normal_user_token_headers
from app.utils.cache import cache

client = TestClient(app)

@pytest.mark.asyncio
async def test_search_papers(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    query = "machine learning"
    r = client.get(
        "/api/v1/papers/search/",
        params={"query": query},
        headers=normal_user_token_headers
    )
    assert r.status_code == 200
    result = r.json()
    assert "papers" in result
    assert "total" in result
    assert isinstance(result["papers"], list)
    assert isinstance(result["total"], int)

@pytest.mark.asyncio
async def test_search_papers_pagination(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    query = "machine learning"
    start = 0
    max_results = 5
    r = client.get(
        "/api/v1/papers/search/",
        params={
            "query": query,
            "start": start,
            "max_results": max_results
        },
        headers=normal_user_token_headers
    )
    assert r.status_code == 200
    result = r.json()
    assert len(result["papers"]) <= max_results

@pytest.mark.asyncio
async def test_search_papers_caching(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    query = "machine learning"
    # First request
    r1 = client.get(
        "/api/v1/papers/search/",
        params={"query": query},
        headers=normal_user_token_headers
    )
    assert r1.status_code == 200
    
    # Second request should be cached
    r2 = client.get(
        "/api/v1/papers/search/",
        params={"query": query},
        headers=normal_user_token_headers
    )
    assert r2.status_code == 200
    assert r1.json() == r2.json()

@pytest.mark.asyncio
async def test_get_paper_details(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    paper_id = "2103.00020"  # Example arXiv ID
    r = client.get(
        f"/api/v1/papers/arxiv/{paper_id}",
        headers=normal_user_token_headers
    )
    assert r.status_code == 200
    paper = r.json()
    assert "title" in paper
    assert "authors" in paper
    assert "abstract" in paper
    assert "pdf_url" in paper

@pytest.mark.asyncio
async def test_get_paper_details_invalid_id(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    paper_id = "invalid_id"
    r = client.get(
        f"/api/v1/papers/arxiv/{paper_id}",
        headers=normal_user_token_headers
    )
    assert r.status_code == 404
    assert "detail" in r.json()

@pytest.mark.asyncio
async def test_get_paper_summary(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    paper_id = "2103.00020"  # Example arXiv ID
    r = client.get(
        f"/api/v1/papers/arxiv/{paper_id}/summary",
        headers=normal_user_token_headers
    )
    assert r.status_code == 200
    result = r.json()
    assert "summary" in result
    assert "status" in result
    assert result["status"] in ["completed", "processing"]

@pytest.mark.asyncio
async def test_get_paper_summary_background_task(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    paper_id = "2103.00020"  # Example arXiv ID
    r = client.get(
        f"/api/v1/papers/arxiv/{paper_id}/summary",
        headers=normal_user_token_headers
    )
    assert r.status_code == 200
    result = r.json()
    
    # If status is processing, wait and check again
    if result["status"] == "processing":
        import time
        time.sleep(2)  # Wait for 2 seconds
        r = client.get(
            f"/api/v1/papers/arxiv/{paper_id}/summary",
            headers=normal_user_token_headers
        )
        assert r.status_code == 200
        result = r.json()
        assert result["status"] == "completed"
        assert "summary" in result

@pytest.mark.asyncio
async def test_paper_summary_caching(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    paper_id = "2103.00020"  # Example arXiv ID
    # First request
    r1 = client.get(
        f"/api/v1/papers/arxiv/{paper_id}/summary",
        headers=normal_user_token_headers
    )
    assert r1.status_code == 200
    
    # Second request should be cached
    r2 = client.get(
        f"/api/v1/papers/arxiv/{paper_id}/summary",
        headers=normal_user_token_headers
    )
    assert r2.status_code == 200
    assert r1.json() == r2.json()

@pytest.mark.asyncio
async def test_paper_summary_rate_limit(
    db: AsyncSession,
    normal_user_token_headers: dict,
):
    # Make multiple requests quickly
    paper_ids = ["2103.00020", "2103.00021", "2103.00022"]
    for paper_id in paper_ids:
        r = client.get(
            f"/api/v1/papers/arxiv/{paper_id}/summary",
            headers=normal_user_token_headers
        )
        assert r.status_code in [200, 429]  # Either success or rate limit 