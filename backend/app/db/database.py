from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import logging
import os
from contextlib import contextmanager

from app.core.config import settings

logger = logging.getLogger(__name__)

# Fetch variables
USER = "postgres.ovssikmitelxawvjhhgg"
PASSWORD = settings.DATABASE_PASSWORD
HOST = settings.DATABASE_HOST
PORT = settings.DATABASE_PORT
DBNAME = settings.DATABASE_NAME

# Build the DATABASE_URL from environment variables
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"
if settings.DATABASE_SSL:
    DATABASE_URL += "?sslmode=require"
    
print(f"DATABASE_URL (sync): {DATABASE_URL}")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "application_name": "rescroll_app",
        "connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT", 15))
    }
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a scoped session
db_session = scoped_session(SessionLocal)

# Create Base class for models
Base = declarative_base()

@contextmanager
def get_db():
    """Context manager for database sessions."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

# Dependency for FastAPI
def get_db_dependency():
    """Dependency for FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close() 