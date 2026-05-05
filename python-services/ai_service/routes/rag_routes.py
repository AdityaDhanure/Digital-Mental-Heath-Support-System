# ============================================
# FILE: python-services/ai_service/routes/rag_routes.py
# ============================================
from fastapi import APIRouter, HTTPException
import logging

from models.document_models import DocumentBatch
from dependencies import get_rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["RAG"])

#  ==================================================================================================== #

@router.post("/add-documents")
async def add_documents_to_rag(documents: DocumentBatch):
    """
    Add documents to the RAG vector store
    """
    try:
        rag_service = get_rag_service()
        
        # Convert Pydantic models to dicts
        doc_list = [doc.model_dump() for doc in documents.documents]
        
        result = await rag_service.add_documents(doc_list)
        
        return {
            "status": "success",
            "message": f"Added {result['count']} documents to RAG store"
        }
    except Exception as e:
        logger.error(f"Document addition error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

#  ==================================================================================================== #

@router.post("/search")
async def search_rag(query: str, top_k: int = 5):
    """
    Search the RAG vector store
    """
    try:
        rag_service = get_rag_service()
        
        results = await rag_service.retrieve_context(query, top_k)
        
        return {
            "status": "success",
            "results": results
        }
    except Exception as e:
        logger.error(f"RAG search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
