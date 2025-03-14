import requests
import xml.etree.ElementTree as ET
import google.generativeai as genai
from typing import Dict, Any, Optional
import time
import logging
from app.core.config import settings
import httpx
import json
from datetime import datetime
from app.models.paper_summary_request import PaperSummaryRequest
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class PaperSummaryService:
    """
    Service for retrieving paper details from arXiv API and generating summaries using Gemini API.
    """
    
    ARXIV_API_URL = "http://export.arxiv.org/api/query"
    NAMESPACES = {
        'atom': 'http://www.w3.org/2005/Atom',
        'arxiv': 'http://arxiv.org/schemas/atom'
    }
    
    def __init__(self):
        """Initialize the service with API configurations."""
        self.gemini_model = genai.GenerativeModel('gemini-pro')
    
    def get_paper_details(self, paper_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve paper details from arXiv API.
        
        Args:
            paper_id: The arXiv ID of the paper (e.g., "2307.15922")
            
        Returns:
            Dictionary containing paper details or None if not found
        """
        try:
            # Construct the API URL
            url = f"{self.ARXIV_API_URL}?id_list={paper_id}"
            
            # Make the request to arXiv API
            logger.info(f"Fetching paper details for ID: {paper_id}")
            response = requests.get(url)
            
            if response.status_code != 200:
                logger.error(f"Error fetching paper: {response.status_code}")
                return None
            
            # Parse the XML response
            root = ET.fromstring(response.content)
            
            # Check if we have any entries
            entries = root.findall('.//atom:entry', self.NAMESPACES)
            if not entries:
                logger.warning(f"No paper found with ID: {paper_id}")
                return None
            
            # Get the first entry
            entry = entries[0]
            
            # Extract paper details
            paper = {
                'id': paper_id,
                'title': self._get_element_text(entry, './/atom:title'),
                'abstract': self._get_element_text(entry, './/atom:summary'),
                'authors': [author.find('./atom:name', self.NAMESPACES).text 
                           for author in entry.findall('.//atom:author', self.NAMESPACES)],
                'published': self._get_element_text(entry, './/atom:published'),
                'updated': self._get_element_text(entry, './/atom:updated'),
                'pdf_url': self._get_pdf_link(entry),
                'categories': [cat.get('term') for cat in entry.findall('.//atom:category', self.NAMESPACES)],
                'primary_category': entry.find('.//arxiv:primary_category', self.NAMESPACES).get('term') 
                                   if entry.find('.//arxiv:primary_category', self.NAMESPACES) is not None else None,
                'journal_ref': self._get_element_text(entry, './/arxiv:journal_ref'),
                'doi': self._get_element_text(entry, './/arxiv:doi'),
                'comment': self._get_element_text(entry, './/arxiv:comment')
            }
            
            logger.info(f"Successfully retrieved paper details for ID: {paper_id}")
            return paper
            
        except Exception as e:
            logger.error(f"Error retrieving paper details: {str(e)}")
            return None
    
    def generate_summary(self, paper: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Generate a summary of the paper using Gemini API.
        
        Args:
            paper: Dictionary containing paper details
            
        Returns:
            Dictionary containing the original paper details and the summary
        """
        try:
            if not paper or 'abstract' not in paper:
                logger.error("Invalid paper data for summarization")
                return None
            
            # Prepare the prompt for Gemini
            prompt = f"""
            Please provide a comprehensive summary of the following research paper:
            
            Title: {paper['title']}
            Authors: {', '.join(paper['authors'])}
            
            Abstract:
            {paper['abstract']}
            
            Please include:
            1. The main research question or objective
            2. The methodology used
            3. Key findings and results
            4. Implications and significance of the research
            5. Limitations (if mentioned)
            
            Make the summary accessible to someone with a general scientific background.
            """
            
            logger.info(f"Generating summary for paper: {paper['id']}")
            
            # Call Gemini API
            response = self.gemini_model.generate_content(prompt)
            
            if not response or not hasattr(response, 'text'):
                logger.error("Failed to generate summary from Gemini API")
                return None
            
            # Add summary to paper details
            paper['summary'] = response.text
            
            logger.info(f"Successfully generated summary for paper: {paper['id']}")
            return paper
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return None
    
    def get_paper_with_summary(self, paper_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve paper details and generate a summary.
        
        Args:
            paper_id: The arXiv ID of the paper
            
        Returns:
            Dictionary containing paper details and summary or None if failed
        """
        # Get paper details
        paper = self.get_paper_details(paper_id)
        if not paper:
            return None
        
        # Add a small delay to avoid rate limiting
        time.sleep(1)
        
        # Generate summary
        return self.generate_summary(paper)
    
    def _get_element_text(self, element, xpath: str) -> Optional[str]:
        """Helper method to get text from an XML element."""
        el = element.find(xpath, self.NAMESPACES)
        return el.text.strip() if el is not None and el.text else None
    
    def _get_pdf_link(self, entry) -> Optional[str]:
        """Helper method to get the PDF link from entry."""
        for link in entry.findall('.//atom:link', self.NAMESPACES):
            if link.get('title') == 'pdf':
                return link.get('href')
        return None

    @staticmethod
    async def search_papers(query: str, start: int = 0, max_results: int = 10) -> Dict[str, Any]:
        """
        Search for papers on arXiv based on the provided query.
        
        Args:
            query: The search query
            start: Starting index for results (for pagination)
            max_results: Maximum number of results to return
            
        Returns:
            Dictionary containing search results
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "search_query": query,
                    "start": start,
                    "max_results": max_results
                }
                response = await client.get(PaperSummaryService.ARXIV_API_URL, params=params)
                response.raise_for_status()
                
                # Parse XML response
                root = ET.fromstring(response.text)
                
                # Extract papers from the response
                papers = []
                for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
                    paper_id = entry.find('{http://www.w3.org/2005/Atom}id').text.split('/abs/')[-1]
                    title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip()
                    summary = entry.find('{http://www.w3.org/2005/Atom}summary').text.strip()
                    
                    # Extract authors
                    authors = []
                    for author in entry.findall('{http://www.w3.org/2005/Atom}author'):
                        name = author.find('{http://www.w3.org/2005/Atom}name').text
                        authors.append(name)
                    
                    # Extract publication date
                    published = entry.find('{http://www.w3.org/2005/Atom}published').text
                    
                    # Extract categories/tags
                    categories = []
                    for category in entry.findall('{http://www.w3.org/2005/Atom}category'):
                        categories.append(category.attrib['term'])
                    
                    # Extract PDF link
                    pdf_link = None
                    for link in entry.findall('{http://www.w3.org/2005/Atom}link'):
                        if link.attrib.get('title') == 'pdf':
                            pdf_link = link.attrib['href']
                    
                    papers.append({
                        "paper_id": paper_id,
                        "title": title,
                        "summary": summary,
                        "authors": authors,
                        "published_date": published,
                        "categories": categories,
                        "pdf_link": pdf_link
                    })
                
                return {
                    "total": len(papers),
                    "papers": papers
                }
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred while searching papers: {str(e)}")
            raise Exception(f"Failed to search papers: {str(e)}")
        except Exception as e:
            logger.error(f"Error occurred while searching papers: {str(e)}")
            raise Exception(f"Failed to search papers: {str(e)}")
    
    @staticmethod
    async def get_paper_details(paper_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific paper from arXiv.
        
        Args:
            paper_id: The arXiv ID of the paper
            
        Returns:
            Dictionary containing paper details
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "id_list": paper_id
                }
                response = await client.get(PaperSummaryService.ARXIV_API_URL, params=params)
                response.raise_for_status()
                
                # Parse XML response
                root = ET.fromstring(response.text)
                
                # Extract paper details
                entry = root.find('{http://www.w3.org/2005/Atom}entry')
                if entry is None:
                    raise Exception(f"Paper with ID {paper_id} not found")
                
                title = entry.find('{http://www.w3.org/2005/Atom}title').text.strip()
                abstract = entry.find('{http://www.w3.org/2005/Atom}summary').text.strip()
                
                # Extract authors
                authors = []
                for author in entry.findall('{http://www.w3.org/2005/Atom}author'):
                    name = author.find('{http://www.w3.org/2005/Atom}name').text
                    authors.append(name)
                
                # Extract publication date
                published = entry.find('{http://www.w3.org/2005/Atom}published').text
                
                # Extract categories/tags
                categories = []
                for category in entry.findall('{http://www.w3.org/2005/Atom}category'):
                    categories.append(category.attrib['term'])
                
                # Extract PDF link
                pdf_link = None
                for link in entry.findall('{http://www.w3.org/2005/Atom}link'):
                    if link.attrib.get('title') == 'pdf':
                        pdf_link = link.attrib['href']
                
                return {
                    "paper_id": paper_id,
                    "title": title,
                    "abstract": abstract,
                    "authors": authors,
                    "published_date": published,
                    "categories": categories,
                    "pdf_link": pdf_link
                }
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred while fetching paper details: {str(e)}")
            raise Exception(f"Failed to fetch paper details: {str(e)}")
        except Exception as e:
            logger.error(f"Error occurred while fetching paper details: {str(e)}")
            raise Exception(f"Failed to fetch paper details: {str(e)}")
    
    @staticmethod
    async def generate_summary(paper_id: str, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Generate a summary for a paper using Gemini AI.
        
        Args:
            paper_id: The arXiv ID of the paper
            db: Database session
            user_id: ID of the user requesting the summary
            
        Returns:
            Dictionary containing the generated summary
        """
        try:
            # Check if we already have a summary for this paper
            existing_request = db.query(PaperSummaryRequest).filter(
                PaperSummaryRequest.paper_id == paper_id,
                PaperSummaryRequest.is_completed == True
            ).first()
            
            if existing_request and existing_request.summary:
                logger.info(f"Using cached summary for paper {paper_id}")
                return {
                    "paper_id": paper_id,
                    "summary": existing_request.summary,
                    "cached": True
                }
            
            # Get paper details from arXiv
            paper_details = await PaperSummaryService.get_paper_details(paper_id)
            
            # Create a new summary request
            summary_request = PaperSummaryRequest(
                paper_id=paper_id,
                user_id=user_id,
                paper_title=paper_details["title"],
                is_completed=False
            )
            db.add(summary_request)
            db.commit()
            db.refresh(summary_request)
            
            try:
                # Generate summary using Gemini AI
                model = genai.GenerativeModel(settings.MODEL_NAME)
                
                prompt = f"""
                Please provide a comprehensive summary of the following research paper:
                
                Title: {paper_details["title"]}
                Authors: {', '.join(paper_details["authors"])}
                Categories: {', '.join(paper_details["categories"])}
                
                Abstract:
                {paper_details["abstract"]}
                
                Your summary should:
                1. Highlight the main research question or objective
                2. Summarize the methodology used
                3. Outline key findings and results
                4. Explain the significance and implications of the research
                5. Mention any limitations or future work suggested
                
                Please structure your response in clear paragraphs and keep it concise but informative.
                """
                
                response = model.generate_content(prompt, generation_config={
                    "max_output_tokens": settings.MAX_TOKENS,
                    "temperature": 0.2
                })
                
                summary = response.text
                
                # Update the summary request
                summary_request.summary = summary
                summary_request.is_completed = True
                summary_request.completed_at = datetime.utcnow()
                db.commit()
                
                return {
                    "paper_id": paper_id,
                    "summary": summary,
                    "cached": False
                }
                
            except Exception as e:
                # Update the summary request with error
                summary_request.error = str(e)
                db.commit()
                raise e
                
        except Exception as e:
            logger.error(f"Error occurred while generating summary: {str(e)}")
            raise Exception(f"Failed to generate summary: {str(e)}") 