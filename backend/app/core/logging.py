import logging
import logging.config
from pathlib import Path
from app.core.logging_config import LOGGING_CONFIG

def setup_logging():
    """Setup logging configuration for the application."""
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Apply logging configuration
    logging.config.dictConfig(LOGGING_CONFIG)
    
    # Get the logger
    logger = logging.getLogger("app")
    
    logger.info("Logging setup completed")
    return logger 