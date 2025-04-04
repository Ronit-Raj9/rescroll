from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging
import ssl
import socket
import json
import urllib.request
import urllib.parse

logger = logging.getLogger(__name__)

# Parse out any SSL mode in the connection string since asyncpg handles it differently
connection_string = str(settings.SQLALCHEMY_DATABASE_URI)
if "?sslmode=" in connection_string:
    connection_string = connection_string.split("?sslmode=")[0]

logger.info(f"Base database URI (without SSL params): {connection_string}")

# Print out the database connection string
print(f"DATABASE_URL (async base): {connection_string}")

# Function to check internet connectivity
def check_internet_connection(host="8.8.8.8", port=53, timeout=3):
    """Check if there is an internet connection by connecting to Google's DNS"""
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except socket.error:
        return False

# Function to get current IP for debugging
def get_external_ip():
    """Get external IP address for debugging network issues"""
    try:
        return urllib.request.urlopen('https://api.ipify.org').read().decode('utf8')
    except Exception:
        return "Unable to get IP"

# Debug network information
internet_available = check_internet_connection()
logger.info(f"Internet connection available: {internet_available}")
if internet_available:
    try:
        ip = get_external_ip()
        logger.info(f"Current external IP: {ip}")
    except Exception as e:
        logger.error(f"Error getting external IP: {str(e)}")

# Try to resolve the Supabase hostname
try:
    host_ip = socket.gethostbyname(settings.DATABASE_HOST)
    logger.info(f"Resolved database host {settings.DATABASE_HOST} to IP: {host_ip}")
except socket.gaierror as e:
    logger.error(f"Failed to resolve database host {settings.DATABASE_HOST}: {str(e)}")

# Create different SSL context options to try
ssl_contexts = []

# Option 1: No SSL verification (least secure, but most permissive)
context_no_verify = ssl.create_default_context()
context_no_verify.check_hostname = False
context_no_verify.verify_mode = ssl.CERT_NONE
ssl_contexts.append({"name": "no_verify", "context": context_no_verify})

# Option 2: Default SSL context with hostname verification disabled
context_default = ssl.create_default_context()
context_default.check_hostname = False
ssl_contexts.append({"name": "default_no_hostname", "context": context_default})

# Option 3: Default SSL context (most secure)
context_secure = ssl.create_default_context()
ssl_contexts.append({"name": "default_secure", "context": context_secure})

# Use the first SSL context for now (will be updated if connection is successful)
current_ssl_context = context_no_verify if settings.DATABASE_SSL else None

# Define engine with flexible connect args
engine_args = {
    "pool_pre_ping": True,
    "echo": settings.DEBUG,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_timeout": 30,
    "pool_recycle": 300,
}

# Add connect_args with the current SSL context if SSL is enabled
if settings.DATABASE_SSL and current_ssl_context:
    # For asyncpg, SSL is passed differently than psycopg2
    engine_args["connect_args"] = {
        "ssl": current_ssl_context,
        # Add SSL mode handling here directly for asyncpg
        "server_settings": {
            "application_name": "rescroll_async_app"
        }
    }
    logger.info("Added SSL context to asyncpg connection")

try:
    # Configure engine with current settings
    engine = create_async_engine(connection_string, **engine_args)
    logger.info("Successfully created async database engine")
except Exception as e:
    logger.error(f"Error creating async database engine: {str(e)}")
    raise

# Create async session factory
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()