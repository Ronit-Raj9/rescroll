from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.db.clickhouse import clickhouse_client

class AnalyticsDBService:
    def __init__(self):
        self.client = clickhouse_client

    async def record_page_view(self, user_id: int, page: str, duration: int,
                             timestamp: datetime = None) -> bool:
        """Record a page view event"""
        if timestamp is None:
            timestamp = datetime.now()
        
        query = """
            INSERT INTO page_views (user_id, page, duration, timestamp)
            VALUES (%(user_id)s, %(page)s, %(duration)s, %(timestamp)s)
        """
        try:
            await self.client.execute(query, {
                'user_id': user_id,
                'page': page,
                'duration': duration,
                'timestamp': timestamp
            })
            return True
        except Exception:
            return False

    async def record_search_query(self, user_id: int, query: str, results_count: int,
                                timestamp: datetime = None) -> bool:
        """Record a search query event"""
        if timestamp is None:
            timestamp = datetime.now()
        
        query = """
            INSERT INTO search_queries (user_id, query, results_count, timestamp)
            VALUES (%(user_id)s, %(query)s, %(results_count)s, %(timestamp)s)
        """
        try:
            await self.client.execute(query, {
                'user_id': user_id,
                'query': query,
                'results_count': results_count,
                'timestamp': timestamp
            })
            return True
        except Exception:
            return False

    async def record_article_interaction(self, user_id: int, article_id: str,
                                      interaction_type: str, duration: int,
                                      timestamp: datetime = None) -> bool:
        """Record an article interaction event"""
        if timestamp is None:
            timestamp = datetime.now()
        
        query = """
            INSERT INTO article_interactions (user_id, article_id, interaction_type, duration, timestamp)
            VALUES (%(user_id)s, %(article_id)s, %(interaction_type)s, %(duration)s, %(timestamp)s)
        """
        try:
            await self.client.execute(query, {
                'user_id': user_id,
                'article_id': article_id,
                'interaction_type': interaction_type,
                'duration': duration,
                'timestamp': timestamp
            })
            return True
        except Exception:
            return False

    async def get_user_activity_stats(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get user activity statistics for the specified number of days"""
        start_date = datetime.now() - timedelta(days=days)
        
        query = """
            SELECT
                COUNT(*) as total_page_views,
                AVG(duration) as avg_page_duration,
                COUNT(DISTINCT page) as unique_pages,
                COUNT(DISTINCT article_id) as unique_articles
            FROM page_views
            WHERE user_id = %(user_id)s AND timestamp >= %(start_date)s
        """
        
        try:
            result = await self.client.execute(query, {
                'user_id': user_id,
                'start_date': start_date
            })
            return result[0] if result else {}
        except Exception:
            return {}

    async def get_popular_articles(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular articles based on interaction count"""
        start_date = datetime.now() - timedelta(days=days)
        
        query = """
            SELECT
                article_id,
                COUNT(*) as interaction_count,
                AVG(duration) as avg_duration
            FROM article_interactions
            WHERE timestamp >= %(start_date)s
            GROUP BY article_id
            ORDER BY interaction_count DESC
            LIMIT %(limit)s
        """
        
        try:
            results = await self.client.execute(query, {
                'start_date': start_date,
                'limit': limit
            })
            return results
        except Exception:
            return []

    async def get_search_analytics(self, days: int = 7) -> Dict[str, Any]:
        """Get search analytics"""
        start_date = datetime.now() - timedelta(days=days)
        
        query = """
            SELECT
                COUNT(*) as total_searches,
                AVG(results_count) as avg_results,
                COUNT(DISTINCT user_id) as unique_searchers
            FROM search_queries
            WHERE timestamp >= %(start_date)s
        """
        
        try:
            result = await self.client.execute(query, {
                'start_date': start_date
            })
            return result[0] if result else {}
        except Exception:
            return {}

    async def get_user_engagement_metrics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get user engagement metrics"""
        start_date = datetime.now() - timedelta(days=days)
        
        query = """
            SELECT
                COUNT(*) as total_interactions,
                AVG(duration) as avg_interaction_duration,
                COUNT(DISTINCT article_id) as unique_articles,
                COUNT(DISTINCT interaction_type) as interaction_types
            FROM article_interactions
            WHERE user_id = %(user_id)s AND timestamp >= %(start_date)s
        """
        
        try:
            result = await self.client.execute(query, {
                'user_id': user_id,
                'start_date': start_date
            })
            return result[0] if result else {}
        except Exception:
            return {}

    async def get_daily_active_users(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get daily active users count"""
        start_date = datetime.now() - timedelta(days=days)
        
        query = """
            SELECT
                toDate(timestamp) as date,
                COUNT(DISTINCT user_id) as active_users
            FROM page_views
            WHERE timestamp >= %(start_date)s
            GROUP BY date
            ORDER BY date DESC
        """
        
        try:
            results = await self.client.execute(query, {
                'start_date': start_date
            })
            return results
        except Exception:
            return [] 