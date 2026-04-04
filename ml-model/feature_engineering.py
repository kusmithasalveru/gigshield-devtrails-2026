
"""
GigShield ML Feature Engineering Module
Shared utilities for synthetic data generation and feature preparation.
Used by both fraud_model.ipynb and pricing_model.ipynb.
"""
import uuid
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# --- Indian Names for Synthetic Data ---
FIRST_NAMES = [
    "Ravi", "Arjun", "Vikram", "Suresh", "Ramesh", "Venkat", "Srinivas", "Anil",
    "Rajesh", "Ganesh", "Manoj", "Deepak", "Sanjay", "Kiran", "Prasad", "Mohan",
    "Amit", "Rahul", "Vijay", "Ashok", "Naveen", "Harish", "Satish", "Sunil",
    "Krishna", "Kumar", "Raju", "Mahesh", "Dinesh", "Naresh", "Gopal", "Shiva",
    "Ajay", "Pavan", "Srikanth", "Murali", "Chandra", "Bala", "Lakshman", "Ram",
    "Surya", "Varun", "Akhil", "Nikhil", "Rohit", "Sachin", "Pradeep", "Santosh"
]
LAST_NAMES = [
    "Shankar", "Kumar", "Reddy", "Rao", "Singh", "Sharma", "Patel", "Gupta",
    "Verma", "Yadav", "Shah", "Nair", "Pillai", "Das", "Joshi", "Mishra",
    "Iyer", "Naidu", "Devi", "Bhat", "Hegde", "Kulkarni", "Patil", "Desai",
    "Menon", "Agarwal", "Pandey", "Dubey", "Tiwari", "Chauhan"
]

CITIES = {
    "Hyderabad": {"lat_range": (17.35, 17.55), "lng_range": (78.30, 78.55)},
    "Delhi": {"lat_range": (28.50, 28.75), "lng_range": (77.10, 77.35)},
    "Bangalore": {"lat_range": (12.85, 13.05), "lng_range": (77.50, 77.70)},
}


def generate_synthetic_zones(n_zones=50, seed=42):
    """Generate synthetic zone data for Indian cities."""
    rng = np.random.RandomState(seed)

    zones = []
    city_names = list(CITIES.keys())
    city_weights = [0.4, 0.3, 0.3]  # Hyderabad 40%, Delhi 30%, Bangalore 30%

    for i in range(n_zones):
        city = rng.choice(city_names, p=city_weights)
        bounds = CITIES[city]
        lat = rng.uniform(*bounds["lat_range"])
        lng = rng.uniform(*bounds["lng_range"])
        prefix = city[:3].upper()
        grid_x, grid_y = int((lat - bounds["lat_range"][0]) * 100), int((lng - bounds["lng_range"][0]) * 100)

        risk_score = np.clip(rng.beta(2, 3) * 1.8 + 0.3, 0.3, 1.5)
        flood_freq = risk_score * rng.uniform(5, 12)
        disruption_days = risk_score * rng.uniform(3, 9)

        zones.append({
            "zone_id": str(uuid.uuid4()),
            "city": city,
            "grid_cell": f"{prefix}-{grid_x:02d}-{grid_y:02d}",
            "lat": round(lat, 4),
            "lng": round(lng, 4),
            "risk_score": round(risk_score, 2),
            "flood_frequency": round(flood_freq, 1),
            "disruption_days_per_month": round(disruption_days, 1),
        })

    return pd.DataFrame(zones)


