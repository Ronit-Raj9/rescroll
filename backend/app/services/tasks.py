from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime, timedelta
from app.services.publication import PublicationService
from app.services.ai import AIService
from app.services.research import ResearchService
from app.services.cache import CacheService
from app.services.analytics_db import AnalyticsDBService
from app.core.config import settings

class TaskService:
    def __init__(self):
        self.publication_service = PublicationService()
        self.ai_service = AIService()
        self.research_service = ResearchService()
        self.cache_service = CacheService()
        self.analytics_service = AnalyticsDBService()

    async def fetch_and_process_papers(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch papers from multiple sources and process them"""
        papers = []
        
        # Fetch from Semantic Scholar
        semantic_papers = await self.publication_service.fetch_papers_from_semantic_scholar(query, limit)
        papers.extend(semantic_papers)
        
        # Fetch from arXiv
        arxiv_papers = await self.publication_service.fetch_papers_from_arxiv(query, limit)
        papers.extend(arxiv_papers)
        
        # Fetch from IEEE
        ieee_papers = await self.publication_service.fetch_papers_from_ieee(query, limit)
        papers.extend(ieee_papers)
        
        # Process papers in parallel
        tasks = []
        for paper in papers:
            tasks.append(self._process_paper(paper))
        
        processed_papers = await asyncio.gather(*tasks)
        return [p for p in processed_papers if p is not None]

    async def _process_paper(self, paper: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a single paper"""
        try:
            # Generate vector embedding
            embedding = await self.ai_service.generate_vector_embedding(
                f"{paper.get('title', '')} {paper.get('abstract', '')}"
            )
            paper['vector_embedding'] = embedding
            
            # Generate news report
            report = await self.ai_service.generate_news_report(
                paper.get('title', ''),
                paper.get('abstract', ''),
                paper.get('key_findings', []),
                paper.get('technical_terms', [])
            )
            
            # Save to database
            news_report = await self.research_service.create_news_report(
                paper_id=paper.get('id'),
                title=report['title'],
                content=report['content'],
                summary=report['summary'],
                key_findings=report['key_findings'],
                technical_terms=report['technical_terms'],
                reading_time=report['reading_time'],
                difficulty_level=report['difficulty_level']
            )
            
            # Cache the paper and report
            await self.cache_service.cache_paper(paper.get('id'), paper)
            
            return {
                'paper': paper,
                'report': news_report
            }
        except Exception as e:
            print(f"Error processing paper: {str(e)}")
            return None

    async def update_trending_papers(self) -> List[Dict[str, Any]]:
        """Update trending papers"""
        papers = await self.publication_service.get_trending_papers()
        processed_papers = await self.fetch_and_process_papers("", limit=20)
        
        # Cache trending papers
        await self.cache_service.cache_trending_papers(processed_papers)
        
        return processed_papers

    async def generate_quizzes(self, paper_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate quizzes for multiple papers"""
        tasks = []
        for paper_id in paper_ids:
            tasks.append(self._generate_quiz(paper_id))
        
        quizzes = await asyncio.gather(*tasks)
        return [q for q in quizzes if q is not None]

    async def _generate_quiz(self, paper_id: str) -> Optional[Dict[str, Any]]:
        """Generate quiz for a single paper"""
        try:
            paper = await self.research_service.get_paper_by_id(paper_id)
            if not paper:
                return None
            
            quiz = await self.ai_service.generate_quiz(
                paper.title,
                paper.abstract,
                paper.key_findings
            )
            
            # Cache the quiz
            await self.cache_service.cache_quiz(paper_id, quiz)
            
            return quiz
        except Exception as e:
            print(f"Error generating quiz: {str(e)}")
            return None

    async def cleanup_old_data(self, days: int = 30) -> bool:
        """Clean up old data from analytics database"""
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            # Clean up page views
            await self.analytics_service.client.execute(
                "DELETE FROM page_views WHERE timestamp < %(start_date)s",
                {'start_date': start_date}
            )
            
            # Clean up search queries
            await self.analytics_service.client.execute(
                "DELETE FROM search_queries WHERE timestamp < %(start_date)s",
                {'start_date': start_date}
            )
            
            # Clean up article interactions
            await self.analytics_service.client.execute(
                "DELETE FROM article_interactions WHERE timestamp < %(start_date)s",
                {'start_date': start_date}
            )
            
            return True
        except Exception as e:
            print(f"Error cleaning up old data: {str(e)}")
            return False

    async def update_user_analytics(self, user_id: int) -> Dict[str, Any]:
        """Update user analytics"""
        try:
            # Get user activity stats
            activity_stats = await self.analytics_service.get_user_activity_stats(user_id)
            
            # Get user engagement metrics
            engagement_metrics = await self.analytics_service.get_user_engagement_metrics(user_id)
            
            # Update user analytics in main database
            await self.research_service.update_user_analytics(
                user_id=user_id,
                reading_time=activity_stats.get('total_page_views', 0),
                articles_read=activity_stats.get('unique_articles', 0)
            )
            
            return {
                'activity_stats': activity_stats,
                'engagement_metrics': engagement_metrics
            }
        except Exception as e:
            print(f"Error updating user analytics: {str(e)}")
            return {} 