# ============================================
# FILE: python-services/ai_service/dependencies.py
# ============================================
"""
Dependency injection for services
"""
from services.langchain_service import LangChainService
from services.rag_service import RAGService
from services.safety_service import SafetyService
from services.embedding_service import EmbeddingService

# Global service instances
_langchain_service = None
_rag_service = None
_safety_service = None
_embedding_service = None

# ================================================================= #
# (chat_routes.py)
def get_langchain_service() -> LangChainService:
    """Get LangChain service instance"""
    global _langchain_service
    if _langchain_service is None:
        _langchain_service = LangChainService()
    return _langchain_service

# (chat_routes.py), (rag_routes.py)
def get_rag_service() -> RAGService:
    """Get RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service

# (chat_routes.py), (safety_routes.py) 
def get_safety_service() -> SafetyService:
    """Get Safety service instance"""
    global _safety_service
    if _safety_service is None:
        _safety_service = SafetyService()
    return _safety_service
# ================================================================= #


# ================================================================= #
# (embedding_routes.py)
def get_embedding_service() -> EmbeddingService:
    """Get Embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
# ================================================================= #


# ================================================================= #
# (main.py)
async def initialize_services():
    """Initialize all services on startup"""
    rag_service = get_rag_service()
    safety_service = get_safety_service()
    
    await rag_service.initialize()
    await safety_service.load_models()


async def cleanup_services():
    """Cleanup all services on shutdown"""
    rag_service = get_rag_service()
    await rag_service.close()
# ================================================================= #
