from typing import List, Dict, Any, Optional
import aiohttp
import xmltodict
from datetime import datetime, timedelta
from app.core.config import settings

class PublicationService:
    def __init__(self):
        self.arxiv_api = settings.ARXIV_API_URL
        self.semantic_scholar_api = "https://api.semanticscholar.org/v1"
        self.ieee_api = "https://ieeexploreapi.ieee.org/api/v1"

    async def fetch_papers_from_arxiv(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch papers from arXiv API"""
        async with aiohttp.ClientSession() as session:
            params = {
                "search_query": f"all:{query}",
                "start": 0,
                "max_results": limit,
                "sortBy": "submittedDate",
                "sortOrder": "descending"
            }
            async with session.get(self.arxiv_api, params=params) as response:
                if response.status == 200:
                    xml_data = await response.text()
                    data = xmltodict.parse(xml_data)
                    
                    # Extract entries from the feed
                    entries = data.get('feed', {}).get('entry', [])
                    if not isinstance(entries, list):
                        entries = [entries]
                    
                    papers = []
                    for entry in entries:
                        # Extract authors
                        authors = entry.get('author', [])
                        if not isinstance(authors, list):
                            authors = [authors]
                        author_names = [author.get('name', '') for author in authors]
                        
                        # Extract categories
                        categories = entry.get('category', [])
                        if not isinstance(categories, list):
                            categories = [categories]
                        domains = [cat.get('@term', '') for cat in categories]
                        
                        # Extract links
                        links = entry.get('link', [])
                        if not isinstance(links, list):
                            links = [links]
                        pdf_url = next((link.get('@href', '') for link in links if link.get('@title') == 'pdf'), '')
                        
                        paper = {
                            'id': entry.get('id', '').split('/')[-1],
                            'title': entry.get('title', '').strip(),
                            'abstract': entry.get('summary', '').strip(),
                            'authors': author_names,
                            'published_date': entry.get('published', ''),
                            'updated_date': entry.get('updated', ''),
                            'pdf_url': pdf_url,
                            'url': entry.get('id', ''),
                            'journal_ref': entry.get('arxiv:journal_ref', {}).get('#text', ''),
                            'doi': entry.get('arxiv:doi', {}).get('#text', ''),
                            'comment': entry.get('arxiv:comment', {}).get('#text', ''),
                            'primary_category': entry.get('arxiv:primary_category', {}).get('@term', ''),
                            'categories': domains,
                            'source': 'arxiv'
                        }
                        papers.append(paper)
                    
                    return papers
                return []

    async def fetch_papers_from_semantic_scholar(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch papers from Semantic Scholar API"""
        if not settings.SEMANTIC_SCHOLAR_API_KEY:
            return []
            
        async with aiohttp.ClientSession() as session:
            url = f"{self.semantic_scholar_api}/paper/search"
            params = {
                "query": query,
                "limit": limit,
                "fields": "paperId,title,abstract,authors,year,venue,citationCount,url"
            }
            headers = {"x-api-key": settings.SEMANTIC_SCHOLAR_API_KEY}
            async with session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("data", [])
                return []

    async def fetch_papers_from_ieee(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch papers from IEEE API"""
        if not settings.IEEE_API_KEY:
            return []
            
        async with aiohttp.ClientSession() as session:
            url = f"{self.ieee_api}/search"
            params = {
                "apikey": settings.IEEE_API_KEY,
                "querytext": query,
                "max_records": limit,
                "start_record": 1,
                "sort_order": "desc"
            }
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("articles", [])
                return []

    async def get_paper_details(self, paper_id: str, source: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific paper"""
        if source == "arxiv":
            return await self._get_arxiv_paper(paper_id)
        elif source == "semantic_scholar":
            return await self._get_semantic_scholar_paper(paper_id)
        elif source == "ieee":
            return await self._get_ieee_paper(paper_id)
        return None

    async def _get_arxiv_paper(self, paper_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about an arXiv paper"""
        async with aiohttp.ClientSession() as session:
            params = {
                "id_list": paper_id,
                "max_results": 1
            }
            async with session.get(self.arxiv_api, params=params) as response:
                if response.status == 200:
                    xml_data = await response.text()
                    data = xmltodict.parse(xml_data)
                    entry = data.get('feed', {}).get('entry', {})
                    
                    if not entry:
                        return None
                    
                    # Extract authors
                    authors = entry.get('author', [])
                    if not isinstance(authors, list):
                        authors = [authors]
                    author_names = [author.get('name', '') for author in authors]
                    
                    # Extract links
                    links = entry.get('link', [])
                    if not isinstance(links, list):
                        links = [links]
                    pdf_url = next((link.get('@href', '') for link in links if link.get('@title') == 'pdf'), '')
                    
                    return {
                        'id': paper_id,
                        'title': entry.get('title', '').strip(),
                        'abstract': entry.get('summary', '').strip(),
                        'authors': author_names,
                        'published_date': entry.get('published', ''),
                        'updated_date': entry.get('updated', ''),
                        'pdf_url': pdf_url,
                        'url': entry.get('id', ''),
                        'journal_ref': entry.get('arxiv:journal_ref', {}).get('#text', ''),
                        'doi': entry.get('arxiv:doi', {}).get('#text', ''),
                        'comment': entry.get('arxiv:comment', {}).get('#text', ''),
                        'primary_category': entry.get('arxiv:primary_category', {}).get('@term', ''),
                        'source': 'arxiv'
                    }
                return None

    async def _get_semantic_scholar_paper(self, paper_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a Semantic Scholar paper"""
        if not settings.SEMANTIC_SCHOLAR_API_KEY:
            return None
            
        async with aiohttp.ClientSession() as session:
            url = f"{self.semantic_scholar_api}/paper/{paper_id}"
            params = {
                "fields": "paperId,title,abstract,authors,year,venue,citationCount,url,references,citations"
            }
            headers = {"x-api-key": settings.SEMANTIC_SCHOLAR_API_KEY}
            async with session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                return None

    async def _get_ieee_paper(self, paper_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about an IEEE paper"""
        if not settings.IEEE_API_KEY:
            return None
            
        async with aiohttp.ClientSession() as session:
            url = f"{self.ieee_api}/article/{paper_id}"
            params = {"apikey": settings.IEEE_API_KEY}
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                return None

    async def get_trending_papers(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get trending papers from arXiv"""
        async with aiohttp.ClientSession() as session:
            # Get papers from last 7 days sorted by submission date
            params = {
                "search_query": "submittedDate:[NOW-7DAYS TO NOW]",
                "sortBy": "submittedDate",
                "sortOrder": "descending",
                "max_results": 100
            }
            async with session.get(self.arxiv_api, params=params) as response:
                if response.status == 200:
                    xml_data = await response.text()
                    data = xmltodict.parse(xml_data)
                    entries = data.get('feed', {}).get('entry', [])
                    
                    if not isinstance(entries, list):
                        entries = [entries]
                    
                    papers = []
                    for entry in entries:
                        # Process each entry similar to fetch_papers_from_arxiv
                        authors = entry.get('author', [])
                        if not isinstance(authors, list):
                            authors = [authors]
                        author_names = [author.get('name', '') for author in authors]
                        
                        links = entry.get('link', [])
                        if not isinstance(links, list):
                            links = [links]
                        pdf_url = next((link.get('@href', '') for link in links if link.get('@title') == 'pdf'), '')
                        
                        paper = {
                            'id': entry.get('id', '').split('/')[-1],
                            'title': entry.get('title', '').strip(),
                            'abstract': entry.get('summary', '').strip(),
                            'authors': author_names,
                            'published_date': entry.get('published', ''),
                            'pdf_url': pdf_url,
                            'url': entry.get('id', ''),
                            'source': 'arxiv'
                        }
                        papers.append(paper)
                    
                    return papers[:10]  # Return top 10 papers 