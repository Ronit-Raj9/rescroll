import psycopg2
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def build_connection_string():
    """Build the connection string from environment variables."""
    user = os.getenv("USER", "postgres.ovssikmitelxawvjhhgg")
    password = os.getenv("PASSWORD", "Rescroll_123")
    host = os.getenv("HOST", "aws-0-ap-south-1.pooler.supabase.com")
    port = os.getenv("PORT", "5432")
    dbname = os.getenv("DBNAME", "postgres")
    
    return f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"

def test_connection():
    """Test connection to PostgreSQL using psycopg2."""
    # Get connection parameters from environment
    user = os.getenv("USER", "postgres.ovssikmitelxawvjhhgg")
    password = os.getenv("PASSWORD", "Rescroll_123")
    host = os.getenv("HOST", "aws-0-ap-south-1.pooler.supabase.com")
    port = os.getenv("PORT", "5432")
    dbname = os.getenv("DBNAME", "postgres")
    
    # Build the connection string
    connection_url = build_connection_string()
    logger.info(f"Using connection parameters: host={host}, dbname={dbname}, user={user}")
    
    try:
        # Connect to the database
        logger.info("Attempting to connect to the database...")
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
        logger.info("Executing test query...")
        cursor.execute("SELECT version();")
        
        # Fetch the result
        version = cursor.fetchone()[0]
        logger.info(f"Connection successful! PostgreSQL version: {version}")
        
        # Execute another simple query
        cursor.execute("SELECT 1;")
        value = cursor.fetchone()[0]
        logger.info(f"Query result: {value}")
        
        # Close cursor and connection
        cursor.close()
        conn.close()
        logger.info("Connection closed.")
        
        return True
    except Exception as e:
        logger.error(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    result = test_connection()
    if result:
        print("\n✅ Connection test PASSED")
    else:
        print("\n❌ Connection test FAILED") 