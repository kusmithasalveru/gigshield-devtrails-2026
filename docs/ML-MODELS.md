# GigShield - ML Models Documentation

## Overview

GigShield uses two machine learning models:

| Model | Algorithm | Purpose | Input | Output |
|-------|-----------|---------|-------|--------|
| Fraud Detection | Isolation Forest | Flag anomalous claims | 5 claim features | Anomaly score (0-1) |
| Premium Pricing | XGBoost Regression | Predict weekly risk | 6 zone-worker features | Risk score (0.5-1.5) |

Both models are trained on synthetic data and saved as `.pkl` files in `ml-model/models/`.

---

## Training the Models

### Quick Training (Script)
```bash
# Windows
scripts\train-models.bat

# Linux/Mac
bash scripts/train-models.sh
```

### Interactive Training (Jupyter)
```bash
cd ml-model
pip install jupyter numpy pandas scikit-learn xgboost matplotlib seaborn joblib shap
jupyter notebook
# Open fraud_model.ipynb or pricing_model.ipynb
```

### Output Files
```
ml-model/models/
├── fraud_isolation_forest.pkl   # Trained Isolation Forest model
├── fraud_scaler.pkl             # StandardScaler for fraud features
├── pricing_xgboost.pkl          # Trained XGBoost model
└── pricing_encoders.pkl         # Feature encoder metadata
```

---

## Fraud Detection Model

**File:** `ml-model/fraud_model.ipynb`
**Algorithm:** Isolation Forest (scikit-learn)
**Type:** Unsupervised anomaly detection

### Why Isolation Forest?
- No labeled fraud data available (unsupervised)
- Learns what "normal" looks like, flags deviations
- Fast inference — runs on every payout without slowing the pipeline
- Tree-based structure enables SHAP explainability

### Input Features (5)

| Feature | Type | Normal Range | Anomalous Range | Description |
|---------|------|-------------|-----------------|-------------|
| claims_past_30d | int | 0-4 | 8-15 | Claims filed in last 30 days |
| claim_to_coverage_ratio | float | 0.05-0.6 | 0.8-2.0 | Claims ÷ active coverage weeks |
| gps_distance_km | float | 0-1.5 | 3-10 | GPS distance from trigger zone center |
| time_gap_hours | float | 0-1.5 | 4-12 | Hours between trigger and last activity |
| earnings_match_score | float | 0.7-1.0 | 0.1-0.5 | Self-reported vs zone average earnings |

### Training Data
- **Source:** Synthetic (feature_engineering.py)
- **Size:** ~1,500 claims from 500 workers
- **Anomaly rate:** 5% deliberately injected
- **Anomalous records:** Have 3-5 deviant features simultaneously

### Model Parameters
```python
IsolationForest(
    n_estimators=200,      # Number of isolation trees
    contamination=0.05,    # Expected anomaly proportion
    random_state=42,       # Reproducibility
    n_jobs=-1              # Use all CPU cores
)
```

### Output: Anomaly Score (0 to 1)

| Score Range | Decision | Action |
|-------------|----------|--------|
| 0.00 - 0.74 | auto_approve | Payout processed immediately |
| 0.75 - 0.89 | human_review | Payout held, reviewer notified within 24h |
| 0.90 - 1.00 | hold | Payout blocked, investigation required |

### Score Normalization
Isolation Forest's `decision_function()` returns negative values for anomalies. We normalize:
```python
normalized = 1 - (raw_score - min_score) / (max_score - min_score)
# Result: 0 = normal, 1 = most anomalous
```

### SHAP Explainability
Each flagged record gets a plain-language explanation:
```
"Flagged because: GPS distance 7.2km from trigger zone (typical: under 2km);
 11 claims in past 30 days (typical: 2-3);
 earnings match score 0.2 (typical: 0.8+)"
```

### Performance Metrics
- Evaluated against injected anomaly labels (validation only)
- Expected precision ~80-90% at 0.75 threshold
- Expected recall ~70-80% for true anomalies
- Trade-off: lower threshold catches more fraud but increases false positives

---

## Premium Risk Scoring Model

**File:** `ml-model/pricing_model.ipynb`
**Algorithm:** XGBoost Regression
**Type:** Supervised regression

### Why XGBoost?
- Handles mixed tabular features well
- Trains quickly on small datasets
- Proven standard for insurance risk scoring
- Built-in feature importance for interpretability

### Input Features (6)

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| zone_risk_score | float | 0.3-1.5 | Historical disruption risk for the zone |
| month | int→cyclical | 1-12 | Encoded as sin/cos for seasonality |
| platform_type | categorical | 5 values | One-hot encoded (swiggy, zomato, etc.) |
| worker_account_age_weeks | int | 1-104 | How long the worker has been registered |
| trust_score | int | 10-95 | Worker's current trust score |
| rolling_4week_disruption_freq | float | 0-1+ | Recent disruption frequency in zone |

