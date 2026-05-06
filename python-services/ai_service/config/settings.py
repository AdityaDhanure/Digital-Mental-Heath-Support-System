from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os

class Settings(BaseSettings):
    """Application settings"""

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8001"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # ✅ CHANGE THIS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5000"

    # LLM
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    LLM_MODEL: str = "gemini-flash-latest"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 1000

    EMBEDDING_MODEL: str = "models/embedding-001"

    VECTOR_INDEX_PATH: str = "./data/faiss_index.index"
    METADATA_PATH: str = "./data/metadata.pkl"

    CRISIS_ALERT_THRESHOLD: float = 7.0

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