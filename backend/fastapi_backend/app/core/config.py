from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Rescroll"
    
    # CORS Configuration
    CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:3000"]
    
    # MongoDB Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "rescroll"
    
    # JWT Configuration
    SECRET_KEY: str = "your_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # File Upload Configuration
    MAX_UPLOAD_SIZE: int = 5_242_880  # 5MB in bytes
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
