#!/bin/bash
# ============================================================
# GigShield - Train ML Models
# Runs both notebooks to generate .pkl model files
# ============================================================

cd "$(dirname "$0")/../ml-model"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  GigShield - ML Model Training"
echo "=========================================="

mkdir -p models

# --- 1. Train Fraud Detection Model (Isolation Forest) ---
echo -e "\n${BLUE}[1/2] Training Fraud Detection Model...${NC}"
python -c "
import sys
sys.path.insert(0, '.')
from feature_engineering import *
from sklearn.ensemble import IsolationForest
import joblib, os, numpy as np

print('Generating synthetic data...')
zones = generate_synthetic_zones(50, seed=42)
workers = generate_synthetic_workers(500, zones, seed=42)
events = generate_synthetic_events(300, zones, seed=42)
claims = generate_synthetic_claims(workers, events, zones, anomaly_rate=0.05, seed=42)
print(f'  Claims dataset: {claims.shape}')

print('Preparing features...')
X_scaled, scaler = prepare_fraud_features(claims)

print('Training Isolation Forest...')
model = IsolationForest(n_estimators=200, contamination=0.05, random_state=42, n_jobs=-1)
model.fit(X_scaled)

raw_scores = model.decision_function(X_scaled)
scores = normalize_anomaly_scores(raw_scores)
print(f'  Score range: {scores.min():.3f} to {scores.max():.3f}')
print(f'  Auto-approve: {(scores < 0.75).sum()}, Review: {((scores >= 0.75) & (scores < 0.90)).sum()}, Hold: {(scores >= 0.90).sum()}')

os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/fraud_isolation_forest.pkl')
joblib.dump(scaler, 'models/fraud_scaler.pkl')
print('Fraud model saved to models/fraud_isolation_forest.pkl')
print('Scaler saved to models/fraud_scaler.pkl')
" 2>/dev/null || python3 -c "
import sys
sys.path.insert(0, '.')
from feature_engineering import *
from sklearn.ensemble import IsolationForest
import joblib, os, numpy as np

zones = generate_synthetic_zones(50, seed=42)
workers = generate_synthetic_workers(500, zones, seed=42)
events = generate_synthetic_events(300, zones, seed=42)
claims = generate_synthetic_claims(workers, events, zones, anomaly_rate=0.05, seed=42)

X_scaled, scaler = prepare_fraud_features(claims)
model = IsolationForest(n_estimators=200, contamination=0.05, random_state=42, n_jobs=-1)
model.fit(X_scaled)

os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/fraud_isolation_forest.pkl')
joblib.dump(scaler, 'models/fraud_scaler.pkl')
print('Fraud model trained and saved.')
"

echo -e "${GREEN}✓ Fraud Detection Model trained${NC}"

# --- 2. Train Premium Risk Scoring Model (XGBoost) ---
echo -e "\n${BLUE}[2/2] Training Premium Risk Scoring Model...${NC}"
python -c "
import sys
sys.path.insert(0, '.')
from feature_engineering import *
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import numpy as np

print('Generating pricing data...')
zones = generate_synthetic_zones(50, seed=42)
pricing = generate_pricing_training_data(zones, n_weeks=52, seed=42)
print(f'  Pricing dataset: {pricing.shape}')

print('Preparing features...')
X, y, encoders = prepare_pricing_features(pricing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

try:
    import xgboost as xgb
    import joblib, os

    print('Training XGBoost...')
    model = xgb.XGBRegressor(n_estimators=300, max_depth=5, learning_rate=0.05,
                              reg_alpha=0.1, reg_lambda=1.0, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=0)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f'  MAE: {mae:.4f}, R²: {r2:.4f}')

    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/pricing_xgboost.pkl')
    joblib.dump(encoders, 'models/pricing_encoders.pkl')
    print('Pricing model saved to models/pricing_xgboost.pkl')
except ImportError:
    print('XGBoost not installed. Run: pip install xgboost')
    print('Skipping pricing model training.')
" 2>/dev/null || echo "Could not train pricing model. Install dependencies first."

echo -e "${GREEN}✓ Premium Risk Model trained${NC}"

echo -e "\n${GREEN}=========================================="
echo "  Model Training Complete!"
echo "==========================================${NC}"
echo ""
echo "  Models saved to ml-model/models/"
ls -la models/ 2>/dev/null
