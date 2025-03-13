from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    
    # Display preferences
    theme = Column(String, default='light')
    language = Column(String, default='en')
    
    # Reading preferences
    font_size = Column(Integer, default=14)
    reading_mode = Column(String, default='normal')  # normal, focus, night
    
    # Quiz preferences
    quiz_difficulty = Column(String, default='medium')  # easy, medium, hard
    quiz_frequency = Column(Integer, default=5)  # Number of questions per quiz
    
    # Custom settings
    custom_settings = Column(JSON, default={})
    
    # Reading preferences
    reading_preferences = Column(JSON)  # Store reading preferences like font size, etc.
    
    # Relationship with User
    user = relationship("User", back_populates="preferences")
    
    def __repr__(self):
        return f"<UserPreference {self.user_id}>" 