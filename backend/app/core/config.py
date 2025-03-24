import os
import secrets
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, Field, PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(default_factory=lambda: os.getenv("SECRET_KEY", secrets.token_urlsafe(32)))
    ACCESS_TOKEN_SECRET: str = Field(default_factory=lambda: os.getenv("ACCESS_TOKEN_SECRET", secrets.token_urlsafe(32)))
    REFRESH_TOKEN_SECRET: str = Field(default_factory=lambda: os.getenv("REFRESH_TOKEN_SECRET", secrets.token_urlsafe(32)))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database settings
    DATABASE_USERNAME: str = Field(default=os.getenv("DATABASE_USERNAME", "postgres"))
    DATABASE_PASSWORD: str = Field(default=os.getenv("DATABASE_PASSWORD", "postgres"))
    DATABASE_HOST: str = Field(default=os.getenv("DATABASE_HOST", "localhost"))
    DATABASE_PORT: str = Field(default=os.getenv("DATABASE_PORT", "5432"))
    DATABASE_NAME: str = Field(default=os.getenv("DATABASE_NAME", "rescroll"))
    
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None
    
    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str):
            return v
            
        values = info.data
        port = values.get("DATABASE_PORT")
        # Convert port to integer
        if port is not None:
            port = int(port)
            
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=values.get("DATABASE_USERNAME"),
            password=values.get("DATABASE_PASSWORD"),
            host=values.get("DATABASE_HOST"),
            port=port,
            path=f"/{values.get('DATABASE_NAME') or ''}",
        )
    
    # Application settings
    PROJECT_NAME: str = "Rescroll"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Rescroll Backend API"
    DEBUG: bool = Field(default=os.getenv("DEBUG", "False").lower() == "true")
    PORT: int = Field(default=int(os.getenv("PORT", 8000)))
    
    # MongoDB settings
    MONGODB_ATLAS_URI: str = Field(default=os.getenv("MONGODB_ATLAS_URI", ""))
    MONGODB_LOCAL_URI: str = Field(default=os.getenv("MONGODB_LOCAL_URI", "mongodb://localhost:27017"))
    
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