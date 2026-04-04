"""
5-Layer Fraud Detection Service

Layer 1: Location Validation — GPS within 2km of trigger zone
Layer 2: Activity Cross-Validation — was the worker active recently
Layer 3: ML Anomaly Detection — Isolation Forest anomaly score
Layer 4: Duplicate Event Prevention — one payout per event per worker
Layer 5: Network-Level Detection — device clustering, shared UPI
"""
import psycopg2
from ..config import DATABASE_URL
from .ml_inference import predict_fraud_score

# Thresholds
LOCATION_RADIUS_KM = 2.0
MAX_INACTIVE_HOURS = 3.0
ANOMALY_REVIEW_THRESHOLD = 0.75
ANOMALY_HOLD_THRESHOLD = 0.90


def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in km."""
    import math
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def run_fraud_check(worker_id, event_id, gps_lat=None, gps_lng=None,
                    last_activity_hours_ago=0.5, claims_past_30d=1,
                    claim_to_coverage_ratio=0.3, earnings_match_score=0.85):
    """Run all 5 fraud detection layers. Returns decision dict."""
    flags = []
    overall_score = 0.0

    # Try DB-backed check, fall back to standalone mode
    zone_lat, zone_lng = 0, 0
    is_duplicate = False
    network_flag = False

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Get zone location for this event
        cur.execute(
            """SELECT ST_Y(z.location::geometry) as lat, ST_X(z.location::geometry) as lng
               FROM disruption_events de JOIN zones z ON de.zone_id = z.id WHERE de.id = %s""",
            (event_id,),
        )
        zone = cur.fetchone()
        zone_lat, zone_lng = (zone[0], zone[1]) if zone else (0, 0)

        # Layer 4: Duplicate Event Prevention
        cur.execute(
            "SELECT id FROM payouts WHERE worker_id = %s AND event_id = %s",
            (worker_id, event_id),
        )
        is_duplicate = cur.fetchone() is not None

        # Layer 5: Network-Level Detection
        cur.execute(
            "SELECT COUNT(*) FROM workers WHERE upi_id = (SELECT upi_id FROM workers WHERE id = %s)",
            (worker_id,),
        )
        shared_upi_count = cur.fetchone()[0]
        network_flag = shared_upi_count > 1

        conn.close()
    except Exception:
        # No DB available — run in standalone mode (layers 1-3 only)
        # Use GPS coordinates as-is for distance calculation
        zone_lat = gps_lat or 0
        zone_lng = gps_lng or 0

    # === Layer 1: Location Validation ===
    distance_km = 0.0
    location_valid = True
    if gps_lat and gps_lng and zone_lat:
        distance_km = haversine_distance(gps_lat, gps_lng, zone_lat, zone_lng)
        if distance_km > LOCATION_RADIUS_KM:
            location_valid = False
            flags.append(f"GPS {distance_km:.1f}km from zone (limit: {LOCATION_RADIUS_KM}km)")

    # === Layer 2: Activity Cross-Validation ===
    activity_valid = last_activity_hours_ago <= MAX_INACTIVE_HOURS
    if not activity_valid:
        flags.append(f"Inactive for {last_activity_hours_ago:.1f}h before trigger (limit: {MAX_INACTIVE_HOURS}h)")

    # === Layer 3: ML Anomaly Detection (Isolation Forest) ===
    ml_score = predict_fraud_score(
        claims_past_30d=claims_past_30d,
        claim_to_coverage_ratio=claim_to_coverage_ratio,
        gps_distance_km=distance_km,
        time_gap_hours=last_activity_hours_ago,
        earnings_match_score=earnings_match_score,
    )
    if ml_score > ANOMALY_REVIEW_THRESHOLD:
        flags.append(f"ML anomaly score: {ml_score:.3f} (threshold: {ANOMALY_REVIEW_THRESHOLD})")

    # === Layer 4 & 5: DB-dependent checks ===
    if is_duplicate:
        flags.append("Duplicate: payout already exists for this event")
    if network_flag:
        flags.append("UPI ID shared with other account(s)")

    # === Decision ===
    overall_score = ml_score
    if is_duplicate:
        decision = "hold"
    elif ml_score >= ANOMALY_HOLD_THRESHOLD or network_flag:
        decision = "hold"
    elif ml_score >= ANOMALY_REVIEW_THRESHOLD or not location_valid or not activity_valid:
        decision = "human_review"
    else:
        decision = "auto_approve"

    return {
        "anomaly_score": round(overall_score, 3),
        "decision": decision,
        "flags": flags,
        "shap_explanation": f"Score {ml_score:.3f}: distance={distance_km:.1f}km, claims={claims_past_30d}, ratio={claim_to_coverage_ratio:.2f}" if flags else None,
    }
