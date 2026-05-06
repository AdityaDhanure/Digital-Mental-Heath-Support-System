# python-services/ai_service/services/rag_service.py

import os
import asyncio
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import logging
import tempfile
import shutil
from config.settings import settings

logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service using FAISS"""
    
    def __init__(self):
        self.embedding_model_name = settings.EMBEDDING_MODEL
        self.index_path = settings.VECTOR_INDEX_PATH
        self.metadata_path = settings.METADATA_PATH
        self.dimension = 384  # Default for all-MiniLM-L6-v2
        
        self.embedding_model = None
        self.index = None
        self.documents = []

        # ✅ Prevent concurrent index writes
        self._save_lock = asyncio.Lock()

        # Optional state flags
        self._dirty = False
        self._closed = False

# 1. ==================================================================================================================================== #               
    async def initialize(self):
        """Initialize the RAG service safely and efficiently"""
        try:
            logger.info("Initializing RAG service...")

            # ---- Load embedding model (non-blocking) ----
            loop = asyncio.get_running_loop()
            self.embedding_model = await loop.run_in_executor(
                None,
                SentenceTransformer,
                self.embedding_model_name
            )

            self.dimension = self.embedding_model.get_sentence_embedding_dimension()
            logger.info(f"Embedding model loaded: {self.embedding_model_name}")

            index_file = f"{self.index_path}.index"

            # ---- Load or create FAISS index ----
            if os.path.exists(index_file):
                self.index = faiss.read_index(index_file)

                if self.index.d != self.dimension:
                    raise ValueError(
                        f"Embedding dimension mismatch: "
                        f"index={self.index.d}, model={self.dimension}"
                    )

                logger.info(f"Loaded FAISS index ({self.index.ntotal} vectors)")

                # ---- Load metadata ----
                if os.path.exists(self.metadata_path):
                    with open(self.metadata_path, "rb") as f:
                        self.documents = pickle.load(f)

                    if len(self.documents) != self.index.ntotal:
                        logger.warning(
                            "FAISS index and metadata count mismatch — rebuilding index"
                        )
                        await self._rebuild_index()
                else:
                    logger.warning("Metadata missing — rebuilding index")
                    await self._rebuild_index()

            else:
                logger.info("No existing index found — creating new FAISS index")
                self.index = faiss.IndexFlatL2(self.dimension)
                self.documents = []
                await self._load_default_resources()

            logger.info("RAG service initialized successfully")

        except Exception as e:
            logger.exception("RAG initialization failed")
            raise


# 1. => a. ==================================================================================================== #  
    async def _rebuild_index(self):
        """Rebuild FAISS index from stored documents"""
        self.index = faiss.IndexFlatL2(self.dimension)

        if not self.documents:
            await self._load_default_resources()
            return

        texts = [doc["content"] for doc in self.documents]
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)

        self.index.add(embeddings)
        await self._persist_index()


# 1. => b. ==================================================================================================== # 
    async def _persist_index(self):
        faiss.write_index(self.index, f"{self.index_path}.index")
        with open(self.metadata_path, "wb") as f:
            pickle.dump(self.documents, f)


# 1. => c. ==================================================================================================== # 
    async def _load_default_resources(self):
        """Load concise, high-quality default mental health resources"""

        default_resources = [
            {
                "id": "anxiety_intro",
                "title": "Understanding Anxiety",
                "content": (
                    "Anxiety is a natural stress response. Common signs include restlessness, "
                    "rapid breathing, and difficulty concentrating. Helpful strategies include "
                    "slow breathing, grounding, and muscle relaxation."
                ),
                "category": "anxiety",
                "type": "article"
            },
            {
                "id": "academic_stress",
                "title": "Managing Academic Stress",
                "content": (
                    "Academic stress is common among college students. Managing it includes "
                    "breaking tasks into steps, planning study time, taking breaks, and asking for help."
                ),
                "category": "stress",
                "type": "guide"
            },
            {
                "id": "sleep_hygiene",
                "title": "Sleep Hygiene for Students",
                "content": (
                    "Good sleep supports mental health. Keep a regular sleep schedule, "
                    "limit screens before bed, reduce caffeine, and create a calm sleep environment."
                ),
                "category": "sleep",
                "type": "guide"
            },
            {
                "id": "mindfulness_basics",
                "title": "Mindfulness and Meditation",
                "content": (
                    "Mindfulness means focusing on the present without judgment. "
                    "Even 5–10 minutes of breathing or body-scan meditation can reduce stress and improve focus."
                ),
                "category": "mindfulness",
                "type": "exercise"
            },
            {
                "id": "depression_signs",
                "title": "Recognizing Depression",
                "content": (
                    "Depression may involve persistent sadness, low energy, sleep or appetite changes, "
                    "and loss of interest. Professional support is important if these symptoms persist."
                ),
                "category": "depression",
                "type": "article"
            },
            {
                "id": "resilience_building",
                "title": "Building Resilience",
                "content": (
                    "Resilience is the ability to recover from challenges. It grows through "
                    "self-care, social support, realistic goals, and learning from setbacks."
                ),
                "category": "general-wellness",
                "type": "guide"
            },
            {
                "id": "grounding_54321",
                "title": "Grounding Techniques",
                "content": (
                    "The 5-4-3-2-1 technique helps reduce anxiety by focusing on the senses. "
                    "Notice 5 things you see, 4 you touch, 3 you hear, 2 you smell, and 1 you taste."
                ),
                "category": "coping-strategies",
                "type": "exercise"
            },
            {
                "id": "social_anxiety",
                "title": "Social Anxiety Management",
                "content": (
                    "Social anxiety involves fear of social situations. Helpful approaches include "
                    "gradual exposure, challenging negative thoughts, relaxation, and counseling support."
                ),
                "category": "anxiety",
                "type": "guide"
            }
        ]
        
        await self.add_documents(default_resources)
        logger.info(f"Loaded {len(default_resources)} default mental health resources")

# 2. ==================================================================================================================================== #  
    async def add_documents(
        self,
        documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Add documents to the vector store
        
        Args:
            documents: List of document dictionaries with 'content' field
            
        Returns:
            Dict with operation results
        """
        if not documents:
            return {"count": 0, "status": "no documents provided"}

        try:
            # ---- Existing document IDs ----
            existing_ids = {
                doc["id"] for doc in self.documents if "id" in doc
            }

            clean_docs = []
            texts = []

            for doc in documents:
                doc_id = doc.get("id")
                content = doc.get("content", "").strip()

                # ---- Validate ----
                if not doc_id or not content:
                    continue
                if doc_id in existing_ids:
                    continue  # Skip duplicates

                # ---- Trim content for better embeddings ----
                content = content[:1000]
                doc["content"] = content

                clean_docs.append(doc)
                texts.append(content)

            if not texts:
                return {"count": 0, "status": "no new documents"}

            # ---- Generate embeddings (non-blocking) ----
            loop = asyncio.get_running_loop()
            embeddings = await loop.run_in_executor(
                None,
                lambda: self.embedding_model.encode(
                    texts,
                    convert_to_numpy=True,
                    show_progress_bar=False
                )
            )

            embeddings = embeddings.astype("float32")

            # ---- Add to FAISS ----
            start_count = self.index.ntotal
            self.index.add(embeddings)

            # ---- Persist metadata ----
            self.documents.extend(clean_docs)
            self._dirty = True

            # ---- Integrity check ----
            if self.index.ntotal != len(self.documents):
                raise RuntimeError(
                    "FAISS index and document metadata out of sync"
                )

            await self._save_index()

            logger.info(
                "Added %d new documents (total: %d)",
                len(clean_docs),
                self.index.ntotal
            )

            return {
                "count": len(clean_docs),
                "total_documents": self.index.ntotal,
                "status": "success"
            }

        except Exception:
            logger.exception("Failed to add documents to RAG store")
            raise

