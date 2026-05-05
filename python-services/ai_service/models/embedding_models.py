# ============================================
# FILE: python-services/ai_service/models/embedding_models.py
# ============================================
from pydantic import BaseModel, Field
from typing import List


class EmbeddingRequest(BaseModel):
    """Embedding generation request"""
    text: str = Field(..., min_length=1)


class EmbeddingResponse(BaseModel):
    """Embedding generation response"""
    embedding: List[float]
    dimensions: int