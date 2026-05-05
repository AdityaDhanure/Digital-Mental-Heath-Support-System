# ============================================
# FILE: python-services/ai_service/models/document_models.py
# ============================================
from pydantic import BaseModel
from typing import List

# rag_routes.py
class DocumentInput(BaseModel):
    """Single document for RAG indexing"""
    title: str
    content: str
    category: str = "general"
    type: str = "text"


class DocumentBatch(BaseModel):
    """Batch of documents for bulk indexing"""
    documents: List[DocumentInput]