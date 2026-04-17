@echo off
REM ============================================================
REM GigShield - Train ML Models (Windows)
REM ============================================================

set ROOT_DIR=%~dp0..

echo ==========================================
echo   GigShield - ML Model Training
echo ==========================================

cd /d "%ROOT_DIR%\ml-model"
mkdir models 2>nul

echo.
echo [1/2] Training Fraud Detection Model (Isolation Forest)...
python -c "import sys; sys.path.insert(0,'.'); from feature_engineering import *; from sklearn.ensemble import IsolationForest; import joblib,os,numpy as np; zones=generate_synthetic_zones(50,seed=42); workers=generate_synthetic_workers(500,zones,seed=42); events=generate_synthetic_events(300,zones,seed=42); claims=generate_synthetic_claims(workers,events,zones,anomaly_rate=0.05,seed=42); print(f'Claims: {claims.shape}'); X,scaler=prepare_fraud_features(claims); model=IsolationForest(n_estimators=200,contamination=0.05,random_state=42,n_jobs=-1); model.fit(X); scores=normalize_anomaly_scores(model.decision_function(X)); print(f'Score range: {scores.min():.3f} to {scores.max():.3f}'); os.makedirs('models',exist_ok=True); joblib.dump(model,'models/fraud_isolation_forest.pkl'); joblib.dump(scaler,'models/fraud_scaler.pkl'); print('Fraud model saved.')"
echo ✓ Fraud Detection Model trained

echo.
echo [2/2] Training Premium Risk Scoring Model (XGBoost)...
python -c "import sys; sys.path.insert(0,'.'); from feature_engineering import *; from sklearn.model_selection import train_test_split; from sklearn.metrics import mean_absolute_error,r2_score; import xgboost as xgb; import joblib,os; zones=generate_synthetic_zones(50,seed=42); pricing=generate_pricing_training_data(zones,n_weeks=52,seed=42); print(f'Pricing: {pricing.shape}'); X,y,enc=prepare_pricing_features(pricing); Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=0.2,random_state=42); model=xgb.XGBRegressor(n_estimators=300,max_depth=5,learning_rate=0.05,reg_alpha=0.1,reg_lambda=1.0,random_state=42,n_jobs=-1); model.fit(Xtr,ytr,eval_set=[(Xte,yte)],verbose=0); pred=model.predict(Xte); print(f'MAE: {mean_absolute_error(yte,pred):.4f}, R2: {r2_score(yte,pred):.4f}'); os.makedirs('models',exist_ok=True); joblib.dump(model,'models/pricing_xgboost.pkl'); joblib.dump(enc,'models/pricing_encoders.pkl'); print('Pricing model saved.')"
echo ✓ Premium Risk Model trained

echo.
echo ==========================================
echo   Model Training Complete!
echo ==========================================
echo.
dir models\
echo.
pause
