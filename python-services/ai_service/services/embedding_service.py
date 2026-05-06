# python-services/ai_service/services/embedding_service.py

from sentence_transformers import SentenceTransformer
from typing import List
import logging
import asyncio
import numpy as np
from config.settings import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating text embeddings"""
    
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.model = None  # Lazy load on first use
        logger.info(f"EmbeddingService initialized (model will load on first use)")
    
    def _ensure_model_loaded(self):
        """Load model on first use (lazy loading)"""
        if self.model is None:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded embedding model: {self.model_name}")

# 1. ==================================================================================================== #
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate normalized embedding for a single text"""
        self._ensure_model_loaded()
        if not self.model:
            raise RuntimeError("Embedding model not initialized")

        loop = asyncio.get_running_loop()
        embedding = await loop.run_in_executor(
            None,
            lambda: self.model.encode(
                text,
                convert_to_numpy=True,
                show_progress_bar=False
            )
        )

        # Normalize for cosine similarity
        embedding = embedding / np.linalg.norm(embedding)

        return embedding.tolist()


# 2.  ==================================================================================================== #
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate normalized embeddings for multiple texts"""
        self._ensure_model_loaded()
        if not self.model:
            raise RuntimeError("Embedding model not initialized")

        if not texts:
            return []

        loop = asyncio.get_running_loop()
        embeddings = await loop.run_in_executor(
            None,
            lambda: self.model.encode(
                texts,
                convert_to_numpy=True,
                show_progress_bar=False
            )
        )

        # Normalize embeddings
        embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

        return embeddings.tolist()
