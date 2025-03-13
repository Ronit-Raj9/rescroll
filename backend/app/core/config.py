from typing import Any, List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
import secrets
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rescroll"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Rescroll Backend API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://ionia-next.vercel.app",
        "https://www.ionia.sbs",
        "https://ionia.sbs",
        "https://ionia-next-production.up.railway.app"
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"

    # JWT
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Cookie settings
    COOKIE_SECURE: bool = False  # Set to True in production with HTTPS

    # MongoDB
    MONGODB_URL: str
    DB_NAME: str = "rescroll"
    
    # Redis
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int
    REDIS_URL: str
    
    # AI/ML Settings
    GEMINI_API_KEY: str
    MODEL_NAME: str
    MAX_TOKENS: int
    
    # Research Paper APIs
    ARXIV_API_URL: str
    
    # Analytics
    ANALYTICS_DB_URL: str
    
    # Background Tasks
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()