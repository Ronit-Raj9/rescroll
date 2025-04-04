from sqlalchemy import text
from app.db.database import engine, get_db
import logging
import os

logger = logging.getLogger(__name__)

def test_db_connection():
    """Test database connection with SQLAlchemy."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.fetchone()
            logger.info(f"Database connection successful: {value}")
            return True, "Connection successful"
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False, f"Database error: {e}"

def build_database_url():
    """Build database URL from environment variables."""
    user = os.getenv("USER", "postgres.ovssikmitelxawvjhhgg")
    password = os.getenv("PASSWORD", "Rescroll_123")
    host = os.getenv("HOST", "aws-0-ap-south-1.pooler.supabase.com")
    port = os.getenv("PORT", "5432")
    dbname = os.getenv("DBNAME", "postgres")
    
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}?sslmode=require" 