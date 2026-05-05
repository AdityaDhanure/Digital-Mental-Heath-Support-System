# FILE: python-services/ai_service/models/chat_models.py
# ============================================
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None


class SafetyCheckResult(BaseModel):
    """Safety analysis result"""
    riskScore: float
    riskLevel: str
    keywords: List[str]
    flagged: bool
    alertCounselor: bool
    recommendations: List[str]


class EmotionScore(BaseModel):
    """Individual emotion with confidence score"""
    emotion: str
    confidence: float


class SentimentResult(BaseModel):
    """Sentiment analysis result"""
    overall: str
    emotions: List[EmotionScore]
    stressLevel: str




class RAGContext(BaseModel):
    """RAG retrieval context"""
    used: bool
    documents: List[Dict[str, Any]]
    relevanceScores: List[float]




class ChatRequest(BaseModel):
    """Chat request payload"""
    message: str = Field(..., min_length=1, max_length=5000)
    sessionId: str
    userId: str  # Anonymized token
    conversationHistory: Optional[List[ChatMessage]] = []
    useRAG: bool = True


class ChatResponse(BaseModel):
    """Chat response payload"""
    response: str
    safetyCheck: SafetyCheckResult
    sentiment: SentimentResult
    ragContext: RAGContext
    processingTime: float
    modelUsed: str
