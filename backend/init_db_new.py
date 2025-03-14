import os
import sys
from sqlalchemy import create_engine
from app.db.base import Base
from app.core.config import settings

def init_db():
    """Initialize the database by creating all tables."""
    print("Creating database tables...")
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    # Add the parent directory to sys.path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    init_db() 