from typing import Optional, List
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

class ResearchPaper(Base):
    __tablename__ = "research_papers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(String, nullable=False)
    publication_date = Column(DateTime, nullable=True)
    abstract = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    doi = Column(String, nullable=True, unique=True)
    categories = Column(JSON, default=list)
    source = Column(String)  # e.g., "Nature", "IEEE", etc.
    url = Column(String)
    keywords = Column(JSON)  # List of keywords
    citations = Column(Integer, default=0)
    impact_factor = Column(Float)
    domain = Column(String)  # Main research domain
    vector_embedding = Column(JSON)  # Vector representation for similarity search
    
    # Relationship fields
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="research_papers")
    
    # Relationships
    news_report = relationship("NewsReport", back_populates="paper", uselist=False)
    reading_history = relationship("ReadingHistory", back_populates="paper")

class NewsReport(Base):
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("research_papers.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text)
    key_findings = Column(JSON)  # List of key findings
    technical_terms = Column(JSON)  # List of technical terms with explanations
    reading_time = Column(Integer)  # Estimated reading time in minutes
    difficulty_level = Column(String)  # e.g., "Beginner", "Intermediate", "Advanced"
    
    # Relationships
    paper = relationship("ResearchPaper", back_populates="news_report")
    reading_history = relationship("ReadingHistory", back_populates="report") 