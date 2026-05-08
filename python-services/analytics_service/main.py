# python-services/analytics_service/main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from datetime import datetime, timezone
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Read PORT from environment (Render injects $PORT automatically)
# ------------------------------------------------------------------
PORT = int(os.environ.get("PORT", "8002"))

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5000"
).split(",")

app = FastAPI(
    title="Mental Health Analytics Service",
    description="Advanced analytics and reporting service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------
# CORS — do NOT combine allow_origins=["*"] with allow_credentials=True
# (it violates the CORS spec; browsers reject it)
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ------------------------------------------------------------------
# Models
# ------------------------------------------------------------------
class ReportRequest(BaseModel):
    reportType: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    format: str = "json"
    metrics: Optional[Dict[str, Any]] = None


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_recommendations(metrics: Dict[str, Any]) -> list[str]:
    recommendations: list[str] = []
    high_risk = metrics.get("highRiskDetections", 0) or 0
    pending_bookings = metrics.get("pendingBookings", 0) or 0
    flagged_posts = metrics.get("flaggedPosts", 0) or 0

    if high_risk > 0:
        recommendations.append(
            "Review high-risk chat sessions and confirm escalation workflows are followed."
        )
    if pending_bookings > 0:
        recommendations.append(
            "Review pending counseling bookings to reduce student wait time."
        )
    if flagged_posts > 0:
        recommendations.append(
            "Moderate flagged community posts to keep the support space safe."
        )
    if not recommendations:
        recommendations.append(
            "No urgent operational actions detected for the supplied metrics."
        )
    return recommendations


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Analytics Service",
        "version": "1.0.0",
        "timestamp": utc_now_iso(),
    }


@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    """Generate analytics report from metrics provided by the primary backend."""
    try:
        logger.info(f"Generating {request.reportType} report")
        metrics = request.metrics or {}
        report_data = {
            "reportType": request.reportType,
            "generatedAt": utc_now_iso(),
            "period": {
                "start": request.startDate,
                "end": request.endDate,
            },
            "summary": metrics,
            "trends": metrics.get("trends", []),
            "recommendations": build_recommendations(metrics),
            "note": (
                "This service summarises metrics supplied by the primary backend; "
                "it does not invent platform totals."
            ),
        }
        return {"status": "success", "report": report_data}

    except Exception as e:
        logger.error(f"Report generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# Entry point (local dev only — Render uses the Start Command below)
# ------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,   # Never True in production
        log_level="info",
    )
