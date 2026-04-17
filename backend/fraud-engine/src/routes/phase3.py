"""
Phase 3: simulation + dashboards (demo-friendly).

These endpoints are intentionally resilient: if PostgreSQL/PostGIS isn't
configured, they fall back to mock data so Swagger + hackathon demos keep working.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import psycopg2
from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..config import DATABASE_URL
from ..services.fraud_service import run_fraud_check
from .payout import process_payout as process_payout_endpoint
from .payout import ProcessPayoutRequest

router = APIRouter()


class SimulateEventRequest(BaseModel):
    worker_id: str
    gps_lat: float
    gps_lng: float

    # Disruption inputs
    event_kind: str = "rain"  # "rain" | "pollution"
    severity: str = "HIGH"  # "HIGH" | "MEDIUM"
    disrupted_hours: float = 2.0

    # Fraud inputs (same shape as /m1/fraud/score)
    last_activity_hours_ago: float = 0.5
    claims_past_30d: int = 1
    claim_to_coverage_ratio: float = 0.3
    earnings_match_score: float = 0.85


def _event_type_from_kind(event_kind: str) -> str:
    kind = (event_kind or "").lower()
    return "heavy_rain" if kind == "rain" else "severe_pollution"


def _trigger_values_for_event(event_type: str) -> dict:
    if event_type == "heavy_rain":
        return {"trigger_value": 22.5, "threshold_value": 15.0}
    if event_type == "severe_pollution":
        return {"trigger_value": 320.0, "threshold_value": 300.0}
    # Safe default
    return {"trigger_value": 10.0, "threshold_value": 5.0}


def _event_hash(zone_id: str, event_type: str, ts: datetime) -> str:
    # Hour bucket dedupe so repeated demos don't spam DB with duplicates.
    bucket = ts.replace(minute=0, second=0, microsecond=0).isoformat()
    payload = f"{zone_id}:{event_type}:{bucket}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@router.post("/simulate-event")
async def simulate_event(req: SimulateEventRequest):
    """
    Simulate an incoming parametric trigger (rain/pollution),
    run fraud checks, then initiate payout.
    """

    disrupted_hours = float(req.disrupted_hours or 2.0)
    severity = (req.severity or "HIGH").upper()
    disrupted_hours = max(disrupted_hours, 0.0)

    event_type = _event_type_from_kind(req.event_kind)
    duration_minutes = int(round(disrupted_hours * 60))
    duration_minutes = max(duration_minutes, 1)

    # Create/identify the event.
    event_id = str(uuid4())
    zone_id = None
    start_time = datetime.now(timezone.utc)

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Try to infer zone_id and create a real disruption_event row.
        cur.execute(
            """
            SELECT w.zone_id
            FROM workers w
            WHERE w.id = %s
            LIMIT 1
            """,
            (req.worker_id,),
        )
        row = cur.fetchone()
        zone_id = row[0] if row else None

        if zone_id:
            trig = _trigger_values_for_event(event_type)
            event_hash = _event_hash(str(zone_id), event_type, start_time)

            # Insert. If it already exists, we still proceed using the generated id.
            # (For demo robustness we keep it best-effort.)
            cur.execute(
                """
                INSERT INTO disruption_events (
                    id, event_hash, zone_id, event_type, severity, trigger_data,
                    trigger_value, threshold_value, duration_minutes, disrupted_hours,
                    source, start_time, end_time
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (event_hash) DO NOTHING
                """,
                (
                    event_id,
                    event_hash,
                    zone_id,
                    event_type,
                    severity,
                    json.dumps({"simulated": True, "kind": req.event_kind}),
                    float(trig["trigger_value"]),
                    float(trig["threshold_value"]),
                    duration_minutes,
                    disrupted_hours,
                    "simulate-event",
                    start_time,
                    start_time + timedelta(minutes=duration_minutes),
                ),
            )
            conn.commit()

            # If the insert was skipped due to event_hash conflict,
            # ensure we use the existing disruption_event id.
            cur.execute(
                "SELECT id FROM disruption_events WHERE event_hash = %s LIMIT 1",
                (event_hash,),
            )
            existing = cur.fetchone()
            if existing and existing[0]:
                event_id = str(existing[0])
        cur.close()
        conn.close()
    except Exception:
        # DB not configured — keep event_id as UUID and proceed with mock payout.
        zone_id = None

    # Ensure an active policy exists (so the existing payout pipeline can persist payouts).
    # Best-effort only: if it fails, the payout endpoint will gracefully fall back.
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id
            FROM policies
            WHERE worker_id = %s
              AND status = 'active'
              AND end_date >= CURRENT_DATE
            LIMIT 1
            """,
            (req.worker_id,),
        )
        has_policy = cur.fetchone() is not None
        if not has_policy:
            # Demo-safe defaults for standard tier.
            # coverage_limit is required by the payout formula.
            cur.execute(
                """
                INSERT INTO policies (
                    worker_id, tier, premium, coverage_limit,
                    zone_risk_score, season_factor, loyalty_discount,
                    start_date, end_date, status
                )
                VALUES (
                    %s, 'standard', 30, 350,
                    1.0, 1.1, 1.0,
                    CURRENT_DATE, (CURRENT_DATE + INTERVAL '7 days')::date, 'active'
                )
                RETURNING id
                """,
                (req.worker_id,),
            )
            conn.commit()
        cur.close()
        conn.close()
    except Exception:
        pass

    # 1) Fraud check (for response)
    fraud_result = run_fraud_check(
        worker_id=req.worker_id,
        event_id=event_id,
        gps_lat=req.gps_lat,
        gps_lng=req.gps_lng,
        last_activity_hours_ago=req.last_activity_hours_ago,
        claims_past_30d=req.claims_past_30d,
        claim_to_coverage_ratio=req.claim_to_coverage_ratio,
        earnings_match_score=req.earnings_match_score,
    )

    # 2) Persist payout + fraud_check via the existing payout pipeline
    payout_res = await process_payout_endpoint(
        ProcessPayoutRequest(
            event_id=event_id,
            worker_id=req.worker_id,
            gps_lat=req.gps_lat,
            gps_lng=req.gps_lng,
        )
    )

    return {
        "event_id": str(event_id),
        "event_type": event_type,
        "fraud": fraud_result,
        "payout": payout_res,
    }


