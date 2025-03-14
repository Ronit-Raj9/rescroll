from typing import Optional
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class ReadingHistory(Base):
    __tablename__ = "reading_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    paper_id = Column(Integer, ForeignKey("researchpaper.id"))
    report_id = Column(Integer, ForeignKey("newsreport.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    time_spent = Column(Integer)  # Time spent in seconds
    completion_percentage = Column(Float)  # 0-100%
    interaction_data = Column(JSON)  # Scroll depth, highlights, etc.
    
    # Relationships
    user = relationship("User", back_populates="reading_history")
    paper = relationship("ResearchPaper", back_populates="reading_history")
    report = relationship("NewsReport", back_populates="reading_history")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    paper_id = Column(Integer, ForeignKey("researchpaper.id"))
    score = Column(Float)  # 0-100%
    answers = Column(JSON)  # User's answers
    time_taken = Column(Integer)  # Time taken in seconds
    difficulty_level = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="quiz_results")

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    preferred_domains = Column(JSON)  # List of preferred research domains
    preferred_difficulty = Column(String)
    preferred_sources = Column(JSON)  # List of preferred paper sources
    notification_preferences = Column(JSON)
    
    # Relationships
    user = relationship("User", back_populates="user_preferences")

class WeeklyProgress(Base):
    __tablename__ = "weekly_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    week_start = Column(DateTime)
    week_end = Column(DateTime)
    articles_read = Column(Integer)
    total_reading_time = Column(Integer)  # in minutes
    domains_covered = Column(JSON)  # List of domains read
    quiz_scores = Column(JSON)  # List of quiz scores
    streak_maintained = Column(Boolean)
    
    # Relationships
    user = relationship("User", back_populates="weekly_progress") 