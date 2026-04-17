"""Fraud detection routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.fraud_service import run_fraud_check

router = APIRouter()


class FraudCheckRequest(BaseModel):
    worker_id: str
    event_id: str
    gps_lat: float
    gps_lng: float
    last_activity_hours_ago: float = 0.5
    claims_past_30d: int = 1
    claim_to_coverage_ratio: float = 0.3
    earnings_match_score: float = 0.85


class FraudCheckResponse(BaseModel):
    anomaly_score: float
    decision: str
    flags: list
    shap_explanation: str | None = None


@router.post("/score", response_model=FraudCheckResponse)
async def score_fraud(request: FraudCheckRequest):
    """Score a claim for fraud using 5-layer detection system."""
    result = run_fraud_check(
        worker_id=request.worker_id,
        event_id=request.event_id,
        gps_lat=request.gps_lat,
        gps_lng=request.gps_lng,
        last_activity_hours_ago=request.last_activity_hours_ago,
        claims_past_30d=request.claims_past_30d,
        claim_to_coverage_ratio=request.claim_to_coverage_ratio,
        earnings_match_score=request.earnings_match_score,
    )
    return result


@router.get("/explain/{check_id}")
async def get_fraud_explanation(check_id: str):
    """Get SHAP explanation for a fraud check."""
    import psycopg2
    from ..config import DATABASE_URL

    try:
        conn = psycopg2.connect(DATABASE_URL)
    except Exception:
        # Demo-friendly: DB may not be available in local/judge environments.
        # Return a clear API error instead of crashing the service.
        raise HTTPException(status_code=503, detail="Database unavailable for fraud explanation lookup")
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT anomaly_score, decision, flags, shap_explanation FROM fraud_checks WHERE id = %s",
            (check_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Fraud check not found")
        return {
            "anomaly_score": float(row[0]),
            "decision": row[1],
            "flags": row[2],
            "shap_explanation": row[3],
        }
    finally:
        conn.close()
