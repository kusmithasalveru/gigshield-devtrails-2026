"""GigShield Fraud Engine — FastAPI ML inference and payout processing."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import fraud, payout, phase3
from .services.ml_inference import load_models

app = FastAPI(
    title="GigShield Fraud Engine",
    description="ML-powered fraud detection and payout processing",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fraud.router, prefix="/ml/fraud", tags=["Fraud Detection"])
app.include_router(payout.router, prefix="/ml", tags=["Payout Processing"])
app.include_router(fraud.router, prefix="/m1/fraud", tags=["Fraud Detection (v1)"])
app.include_router(payout.router, prefix="/m1", tags=["Payout Processing (v1)"])
app.include_router(phase3.router, tags=["Phase 3"])


@app.on_event("startup")
async def startup():
    """Load ML models on startup."""
    load_models()
    print("[FRAUD ENGINE] Models loaded, ready to serve")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gigshield-fraud-engine"}