# 3. ====================================================================================================================================== # 
    async def retrieve_context(
        self,
        query: str,
        top_k: int = 3,
        threshold: float = 0.75
    ) -> Dict[str, Any]:
        """
        Retrieve relevant documents using cosine similarity
        """
        try:
            if not query.strip() or self.index.ntotal == 0:
                return {"documents": [], "scores": [], "query": query}

            # ---- Generate query embedding (non-blocking) ----
            loop = asyncio.get_running_loop()
            query_embedding = await loop.run_in_executor(
                None,
                lambda: self.embedding_model.encode(
                    [query],
                    convert_to_numpy=True,
                    show_progress_bar=False
                )
            )

            # ---- Normalize query embedding ----
            query_embedding = query_embedding.astype("float32")
            query_embedding /= np.linalg.norm(query_embedding, axis=1, keepdims=True)

            # ---- FAISS search ----
            k = min(top_k, self.index.ntotal)
            distances, indices = self.index.search(query_embedding, k)

            # ---- Convert L2 distance to cosine similarity ----
            # For normalized vectors: cosine_sim = 1 - (L2_distance^2 / 2)
            similarities = 1 - (distances[0] / 2)

            results = []
            scores = []

            for idx, score in zip(indices[0], similarities):
                if idx < 0 or idx >= len(self.documents):
                    continue
                if score >= threshold:
                    results.append(self.documents[idx])
                    scores.append(float(score))

            logger.info(
                "Retrieved %d documents for query '%s'",
                len(results),
                query
            )

            return {
                "documents": results,
                "scores": scores,
                "query": query
            }

        except Exception:
            logger.exception("Context retrieval failed")
            return {
                "documents": [],
                "scores": [],
                "query": query
            }


