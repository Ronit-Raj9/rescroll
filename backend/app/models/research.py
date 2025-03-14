from typing import Optional, List
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class ResearchPaper(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(JSON)  # List of authors
    abstract = Column(Text)
    doi = Column(String, unique=True)
    publication_date = Column(String)
    source = Column(String)  # e.g., "Nature", "IEEE", etc.
    url = Column(String)
    keywords = Column(JSON)  # List of keywords
    citations = Column(Integer, default=0)
    impact_factor = Column(Float)
    domain = Column(String)  # Main research domain
    vector_embedding = Column(JSON)  # Vector representation for similarity search
    
    # Relationships
    news_report = relationship("NewsReport", back_populates="paper", uselist=False)
    reading_history = relationship("ReadingHistory", back_populates="paper")

class NewsReport(Base):
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("researchpaper.id"))
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