### Feature Engineering
```python
# Cyclical month encoding (captures seasonal patterns)
month_sin = sin(2π × month / 12)
month_cos = cos(2π × month / 12)

# One-hot encoding for platform type
platform_swiggy, platform_zomato, platform_amazon, platform_zepto, platform_other
```

### Training Data
- **Source:** Synthetic (feature_engineering.py)
- **Size:** 2,600 rows (50 zones × 52 weeks)
- **Target:** weekly_risk_score (0.5-1.5)
- **Target generation:** Formula-based with noise

### Model Parameters
```python
XGBRegressor(
    n_estimators=300,     # Number of boosting rounds
    max_depth=5,          # Tree depth
    learning_rate=0.05,   # Step size
    reg_alpha=0.1,        # L1 regularization
    reg_lambda=1.0,       # L2 regularization
    random_state=42
)
```

### Output: Weekly Risk Score (0.5 to 1.5)

The output feeds directly into the premium pricing formula:
```
Weekly Premium = Base(₹25) × weekly_risk_score × SeasonFactor × LoyaltyDiscount × TierMultiplier
```

### Worked Example: Ravi in August
```
Zone Risk Score:  0.68 (Kukatpally — moderate flood risk)
Month:            August (monsoon peak)
Platform:         Swiggy
Account Age:      8 weeks
Trust Score:      58
Disruption Freq:  0.4 (moderate)

→ Model predicts: weekly_risk_score ≈ 0.72
→ Premium = 25 × 0.72 × 1.30 × 0.95 × 1.4 = ₹31/week
→ Coverage: up to ₹350/event (Standard tier)
```

### Performance Metrics
- **MAE:** ~0.03-0.05 (very accurate for the 0.5-1.5 range)
- **R²:** ~0.85-0.95
- **Top features:** zone_risk_score, month (seasonal), disruption_frequency

---

## Shared Module: feature_engineering.py

**File:** `ml-model/feature_engineering.py`

### Data Generation Functions

| Function | Output | Size |
|----------|--------|------|
| `generate_synthetic_zones(n=50)` | Zone data with cities, risk scores | 50 rows |
| `generate_synthetic_workers(n=500)` | Worker profiles with Indian names | 500 rows |
| `generate_synthetic_events(n=300)` | Disruption events (monsoon-weighted) | 300 rows |
| `generate_synthetic_claims(...)` | Fraud training data (5% anomalous) | ~1,500 rows |
| `generate_pricing_training_data(...)` | Zone-week pricing data | ~2,600 rows |

### Preprocessing Functions

| Function | Purpose |
|----------|---------|
| `prepare_fraud_features(claims_df)` | Select 5 features, StandardScaler |
| `prepare_pricing_features(pricing_df)` | One-hot encode, cyclical month, scale |
| `normalize_anomaly_scores(raw_scores)` | Isolation Forest → 0-1 range |
| `generate_shap_explanation(shap_values)` | Plain-language SHAP explanation |

### Synthetic Data Design

**Indian Names:** 48 first names × 30 last names from common Indian names.

**City Distribution:** Hyderabad 40%, Delhi 30%, Bangalore 30% — with realistic lat/lng bounds.

**Language Distribution:** Telugu 30%, Hindi 25%, Tamil 15%, Kannada 10%, Others 20%.

**Monsoon Weighting:** June-September events = 60% of total. Realistic seasonal distribution.

**Anomaly Injection:** 5% of claims deliberately anomalous with:
- High claim frequency (8-15 vs normal 0-4)
- Far GPS distance (3-10km vs normal 0-1.5km)
- Large time gaps (4-12h vs normal 0-1.5h)
- Low earnings match (0.1-0.5 vs normal 0.7-1.0)

All functions use `seed=42` for reproducibility.

---

## Model Deployment

### In Fraud Engine (Production)
```python
# backend/fraud-engine/src/services/ml_inference.py

# Load on startup
model = joblib.load('models/fraud_isolation_forest.pkl')
scaler = joblib.load('models/fraud_scaler.pkl')

# Inference per claim (~1ms)
features = np.array([[claims, ratio, distance, time_gap, earnings_match]])
scaled = scaler.transform(features)
raw_score = model.decision_function(scaled)[0]
normalized_score = normalize(raw_score)  # 0-1
```

### Fallback
If `.pkl` files are not found, the system uses a **heuristic scoring fallback** — rule-based scoring that approximates the ML model's behavior using simple thresholds. This ensures the fraud engine always works, even without trained models.
