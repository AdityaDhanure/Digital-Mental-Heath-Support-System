# ============================================
# FILE: python-services/ai_service/routes/safety_routes.py
# ============================================
from fastapi import APIRouter, HTTPException
import logging

from dependencies import get_safety_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/safety", tags=["Safety"])

# ========================================================================================= #

@router.post("/check")
async def check_safety(message: str):
    """
    Perform safety check on a message
    """
    try:
        safety_service = get_safety_service()
        
        result = await safety_service.analyze_message(message)
        
        return {
            "status": "success",
            "safetyCheck": result
        }
    except Exception as e:
        logger.error(f"Safety check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

#  ========================================================================================== #

@router.post("/sentiment/analyze")
async def analyze_sentiment(message: str):
    """
    Analyze sentiment of a message
    """
    try:
        safety_service = get_safety_service()
        
        result = await safety_service.analyze_sentiment(message)
        
        return {
            "status": "success",
            "sentiment": result
        }
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))