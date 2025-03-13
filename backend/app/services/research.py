from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.research import ResearchPaper, NewsReport
from app.models.analytics import ReadingHistory
from app.core.config import settings

class ResearchService:
    def __init__(self, db: Session):
        self.db = db

    def get_paper_by_id(self, paper_id: int) -> Optional[ResearchPaper]:
        return self.db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()

    def get_papers_by_domain(self, domain: str, limit: int = 10) -> List[ResearchPaper]:
        return self.db.query(ResearchPaper).filter(ResearchPaper.domain == domain).limit(limit).all()

    def get_trending_papers(self, limit: int = 10) -> List[ResearchPaper]:
        return self.db.query(ResearchPaper).order_by(ResearchPaper.citations.desc()).limit(limit).all()

    def create_news_report(self, paper_id: int, title: str, content: str, summary: str,
                         key_findings: List[str], technical_terms: dict, reading_time: int,
                         difficulty_level: str) -> NewsReport:
        report = NewsReport(
            paper_id=paper_id,
            title=title,
            content=content,
            summary=summary,
            key_findings=key_findings,
            technical_terms=technical_terms,
            reading_time=reading_time,
            difficulty_level=difficulty_level
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def record_reading_session(self, user_id: int, paper_id: int, report_id: int,
                            time_spent: int, completion_percentage: float,
                            interaction_data: dict) -> ReadingHistory:
        history = ReadingHistory(
            user_id=user_id,
            paper_id=paper_id,
            report_id=report_id,
            time_spent=time_spent,
            completion_percentage=completion_percentage,
            interaction_data=interaction_data
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get_user_reading_history(self, user_id: int, limit: int = 10) -> List[ReadingHistory]:
        return self.db.query(ReadingHistory).filter(ReadingHistory.user_id == user_id)\
            .order_by(ReadingHistory.start_time.desc()).limit(limit).all()

    def get_similar_papers(self, paper_id: int, limit: int = 5) -> List[ResearchPaper]:
        paper = self.get_paper_by_id(paper_id)
        if not paper or not paper.vector_embedding:
            return []
        
        # TODO: Implement vector similarity search using the vector_embedding
        # This would typically use a vector database or specialized search engine
        return [] 