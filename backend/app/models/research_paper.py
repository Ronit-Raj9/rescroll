from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from app.db.base_class import Base

class ResearchPaper(Base):
    __tablename__ = "researchpaper"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    authors = Column(String(1000), nullable=True)
    abstract = Column(Text, nullable=True)
    doi = Column(String(100), nullable=True, unique=True, index=True)
    url = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    journal = Column(String(255), nullable=True)
    publication_date = Column(DateTime, nullable=True)
    citation_count = Column(Integer, default=0)
    domain = Column(String(100), nullable=True)
    keywords = Column(String(500), nullable=True)
    is_open_access = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    reading_history = relationship("ReadingHistory", back_populates="paper") 