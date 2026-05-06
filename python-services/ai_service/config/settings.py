from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os

class Settings(BaseSettings):
    """Application settings"""

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8001"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # CORS - Read from .env file
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5000")

    # LLM - All read from .env file
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACEHUB_API_TOKEN", "")
    
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-flash-latest")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1000"))

    # Embedding - Read from .env file
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    # Vector Store - Read from .env file
    VECTOR_INDEX_PATH: str = os.getenv("VECTOR_INDEX_PATH", "./data/faiss_index.index")
    METADATA_PATH: str = os.getenv("METADATA_PATH", "./data/metadata.pkl")

    # Safety - Read from .env file
    CRISIS_ALERT_THRESHOLD: float = float(os.getenv("CRISIS_ALERT_THRESHOLD", "7.0"))

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("GOOGLE_API_KEY")
    @classmethod
    def validate_api_key(cls, v):
        # Allow empty string in production, but warn in debug mode
        if not v or v.strip() == "":
            logger = __import__('logging').getLogger(__name__)
            logger.warning("GOOGLE_API_KEY environment variable is not set")
        return v

    # ✅ ADD THIS HELPER
    @property
    def allowed_origins_list(self):
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        

settings = Settings()