from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class ReadingHistory(Base):
    __tablename__ = "reading_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    read_date = Column(DateTime(timezone=True), server_default=func.now())
    time_spent = Column(Integer, default=0)  # Time spent reading in seconds
    
    # Relationships
    user = relationship("User", back_populates="reading_history")

    def __repr__(self):
        return f"<ReadingHistory {self.user_id}:{self.article_id}>" 