# ============================================
# FILE: python-services/ai_service/routes/health_routes.py
# ============================================
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "dependencies": {
            "langchain": "operational",
            "rag": "operational",
            "safety": "operational"
        }
    }