@router.get("/dashboard/worker")
async def dashboard_worker(worker_id: str = Query(default="")):
    """
    Worker dashboard:
    - earnings protected (completed payouts)
    - claim status
    - risk score (from fraud_checks anomaly_score)
    """

    if not worker_id:
        # Demo-safe default (frontend can pass auth user id when wired to backend).
        worker_id = "b2000001-0000-0000-0000-000000000001"

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Active coverage
        cur.execute(
            """
            SELECT EXISTS(
                SELECT 1 FROM policies
                WHERE worker_id = %s
                  AND status = 'active'
                  AND end_date >= CURRENT_DATE
            )
            """,
            (worker_id,),
        )
        active = bool(cur.fetchone()[0])

        # Payout summary
        cur.execute(
            """
            SELECT status, COUNT(*)::int as cnt, COALESCE(SUM(amount),0)::numeric as sum_amt
            FROM payouts
            WHERE worker_id = %s
            GROUP BY status
            """,
            (worker_id,),
        )
        payout_rows = cur.fetchall()
        by_status = {r[0]: {"count": int(r[1]), "sum": float(r[2])} for r in payout_rows}
        earnings_protected = float(by_status.get("completed", {}).get("sum", 0.0))

        claim_status = {
            "total": int(sum(r["count"] for r in by_status.values())),
            "completed": int(by_status.get("completed", {}).get("count", 0)),
            "held": int(by_status.get("held", {}).get("count", 0)),
        }

        # Risk score from recent fraud checks
        cur.execute(
            """
            SELECT anomaly_score, decision, created_at
            FROM fraud_checks
            WHERE worker_id = %s
            ORDER BY created_at DESC
            LIMIT 20
            """,
            (worker_id,),
        )
        fraud_rows = cur.fetchall()
        if fraud_rows:
            anomaly_scores = [float(r[0]) for r in fraud_rows]
            avg_anomaly = sum(anomaly_scores) / len(anomaly_scores)
            risk_score = int(max(0, min(100, round(avg_anomaly * 100))))
            # small chart series: last 7 checks, newest last
            series_raw = list(reversed(anomaly_scores[-7:]))
            risk_score_series = [{"label": f"R{i+1}", "value": int(round(v * 100))} for i, v in enumerate(series_raw)]
        else:
            risk_score = 32
            risk_score_series = [{"label": "R1", "value": 28}, {"label": "R2", "value": 31}, {"label": "R3", "value": 34}]

        cur.close()
        conn.close()
        return {
            "earnings_protected": earnings_protected,
            "active_coverage": active,
            "claim_status": claim_status,
            "risk_score": risk_score,
            "risk_score_series": risk_score_series,
        }
    except Exception:
        # Fallback demo values
        return {
            "earnings_protected": 280,
            "active_coverage": True,
            "claim_status": {"total": 5, "completed": 3, "held": 2},
            "risk_score": 41,
            "risk_score_series": [
                {"label": "R1", "value": 34},
                {"label": "R2", "value": 38},
                {"label": "R3", "value": 41},
                {"label": "R4", "value": 39},
            ],
        }


@router.get("/dashboard/admin")
async def dashboard_admin():
    """
    Admin dashboard:
    - fraud rate
    - payouts totals
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Fraud rate
        cur.execute(
            """
            SELECT COUNT(*)::int,
                   SUM(CASE WHEN decision IN ('hold','human_review') THEN 1 ELSE 0 END)::int
            FROM fraud_checks
            """
        )
        total, flagged = cur.fetchone()
        fraud_rate = float(flagged / total) if total else 0.0

        # Payout summary
        cur.execute(
            """
            SELECT status, COUNT(*)::int as cnt, COALESCE(SUM(amount),0)::numeric as sum_amt
            FROM payouts
            GROUP BY status
            """
        )
        payout_rows = cur.fetchall()
        by_status = {r[0]: {"count": int(r[1]), "sum": float(r[2])} for r in payout_rows}

        payouts_total = float(sum(v["sum"] for v in by_status.values())) if by_status else 0.0
        payouts_completed = float(by_status.get("completed", {}).get("sum", 0.0))
        payouts_held = float(by_status.get("held", {}).get("sum", 0.0))

        cur.close()
        conn.close()

        return {
            "fraud_rate": fraud_rate,
            "payouts_total": payouts_total,
            "payouts_completed": payouts_completed,
            "payouts_held": payouts_held,
        }
    except Exception:
        return {
            "fraud_rate": 0.22,
            "payouts_total": 574.0,
            "payouts_completed": 420.0,
            "payouts_held": 154.0,
        }

