from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class PaperSummaryRequest(Base):
    """Model for tracking paper summary requests."""
    
    __tablename__ = "paper_summary_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(String(255), index=True, nullable=False)
    paper_title = Column(String(500), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    summary = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="paper_summary_requests")

    def __repr__(self):
        return f"<PaperSummaryRequest(id={self.id}, user_id={self.user_id}, paper_id={self.paper_id})>" 