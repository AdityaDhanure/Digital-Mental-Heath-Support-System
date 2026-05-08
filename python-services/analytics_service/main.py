# python-services/analytics_service/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Mental Health Analytics Service",
    description="Advanced analytics and reporting service",
    version="1.0.0"
)

#  ================================================================================ #
# CORS Middlewares:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  ================================================================================ #
# Models:
class ReportRequest(BaseModel):
    reportType: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    format: str = "json"
    metrics: Optional[Dict[str, Any]] = None


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_recommendations(metrics: Dict[str, Any]) -> list[str]:
    recommendations: list[str] = []
    high_risk = metrics.get("highRiskDetections", 0) or 0
    pending_bookings = metrics.get("pendingBookings", 0) or 0
    flagged_posts = metrics.get("flaggedPosts", 0) or 0

    if high_risk > 0:
        recommendations.append("Review high-risk chat sessions and confirm escalation workflows are followed.")
    if pending_bookings > 0:
        recommendations.append("Review pending counseling bookings to reduce student wait time.")
    if flagged_posts > 0:
        recommendations.append("Moderate flagged community posts to keep the support space safe.")
    if not recommendations:
        recommendations.append("No urgent operational actions detected for the supplied metrics.")

    return recommendations


# Routes:
# 1. =================================================================================================== #
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Analytics Service",
        "version": "1.0.0",
        "timestamp": utc_now_iso()
    }

# 2. =================================================================================================== #
@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    """Generate analytics report"""
    try:
        logger.info(f"Generating {request.reportType} report")
        
        metrics = request.metrics or {}
        report_data = {
            "reportType": request.reportType,
            "generatedAt": utc_now_iso(),
            "period": {
                "start": request.startDate,
                "end": request.endDate
            },
            "summary": metrics,
            "trends": metrics.get("trends", []),
            "recommendations": build_recommendations(metrics),
            "note": "This service summarizes metrics supplied by the primary backend; it does not invent platform totals."
        }
        
        return {
            "status": "success",
            "report": report_data
        }
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

#  ====================================================================================================== #
# Function Calling:
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    )
