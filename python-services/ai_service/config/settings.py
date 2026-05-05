# python-services/ai_service/config/settings.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173"
    ]
    
    # LLM Configuration
    GOOGLE_API_KEY: str = os.getenv("NEW_GOOGLE_API_KEY", "")
    LLM_MODEL: str = "gemini-flash-latest"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 1000
    
    # Embedding Configuration
    EMBEDDING_MODEL: str = "models/embedding-001"
    
    # Vector Store Configuration
    VECTOR_INDEX_PATH: str = "./data/faiss_index"
    METADATA_PATH: str = "./data/metadata.pkl"
    
    # Safety Configuration
    CRISIS_ALERT_THRESHOLD: float = 7.0

    # NEW SYNTAX: Use model_config instead of class Config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()