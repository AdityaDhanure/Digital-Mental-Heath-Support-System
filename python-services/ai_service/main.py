# ============================================
# FILE: python-services/ai_service/main.py (REFACTORED)
# ============================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from config.settings import settings
from routes import (
    health_router,
    chat_router,
    rag_router,
    safety_router,
    embedding_router
)
from dependencies import initialize_services, cleanup_services

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Mental Health AI Service",
    description="AI-powered mental health support service with LangChain, RAG, and safety features",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(rag_router)
app.include_router(safety_router)
app.include_router(embedding_router)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting AI Service...")
    
    try:
        await initialize_services()
        logger.info("✅ AI Service started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down AI Service...")
    
    try:
        await cleanup_services()
        logger.info("AI Service shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")


# Run the application
if __name__ == "__main__":
    logger.info(f"🚀 Starting server on {settings.HOST}:{settings.PORT}")
    logger.info(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )