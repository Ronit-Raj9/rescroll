import os
import secrets
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, Field, PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Server Settings
    PORT: int = Field(default=int(os.getenv("PORT", 8000)))
    BASE_URL: str = Field(default=os.getenv("BASE_URL", "http://localhost:8000/api/v1"))
    API_V1_STR: str = Field(default=os.getenv("API_V1_STR", "/api/v1"))
    DEBUG: bool = Field(default=os.getenv("DEBUG", "False").lower() == "true")
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # JWT Settings
    SECRET_KEY: str = Field(default_factory=lambda: os.getenv("SECRET_KEY", secrets.token_urlsafe(32)))
    ACCESS_TOKEN_SECRET: str = Field(default_factory=lambda: os.getenv("ACCESS_TOKEN_SECRET", secrets.token_urlsafe(32)))
    REFRESH_TOKEN_SECRET: str = Field(default_factory=lambda: os.getenv("REFRESH_TOKEN_SECRET", secrets.token_urlsafe(32)))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "14400")))
    ALGORITHM: str = Field(default=os.getenv("ALGORITHM", "HS256"))
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = Field(default=int(os.getenv("EMAIL_RESET_TOKEN_EXPIRE_HOURS", "24")))
    
    # Cookie Settings
    COOKIE_SECURE: bool = Field(default=os.getenv("COOKIE_SECURE", "false").lower() == "true")
    
    # Supabase settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    
    # Database settings
    DATABASE_URL: str = Field(default=os.getenv("DATABASE_URL", ""))
    DATABASE_USERNAME: str = Field(default=os.getenv("USER", os.getenv("USER", "postgres")))
    DATABASE_PASSWORD: str = Field(default=os.getenv("PASSWORD", os.getenv("PASSWORD", "Rescroll_123")))
    DATABASE_HOST: str = Field(default=os.getenv("HOST", os.getenv("HOST", "localhost")))
    DATABASE_PORT: str = Field(default=os.getenv("PORT", os.getenv("PORT", "5432")))
    DATABASE_NAME: str = Field(default=os.getenv("DBNAME", os.getenv("DBNAME", "postgres")))
    DATABASE_SSL: bool = Field(default=os.getenv("DATABASE_SSL", "false").lower() == "true")
    
    # Database Connection Variables
    DB_CONNECT_TIMEOUT: int = Field(default=int(os.getenv("DB_CONNECT_TIMEOUT", "15")))
    DB_POOL_TIMEOUT: int = Field(default=int(os.getenv("DB_POOL_TIMEOUT", "30")))
    DB_MAX_CONNECTIONS: int = Field(default=int(os.getenv("DB_MAX_CONNECTIONS", "20")))
    
    # Alternative database connection options
    DATABASE_DIRECT_URL: Optional[str] = Field(default=os.getenv("DATABASE_DIRECT_URL", None))
    DATABASE_ALT_HOST: Optional[str] = Field(default=os.getenv("DATABASE_ALT_HOST", None))
    USE_DIRECT_URL: bool = Field(default=os.getenv("USE_DIRECT_URL", "false").lower() == "true")
    
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None
    
    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str):
            return v
            
        values = info.data
        
        # Check if direct URL is provided and should be used
        if values.get("USE_DIRECT_URL") and values.get("DATABASE_DIRECT_URL"):
            db_url = values.get("DATABASE_DIRECT_URL")
            # Convert to asyncpg for async operations
            if '+psycopg2' in db_url:
                db_url = db_url.replace('+psycopg2', '+asyncpg')
            # Remove sslmode parameter since asyncpg handles it differently
            if '?sslmode=' in db_url:
                db_url = db_url.split('?sslmode=')[0]
            return db_url
        
        # Check if DATABASE_URL is provided and convert to async driver
        if values.get("DATABASE_URL"):
            db_url = values.get("DATABASE_URL")
            # Make sure we're using an async driver
            if '+psycopg2' in db_url:
                db_url = db_url.replace('+psycopg2', '+asyncpg')
            # Remove sslmode parameter since asyncpg handles it differently
            if '?sslmode=' in db_url:
                db_url = db_url.split('?sslmode=')[0]
            return db_url
        
        # Determine host - use alternate if specified
        host = values.get("DATABASE_ALT_HOST") or values.get("DATABASE_HOST")
        
        port = values.get("DATABASE_PORT")
        # Convert port to integer
        if port is not None:
            port = int(port)
         
        # Build the DSN
        dsn = PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=values.get("DATABASE_USERNAME"),
            password=values.get("DATABASE_PASSWORD"),
            host=host,
            port=port,
            path=f"/{values.get('DATABASE_NAME') or ''}",
        )
        
        # For Supabase connection, just return the DSN without SSL parameters in URL
        # SSL will be handled in the connect_args in session.py
        return str(dsn)
    
    # Application settings
    PROJECT_NAME: str = "Rescroll"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Rescroll Backend API"
    FRONTEND_URL: str = Field(default=os.getenv("FRONTEND_URL", "http://localhost:3000"))
    
    # MongoDB settings
    MONGODB_ATLAS_URI: str = Field(default=os.getenv("MONGODB_ATLAS_URI", ""))
    MONGODB_LOCAL_URI: str = Field(default=os.getenv("MONGODB_LOCAL_URI", "mongodb://localhost:27017"))
    
    # Email settings
    MAIL_USERNAME: str = Field(default=os.getenv("MAIL_USERNAME", ""))
    MAIL_PASSWORD: str = Field(default=os.getenv("MAIL_PASSWORD", ""))
    MAIL_FROM: str = Field(default=os.getenv("MAIL_FROM", "noreply@rescroll.com"))
    MAIL_PORT: int = Field(default=int(os.getenv("MAIL_PORT", "587")))
    MAIL_SERVER: str = Field(default=os.getenv("MAIL_SERVER", "smtp.gmail.com"))
    MAIL_FROM_NAME: str = Field(default=os.getenv("MAIL_FROM_NAME", "Rescroll"))
    
    # Redis settings
    REDIS_HOST: str = Field(default=os.getenv("REDIS_HOST", "localhost"))
    REDIS_PORT: int = Field(default=int(os.getenv("REDIS_PORT", "6379")))
    REDIS_PASSWORD: str = Field(default=os.getenv("REDIS_PASSWORD", ""))
    REDIS_DB: int = Field(default=int(os.getenv("REDIS_DB", "0")))
    REDIS_URL: str = Field(default=os.getenv("REDIS_URL", ""))
    REDIS_SSL: bool = Field(default=os.getenv("REDIS_SSL", "false").lower() == "true")
    REDIS_TIMEOUT: int = Field(default=int(os.getenv("REDIS_TIMEOUT", "5")))
    REDIS_MAX_CONNECTIONS: int = Field(default=int(os.getenv("REDIS_MAX_CONNECTIONS", "10")))

    @model_validator(mode="after")
    def set_redis_url(self) -> "Settings":
        if not self.REDIS_URL:
            redis_host = self.REDIS_HOST
            redis_port = self.REDIS_PORT
            redis_password = self.REDIS_PASSWORD
            redis_db = self.REDIS_DB
            
            if redis_password:
                self.REDIS_URL = f"redis://:{redis_password}@{redis_host}:{redis_port}/{redis_db}"
            else:
                self.REDIS_URL = f"redis://{redis_host}:{redis_port}/{redis_db}"
                
        return self

    # Cache settings
    CACHE_TTL: int = Field(default=int(os.getenv("CACHE_TTL", "3600")))  # 1 hour default
    CACHE_PREFIX: str = Field(default=os.getenv("CACHE_PREFIX", "rescroll"))
    CACHE_ENABLED: bool = Field(default=os.getenv("CACHE_ENABLED", "true").lower() == "true")
    
    # AI/ML Settings
    GEMINI_API_KEY: str = Field(default=os.getenv("GEMINI_API_KEY", ""))
    MODEL_NAME: str = Field(default=os.getenv("MODEL_NAME", "gemini-pro"))
    MAX_TOKENS: int = Field(default=int(os.getenv("MAX_TOKENS", "8192")))
    
    # Research Paper APIs
    ARXIV_API_URL: str = Field(default=os.getenv("ARXIV_API_URL", "http://export.arxiv.org/api/query"))
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str = Field(default=os.getenv("CLOUDINARY_CLOUD_NAME", ""))
    CLOUDINARY_API_KEY: str = Field(default=os.getenv("CLOUDINARY_API_KEY", ""))
    CLOUDINARY_API_SECRET: str = Field(default=os.getenv("CLOUDINARY_API_SECRET", ""))
    
    # Extra settings
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="allow",
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()