# 4. ==================================================================================================================================== #  
    async def search_by_category(
        self,
        category: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieve documents by category (fast lookup)
        """
        try:
            if not category or not self.documents:
                return []

            category = category.strip().lower()

            results = [
                doc for doc in self.documents
                if doc.get("category", "").lower() == category
            ]

            return results[:top_k]

        except Exception:
            logger.exception("Category search failed")
            return []


# 5. ==================================================================================================================================== #    
    async def close(self):
        """Gracefully persist RAG resources and cleanup"""
        try:
            if getattr(self, "_closed", False):
                return

            self._closed = True

            if getattr(self, "_dirty", False):
                await self._save_index()

            logger.info("RAG service closed cleanly")

        except Exception:
            logger.exception("RAG service cleanup failed")


# 1,5. => a. ==================================================================================================== #    
    async def _save_index(self):
        """Atomically save FAISS index and metadata to disk"""
        if not hasattr(self, "index") or self.index.ntotal == 0:
            return

        async with self._save_lock:
            try:
                index_file = f"{self.index_path}.index"
                metadata_file = self.metadata_path

                index_dir = os.path.dirname(index_file) or "."
                os.makedirs(index_dir, exist_ok=True)

                loop = asyncio.get_running_loop()

                with tempfile.TemporaryDirectory(dir=index_dir) as tmpdir:
                    tmp_index = os.path.join(tmpdir, "index.tmp")
                    tmp_meta = os.path.join(tmpdir, "meta.tmp")

                    await loop.run_in_executor(
                        None,
                        lambda: faiss.write_index(self.index, tmp_index)
                    )

                    await loop.run_in_executor(
                        None,
                        lambda: pickle.dump(self.documents, open(tmp_meta, "wb"))
                    )

                    os.replace(tmp_index, index_file)
                    os.replace(tmp_meta, metadata_file)
                
                self._dirty = False

                logger.info(
                    "FAISS index and metadata saved safely (%d vectors)",
                    self.index.ntotal
                )

            except Exception:
                logger.exception("Failed to save FAISS index")


# 6. ===================================================================================================================================== #    
    def get_stats(self) -> Dict[str, Any]:
        """Get RAG service statistics (safe & lightweight)"""
        return {
            "total_documents": len(self.documents) if hasattr(self, "documents") else 0,
            "index_size": self.index.ntotal if hasattr(self, "index") and self.index else 0,
            "embedding_dimension": getattr(self, "dimension", None),
            "embedding_model": getattr(self, "embedding_model_name", None),
            "index_loaded": bool(getattr(self, "index", None)),
            "dirty": getattr(self, "_dirty", False),
            "closed": getattr(self, "_closed", False)
        }
