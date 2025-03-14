from typing import Optional, List
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
import datetime

from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    profile_image = Column(String, nullable=True)
    
    # Analytics fields
    reading_time = Column(Integer, default=0)  # Total reading time in minutes
    articles_read = Column(Integer, default=0)  # Total number of articles read
    favorite_domains = Column(Text, default="[]")  # JSON string of favorite domains
    reading_streak = Column(Integer, default=0)  # Current reading streak in days
    last_read_date = Column(String, nullable=True)  # Last date when user read an article
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    paper_summary_requests = relationship("PaperSummaryRequest", back_populates="user")
    reading_history = relationship("ReadingHistory", back_populates="user")
    quiz_results = relationship("QuizResult", back_populates="user")
    user_preferences = relationship("UserPreference", back_populates="user", uselist=False)
    weekly_progress = relationship("WeeklyProgress", back_populates="user")