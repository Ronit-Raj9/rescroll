import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def update_schema():
    """Update the database schema to match the SQLAlchemy models."""
    print("Updating database schema...")
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # SQL to add missing columns to users table
    sql = """
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS articles_read INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS favorite_domains TEXT DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS reading_streak INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_read_date VARCHAR;
    """
    
    with engine.connect() as conn:
        conn.execute(text(sql))
        conn.commit()
    
    print("Database schema updated successfully!")

if __name__ == "__main__":
    # Add the parent directory to sys.path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    update_schema() 