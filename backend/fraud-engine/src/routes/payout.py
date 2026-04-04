"""Payout processing routes."""
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import psycopg2
from ..config import DATABASE_URL
from ..services.fraud_service import run_fraud_check
from ..services.razorpay_service import initiate_payout
from ..services.notification_service import send_payout_notification

router = APIRouter()


class ProcessPayoutRequest(BaseModel):
    event_id: str
    worker_id: str
    gps_lat: float
    gps_lng: float


@router.post("/process-payout")
async def process_payout(request: ProcessPayoutRequest):
    """
    End-to-end payout processing:
    1. Fetch worker + policy data
    2. Run 5-layer fraud check
    3. Calculate payout amount
    4. Initiate Razorpay transfer
    5. Send notification
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()

        # 1. Fetch worker, active policy, and event
        cur.execute(
            """SELECT w.id, w.name, w.phone, w.language, w.upi_id, w.avg_weekly_earnings, w.trust_score,
                      p.id as policy_id, p.tier, p.coverage_limit,
                      de.event_type, de.severity, de.disrupted_hours
               FROM workers w
               JOIN policies p ON p.worker_id = w.id AND p.status = 'active' AND p.end_date >= CURRENT_DATE
               JOIN disruption_events de ON de.id = %s
               WHERE w.id = %s
               LIMIT 1""",
            (request.event_id, request.worker_id),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Worker, active policy, or event not found")

        columns = ["id", "name", "phone", "language", "upi_id", "avg_weekly_earnings", "trust_score",
                    "policy_id", "tier", "coverage_limit", "event_type", "severity", "disrupted_hours"]
        worker_data = dict(zip(columns, row))

        # 2. Run fraud check
        fraud_result = run_fraud_check(
            worker_id=request.worker_id,
            event_id=request.event_id,
            gps_lat=request.gps_lat,
            gps_lng=request.gps_lng,
        )

        # 3. Calculate payout
        daily_earnings = float(worker_data["avg_weekly_earnings"]) / 6  # 6 working days
        disrupted_hours = float(worker_data["disrupted_hours"] or 2)
        severity_factor = 1.0 if worker_data["severity"] == "HIGH" else 0.6
        coverage_limit = float(worker_data["coverage_limit"])

        hourly_rate = daily_earnings / 10
        raw_payout = hourly_rate * min(disrupted_hours, 4) * severity_factor
        payout_amount = min(round(raw_payout, 2), coverage_limit)

        # Determine payout status based on fraud result
        payout_status = "initiated"
        if fraud_result["decision"] == "hold":
            payout_status = "held"
        elif fraud_result["decision"] == "human_review":
            payout_status = "held"

        # 4. Insert payout record
        cur.execute(
            """INSERT INTO payouts (worker_id, policy_id, event_id, amount, severity_factor,
                                     disrupted_hours, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (worker_id, event_id) DO NOTHING
               RETURNING id""",
            (request.worker_id, worker_data["policy_id"], request.event_id,
             payout_amount, severity_factor, disrupted_hours, payout_status),
        )
        payout_row = cur.fetchone()
        if not payout_row:
            raise HTTPException(status_code=409, detail="Payout already exists for this worker and event")

        payout_id = payout_row[0]

        # Save fraud check record
        cur.execute(
            """INSERT INTO fraud_checks (payout_id, worker_id, event_id, anomaly_score, flags,
                                          shap_explanation, decision)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (payout_id, request.worker_id, request.event_id,
             fraud_result["anomaly_score"], json.dumps(fraud_result["flags"]),
             fraud_result.get("shap_explanation"), fraud_result["decision"]),
        )
        conn.commit()

        # 5. Initiate payout if approved
        razorpay_ref = None
        if payout_status == "initiated":
            razorpay_ref = initiate_payout(
                upi_id=worker_data["upi_id"],
                amount=payout_amount,
                worker_name=worker_data["name"],
            )
            if razorpay_ref:
                cur.execute(
                    "UPDATE payouts SET status = 'completed', upi_txn_id = %s, completed_at = NOW() WHERE id = %s",
                    (razorpay_ref, payout_id),
                )
                conn.commit()

            # Send notification
            send_payout_notification(
                phone=worker_data["phone"],
                language=worker_data["language"],
                amount=payout_amount,
                event_type=worker_data["event_type"],
            )

            # Update trust score
            cur.execute(
                "UPDATE workers SET trust_score = LEAST(trust_score + 2, 100) WHERE id = %s",
                (request.worker_id,),
            )
            cur.execute(
                """INSERT INTO trust_score_log (worker_id, action, score_change, new_score)
                   SELECT %s, 'Successful validated claim', 2, trust_score FROM workers WHERE id = %s""",
                (request.worker_id, request.worker_id),
            )
            conn.commit()

        return {
            "payout_id": str(payout_id),
            "amount": payout_amount,
            "status": payout_status if payout_status == "held" else "completed",
            "fraud_decision": fraud_result["decision"],
            "fraud_score": fraud_result["anomaly_score"],
            "razorpay_ref": razorpay_ref,
        }
    finally:
        conn.close()
