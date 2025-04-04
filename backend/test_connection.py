import psycopg2
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

def test_direct_connection():
    """Test connection directly using psycopg2."""
    # Get connection parameters from environment
    user = os.getenv("PGUSER", "postgres")
    password = os.getenv("PGPASSWORD", "Rescroll_123")
    host = os.getenv("PGHOST", "db.ovssikmitelxawvjhhgg.supabase.co")
    port = os.getenv("PGPORT", "5432")
    dbname = os.getenv("PGDATABASE", "postgres")
    
    logger.info(f"Testing direct connection to {host}:{port} as {user}")
    
    try:
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
        logger.info(f"Direct connection successful: {version}")
        
        # Close cursor and connection
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Direct connection failed: {e}")
        return False

def test_sqlalchemy_connection():
    """Test connection using SQLAlchemy."""
    # Build connection URL
    user = os.getenv("PGUSER", "postgres")
    password = os.getenv("PGPASSWORD", "Rescroll_123")
    host = os.getenv("PGHOST", "db.ovssikmitelxawvjhhgg.supabase.co")
    port = os.getenv("PGPORT", "5432")
    dbname = os.getenv("PGDATABASE", "postgres")
    
    db_url = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"
    logger.info(f"Testing SQLAlchemy connection to {host}:{port} as {user}")
    
    try:
        # Create engine
        engine = create_engine(
            db_url,
            echo=False,
            connect_args={
                "application_name": "rescroll_test",
                "connect_timeout": 15
            }
        )
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            logger.info(f"SQLAlchemy connection successful: {version}")
        
        # Dispose engine
        engine.dispose()
        return True
    except Exception as e:
        logger.error(f"SQLAlchemy connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing database connections...")
    direct_success = test_direct_connection()
    sqlalchemy_success = test_sqlalchemy_connection()
    
    if direct_success and sqlalchemy_success:
        print("\n✅ All connection tests PASSED")
    elif direct_success:
        print("\n⚠️ Direct connection test PASSED, but SQLAlchemy test FAILED")
    elif sqlalchemy_success:
        print("\n⚠️ SQLAlchemy connection test PASSED, but Direct test FAILED")
    else:
        print("\n❌ All connection tests FAILED") 