"""
ML Inference Service — Load and run Isolation Forest fraud model.
"""
import os
import numpy as np

# Global model references
_model = None
_scaler = None

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "ml-model", "models")


def load_models():
    """Load pre-trained Isolation Forest model and scaler from .pkl files."""
    global _model, _scaler

    model_path = os.path.join(MODEL_DIR, "fraud_isolation_forest.pkl")
    scaler_path = os.path.join(MODEL_DIR, "fraud_scaler.pkl")

    try:
        import joblib
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            _model = joblib.load(model_path)
            _scaler = joblib.load(scaler_path)
            print(f"[ML] Loaded fraud model from {model_path}")
        else:
            print(f"[ML] Model files not found at {MODEL_DIR}, using heuristic scoring")
    except Exception as e:
        print(f"[ML] Error loading models: {e}, using heuristic scoring")


def predict_fraud_score(claims_past_30d, claim_to_coverage_ratio,
                        gps_distance_km, time_gap_hours, earnings_match_score):
    """
    Predict fraud anomaly score (0 to 1).
    0 = normal, 1 = highly anomalous.

    If ML model is loaded, uses Isolation Forest.
    Otherwise, falls back to heuristic scoring.
    """
    features = np.array([[
        claims_past_30d,
        claim_to_coverage_ratio,
        gps_distance_km,
        time_gap_hours,
        earnings_match_score
    ]])

    if _model is not None and _scaler is not None:
        # Use trained model
        scaled = _scaler.transform(features)
        raw_score = _model.decision_function(scaled)[0]
        # Normalize: Isolation Forest returns negative scores for anomalies
        # More negative = more anomalous. Convert to 0-1 where 1 = most anomalous
        normalized = 1 - (raw_score - (-0.5)) / (0.5 - (-0.5))
        return float(np.clip(normalized, 0, 1))
    else:
        # Heuristic fallback
        return _heuristic_score(claims_past_30d, claim_to_coverage_ratio,
                                gps_distance_km, time_gap_hours, earnings_match_score)


def _heuristic_score(claims, ratio, distance, time_gap, earnings_match):
    """Simple rule-based scoring when ML model is not available."""
    score = 0.0

    # High claims frequency
    if claims > 8:
        score += 0.3
    elif claims > 5:
        score += 0.15

    # High claim-to-coverage ratio
    if ratio > 0.8:
        score += 0.25
    elif ratio > 0.5:
        score += 0.1

    # Far from trigger zone
    if distance > 5:
        score += 0.25
    elif distance > 2:
        score += 0.15

    # Long time gap
    if time_gap > 6:
        score += 0.2
    elif time_gap > 3:
        score += 0.1

    # Low earnings match
    if earnings_match < 0.3:
        score += 0.15
    elif earnings_match < 0.5:
        score += 0.05

    return min(score, 1.0)
