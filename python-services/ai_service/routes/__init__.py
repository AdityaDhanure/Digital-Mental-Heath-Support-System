# ============================================
# FILE: python-services/ai_service/routes/__init__.py
# ============================================
from .chat_routes import router as chat_router
from .rag_routes import router as rag_router
from .safety_routes import router as safety_router
from .embedding_routes import router as embedding_router
from .health_routes import router as health_router

__all__ = [
    'chat_router',
    'rag_router',
    'safety_router',
    'embedding_router',
    'health_router'
]