def generate_synthetic_workers(n_workers=500, zones_df=None, seed=42):
    """Generate synthetic worker profiles."""
    rng = np.random.RandomState(seed)
    if zones_df is None:
        zones_df = generate_synthetic_zones(seed=seed)

    languages = ["te", "hi", "ta", "kn", "ml", "bn", "mr", "en"]
    lang_weights = [0.30, 0.25, 0.15, 0.10, 0.05, 0.05, 0.05, 0.05]
    platforms = ["swiggy", "zomato", "amazon", "zepto", "other"]
    platform_weights = [0.40, 0.35, 0.10, 0.10, 0.05]

    workers = []
    for _ in range(n_workers):
        fname = rng.choice(FIRST_NAMES)
        lname = rng.choice(LAST_NAMES)
        phone = f"9{rng.randint(100000000, 999999999)}"
        zone = zones_df.iloc[rng.randint(len(zones_df))]
        upi_suffix = rng.choice(["@paytm", "@phonepe", "@gpay", "@ybl"])

        workers.append({
            "worker_id": str(uuid.uuid4()),
            "name": f"{fname} {lname}",
            "phone": phone,
            "language": rng.choice(languages, p=lang_weights),
            "platform": rng.choice(platforms, p=platform_weights),
            "zone_id": zone["zone_id"],
            "upi_id": f"{phone}{upi_suffix}",
            "trust_score": int(np.clip(rng.normal(55, 15), 10, 95)),
            "account_age_weeks": rng.randint(1, 105),
            "avg_weekly_earnings": int(np.clip(rng.normal(4500, 1200), 1500, 9000)),
        })

    return pd.DataFrame(workers)


def generate_synthetic_events(n_events=300, zones_df=None, seed=42):
    """Generate synthetic disruption events weighted toward monsoon season."""
    rng = np.random.RandomState(seed)
    if zones_df is None:
        zones_df = generate_synthetic_zones(seed=seed)

    event_types = ["heavy_rain", "moderate_rain", "severe_pollution", "extreme_heat", "flash_flood", "strike"]
    type_weights = [0.35, 0.20, 0.15, 0.15, 0.10, 0.05]
    severity_map = {"heavy_rain": "HIGH", "moderate_rain": "MEDIUM", "severe_pollution": "HIGH",
                    "extreme_heat": "MEDIUM", "flash_flood": "HIGH", "strike": "HIGH"}

    # Weight toward high-risk zones
    risk_scores = zones_df["risk_score"].values
    zone_probs = risk_scores / risk_scores.sum()

    events = []
    for _ in range(n_events):
        zone_idx = rng.choice(len(zones_df), p=zone_probs)
        zone = zones_df.iloc[zone_idx]
        event_type = rng.choice(event_types, p=type_weights)

        # Monsoon-weighted month (June-Sept = 60%)
        month_weights = [0.03, 0.03, 0.04, 0.05, 0.05, 0.15, 0.15, 0.15, 0.15, 0.08, 0.06, 0.06]
        month = rng.choice(range(1, 13), p=month_weights)
        day = rng.randint(1, 29)
        hour = rng.randint(6, 22)
        duration = rng.randint(30, 360)

        trigger_data = _generate_trigger_data(event_type, rng)

        events.append({
            "event_id": str(uuid.uuid4()),
            "zone_id": zone["zone_id"],
            "event_type": event_type,
            "severity": severity_map[event_type],
            "trigger_data": trigger_data,
            "start_time": f"2025-{month:02d}-{day:02d}T{hour:02d}:00:00Z",
            "duration_minutes": duration,
        })

    return pd.DataFrame(events)


def _generate_trigger_data(event_type, rng):
    if event_type in ("heavy_rain", "moderate_rain"):
        return {"precipitation_mm": round(rng.uniform(7, 35), 1)}
    elif event_type == "severe_pollution":
        return {"aqi_pm25": int(rng.uniform(301, 500))}
    elif event_type == "extreme_heat":
        return {"apparent_temperature_c": round(rng.uniform(44, 50), 1)}
    elif event_type == "flash_flood":
        return {"flood_warning": True, "source": "IMD"}
    else:
        return {"event": "strike", "source": "news"}


