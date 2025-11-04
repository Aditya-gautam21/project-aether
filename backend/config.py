"""Configuration management for Aether AI"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Amazon Q Configuration
    aws_access_key_id: Optional[str] = Field(None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, env="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field("us-east-1", env="AWS_REGION")
    amazon_q_application_id: Optional[str] = Field(None, env="AMAZON_Q_APPLICATION_ID")
    
    # OpenAI Fallback
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    
    # Database
    database_url: str = Field("sqlite:///./aether.db", env="DATABASE_URL")
    
    # Redis
    redis_url: str = Field("redis://localhost:6379", env="REDIS_URL")
    
    # Security
    secret_key: str = Field("dev-secret-key-change-in-production", env="SECRET_KEY")
    algorithm: str = Field("HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Google Calendar
    google_client_id: Optional[str] = Field(None, env="GOOGLE_CLIENT_ID")
    google_client_secret: Optional[str] = Field(None, env="GOOGLE_CLIENT_SECRET")
    
    # Environment
    environment: str = Field("development", env="ENVIRONMENT")
    debug: bool = Field(True, env="DEBUG")
    
    # CORS
    allowed_origins: list = Field(["http://localhost:3000", "http://localhost:5173"], env="ALLOWED_ORIGINS")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()