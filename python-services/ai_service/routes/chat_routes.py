# ============================================
# FILE: python-services/ai_service/routes/chat_routes.py
# ============================================
from fastapi import APIRouter, HTTPException
from datetime import datetime
import logging

from models.chat_models import ChatRequest, ChatResponse, SafetyCheckResult, RAGContext, SentimentResult, EmotionScore
from dependencies import get_langchain_service, get_rag_service, get_safety_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

#  ==================================================================================================== #

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process chat message with AI, RAG, and safety checks
    """
    start_time = datetime.utcnow()
    
    try:
        logger.info(f"Processing chat request for session: {request.sessionId}")
        
        # Get service instances
        langchain_service = get_langchain_service()
        rag_service = get_rag_service()
        safety_service = get_safety_service()
        
        # 1. Safety check on user message
        safety_check = await safety_service.analyze_message(request.message)
        
        # 2. Get RAG context if enabled
        rag_context = {"used": False, "documents": [], "relevanceScores": []}
        if request.useRAG:
            rag_results = await rag_service.retrieve_context(
                query=request.message,
                top_k=3
            )
            rag_context = {
                "used": True,
                "documents": rag_results["documents"],
                "relevanceScores": rag_results["scores"]
            }
        
        # 3. Generate AI response using LangChain
        ai_response = await langchain_service.generate_response(
            user_message=request.message,
            conversation_history=request.conversationHistory,
            rag_context=rag_context["documents"] if rag_context["used"] else None,
            safety_context=safety_check
        )
        
        # 4. Sentiment analysis
        sentiment = await safety_service.analyze_sentiment(request.message)
        
        # 5. Calculate processing time
        processing_time = (
            datetime.utcnow() - start_time
        ).total_seconds() * 1000
        
        logger.info(f"Chat processed successfully in {processing_time}ms")
        
        # 6. Format emotions properly for Pydantic model
        formatted_emotions = [
            EmotionScore(
                emotion=e["emotion"], 
                confidence=e["confidence"]
            )
            for e in sentiment.get("emotions", [])
        ]
        
        return ChatResponse(
            response=ai_response.get("message"),
            safetyCheck=SafetyCheckResult(
                riskScore=safety_check.get("risk_score", 0.0),
                riskLevel=safety_check.get("risk_level", "low"),
                keywords=safety_check.get("detected_keywords", []),
                flagged=safety_check.get("flagged", False),
                alertCounselor=safety_check.get("alert_counselor", False),
                recommendations=safety_check.get("recommendations", [])
            ),
            sentiment=SentimentResult(
                overall=sentiment.get("overall"),
                emotions=formatted_emotions,
                stressLevel=sentiment.get("stress_level")
            ),
            ragContext=RAGContext(**rag_context),
            processingTime=processing_time,
            modelUsed=ai_response.get("model")
        )
        
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"AI service error: {str(e)}"
        )
