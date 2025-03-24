from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from .base import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    profile_image = Column(String, nullable=True)
    
    # Analytics fields
    reading_time = Column(Integer, default=0)  # Total reading time in minutes
    articles_read = Column(Integer, default=0)  # Total number of articles read
    reading_streak = Column(Integer, default=0)  # Current reading streak in days
    last_read_date = Column(String, nullable=True)  # Last date when user read an article