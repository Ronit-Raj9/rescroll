from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import psycopg2
import os
from typing import Dict
import logging

from app.api.deps import get_db_dependency
from app.core.config import settings
from app.db.utils import test_db_connection

router = APIRouter(tags=["connection_test"])
logger = logging.getLogger(__name__)

@router.get("/test-connection")
async def test_connection(db: Session = Depends(get_db_dependency)):
    """
    Test the database connection using multiple methods and return detailed results.
    
    This endpoint is useful for diagnosing connection issues with the database.
    """
    try:
        # Try SQLAlchemy connection first
        result = db.execute(text("SELECT version()"))
        version = result.scalar()
        
        logger.info(f"Database connection successful. Version: {version}")
        
        # Basic connection info
        connection_info = {
            "status": "success",
            "message": f"Connected to database successfully",
            "database_version": version,
            "connection_details": {
                "host": os.getenv("HOST"),
                "database": os.getenv("DBNAME"),
                "user": os.getenv("USER"),
                "ssl_enabled": True,
            }
        }
        
        return connection_info
        
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        
        # If SQLAlchemy connection fails, try direct connection
        try:
            # Get connection parameters from environment
            user = os.getenv("USER", "postgres.ovssikmitelxawvjhhgg")
            password = os.getenv("PASSWORD", "Rescroll_123")
            host = os.getenv("HOST", "aws-0-ap-south-1.pooler.supabase.com")
            port = os.getenv("PORT", "5432")
            dbname = os.getenv("DBNAME", "postgres")
            
            # Connect to the database with psycopg2
            conn = psycopg2.connect(
                dbname=dbname,
                user=user,
                password=password,
                host=host,
                port=port,
                sslmode="require"
            )
            
            # Create a cursor
            cursor = conn.cursor()
            
            # Execute a test query
            cursor.execute("SELECT version();")
            
            # Fetch the result
            version = cursor.fetchone()[0]
            
            # Close cursor and connection
            cursor.close()
            conn.close()
            
            return {
                "status": "partial_success",
                "message": "Direct connection succeeded but SQLAlchemy connection failed",
                "direct_connection": version,
                "sqlalchemy_error": str(e),
            }
            
        except Exception as e2:
            # All attempts failed
            return {
                "status": "critical_error",
                "message": "All connection attempts failed",
                "sqlalchemy_error": str(e),
                "direct_error": str(e2),
                "connection_details": {
                    "host": os.getenv("HOST"),
                    "database": os.getenv("DBNAME"),
                    "user": os.getenv("USER"),
                    "ssl_enabled": True,
                }
            } 