def generate_synthetic_claims(workers_df, events_df, zones_df, anomaly_rate=0.05, seed=42):
    """
    Generate fraud detection training data.
    ~5% of records are deliberately anomalous.
    """
    rng = np.random.RandomState(seed)
    n_claims = len(workers_df) * 3  # ~3 claims per worker average

    claims = []
    for i in range(n_claims):
        worker = workers_df.iloc[rng.randint(len(workers_df))]
        event = events_df.iloc[rng.randint(len(events_df))]
        is_anomalous = rng.random() < anomaly_rate

        if is_anomalous:
            claims_past_30d = rng.randint(8, 16)
            claim_ratio = round(rng.uniform(0.8, 2.0), 2)
            gps_distance = round(rng.uniform(3, 10), 2)
            time_gap = round(rng.uniform(4, 12), 1)
            earnings_match = round(rng.uniform(0.1, 0.5), 2)
        else:
            claims_past_30d = rng.randint(0, 5)
            claim_ratio = round(rng.uniform(0.05, 0.6), 2)
            gps_distance = round(rng.uniform(0, 1.5), 2)
            time_gap = round(rng.uniform(0, 1.5), 1)
            earnings_match = round(rng.uniform(0.7, 1.0), 2)

        claims.append({
            "worker_id": worker["worker_id"],
            "event_id": event["event_id"],
            "claims_past_30d": claims_past_30d,
            "claim_to_coverage_ratio": claim_ratio,
            "gps_distance_km": gps_distance,
            "time_gap_hours": time_gap,
            "earnings_match_score": earnings_match,
            "is_anomalous": is_anomalous,
        })

    return pd.DataFrame(claims)


def generate_pricing_training_data(zones_df, n_weeks=52, seed=42):
    """Generate zone-week level data for premium risk scoring model."""
    rng = np.random.RandomState(seed)
    platforms = ["swiggy", "zomato", "amazon", "zepto", "other"]

    rows = []
    for _, zone in zones_df.iterrows():
        for week in range(n_weeks):
            month = (week // 4) % 12 + 1

            # Season factor
            if 6 <= month <= 9:
                season = 1.30
            elif month in (10, 11):
                season = 1.10
            else:
                season = 0.85

            disruption_freq = max(0, zone["disruption_days_per_month"] / 30 * 4 + rng.normal(0, 0.1))

            # Target: weekly risk score with formula-based generation + noise
            base_risk = (0.3 * zone["risk_score"] + 0.15 * (season - 0.85) / 0.45 +
                         0.1 * disruption_freq + rng.normal(0, 0.05))
            weekly_risk = np.clip(base_risk + 0.5, 0.5, 1.5)

            rows.append({
                "zone_id": zone["zone_id"],
                "zone_risk_score": zone["risk_score"],
                "month": month,
                "platform_type": rng.choice(platforms),
                "worker_account_age_weeks": rng.randint(1, 105),
                "trust_score": int(rng.normal(55, 15)),
                "rolling_4week_disruption_freq": round(disruption_freq, 3),
                "weekly_risk_score": round(weekly_risk, 3),
            })

    return pd.DataFrame(rows)


def prepare_fraud_features(claims_df):
    """Select and scale the 5 fraud features."""
    feature_cols = ["claims_past_30d", "claim_to_coverage_ratio",
                    "gps_distance_km", "time_gap_hours", "earnings_match_score"]
    X = claims_df[feature_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, scaler


def prepare_pricing_features(pricing_df):
    """Encode and scale pricing features."""
    df = pricing_df.copy()

    # Cyclical encoding for month
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

    # One-hot encode platform
    df = pd.get_dummies(df, columns=["platform_type"], prefix="platform")

    # Drop non-feature columns
    drop_cols = ["zone_id", "month", "weekly_risk_score"]
    feature_cols = [c for c in df.columns if c not in drop_cols]

    encoders = {"feature_columns": feature_cols}
    return df[feature_cols], df["weekly_risk_score"] if "weekly_risk_score" in pricing_df.columns else None, encoders


def normalize_anomaly_scores(raw_scores):
    """Convert Isolation Forest decision_function output to 0-1 range."""
    # More negative = more anomalous in Isolation Forest
    min_score = raw_scores.min()
    max_score = raw_scores.max()
    if max_score == min_score:
        return np.zeros_like(raw_scores)
    normalized = 1 - (raw_scores - min_score) / (max_score - min_score)
    return np.clip(normalized, 0, 1)


def generate_shap_explanation(shap_values, feature_names, threshold=0.75):
    """Generate a plain-language explanation from SHAP values."""
    abs_shap = np.abs(shap_values)
    top_indices = np.argsort(abs_shap)[::-1][:3]

    reasons = []
    for idx in top_indices:
        name = feature_names[idx]
        impact = "increases" if shap_values[idx] > 0 else "decreases"
        reasons.append(f"{name} {impact} risk (impact: {abs_shap[idx]:.3f})")

    return "Flagged because: " + "; ".join(reasons)
