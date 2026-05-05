# ============================================
# FILE: python-services/ai_service/routes/embedding_routes.py
# ============================================
from fastapi import APIRouter, HTTPException
import logging

from models.embedding_models import EmbeddingRequest, EmbeddingResponse
from dependencies import get_embedding_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/embeddings", tags=["Embeddings"])

#  ==================================================================================================== #

@router.post("", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """
    Generate text embeddings
    """
    try:
        embedding_service = get_embedding_service()
        
        embedding = await embedding_service.generate_embedding(request.text)
        
        return EmbeddingResponse(
            embedding=embedding,
            dimensions=len(embedding)
        )
    except Exception as e:
        logger.error(f"Embedding generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))