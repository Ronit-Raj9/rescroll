from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.associations import user_interests

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    
    # Relationships - using string reference to avoid circular imports
    interested_users = relationship("User", secondary=user_interests, back_populates="interests")
    
    def __repr__(self):
        return f"<Topic {self.name}>" 