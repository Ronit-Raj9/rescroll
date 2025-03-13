import os
import logging
import sys
from pathlib import Path

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
            "level": "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join("logs", "app.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "default",
            "level": "DEBUG",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join("logs", "error.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "default",
            "level": "ERROR",
        },
    },
    "loggers": {
        "app": {
            "handlers": ["console", "file", "error_file"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
    "root": {
        "handlers": ["console", "file", "error_file"],
        "level": "INFO",
    },
}