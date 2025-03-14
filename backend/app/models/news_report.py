from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from app.db.base_class import Base

class NewsReport(Base):
    __tablename__ = "newsreport"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    source = Column(String(255), nullable=True)
    author = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(500), nullable=True, unique=True, index=True)
    image_url = Column(String(500), nullable=True)
    published_date = Column(DateTime, nullable=True)
    category = Column(String(100), nullable=True)
    is_premium = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    reading_history = relationship("ReadingHistory", back_populates="report") 