from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test main database connection
main_db_url = "postgresql://postgres:postgres@localhost:5432/rescroll"
analytics_db_url = "postgresql://postgres:postgres@localhost:5432/rescroll_analytics"

def test_connection():
    try:
        # Test main database
        main_engine = create_engine(main_db_url)
        main_engine.connect()
        print("✅ Successfully connected to main database")
        
        # Test analytics database
        analytics_engine = create_engine(analytics_db_url)
        analytics_engine.connect()
        print("✅ Successfully connected to analytics database")
        
    except Exception as e:
        print(f"❌ Error connecting to database: {str(e)}")

if __name__ == "__main__":
    test_connection() 