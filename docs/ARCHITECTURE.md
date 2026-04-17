# GigShield - System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GigShield Platform                        │
├──────────────┬──────────────┬─────────────┬─────────────────────┤
│   Frontend   │  API Gateway │  Trigger    │    Fraud Engine     │
│  React PWA   │  Express.js  │  Engine     │    FastAPI          │
│  Port: 5173  │  Port: 3000  │  Celery     │    Port: 8000       │
├──────────────┴──────────────┴─────────────┴─────────────────────┤
│                     PostgreSQL + PostGIS                          │
│                         Redis Cache                              │
└─────────────────────────────────────────────────────────────────┘
         │                    │                      │
    ┌────┘              ┌─────┘                ┌─────┘
    ▼                   ▼                      ▼
 Workers'           External APIs          ML Models
 Browsers         Open-Meteo (Weather)    Isolation Forest
                  OpenAQ (Pollution)      XGBoost
                  NewsData.io (News)      SHAP
                  Razorpay (Payouts)
                  Twilio (Notifications)
```

## Architecture Decision: Modular Monolith

We use a **modular monolith** pattern — NOT microservices.

**Two processes:**
1. **Node.js** (Express) — All CRUD operations (workers, policies, payouts)
2. **Python** (FastAPI + Celery) — ML inference, trigger polling, fraud detection

**Why not 6 separate microservices?**
- Avoids inter-service HTTP overhead
- Single database connection pool instead of 6
- One deployment config instead of 6
- Folder structure still matches the README's architecture diagram
- Right-sized for a hackathon submission

---

## Component Details

### 1. Frontend (React PWA)

```
frontend/
├── src/
│   ├── pages/           # 7 page components
│   │   ├── Onboarding   # 3-step: language → OTP → profile
│   │   ├── Dashboard     # Coverage status, alerts, recent payouts
│   │   ├── PolicySelection  # Tier picker with dynamic pricing
│   │   ├── ClaimStatus   # Real-time trigger tracking
│   │   ├── PayoutHistory # Expandable payout list with badges
│   │   ├── DisputePortal # 2-tap dispute with voice input
│   │   └── Profile       # Settings, trust score, language
│   ├── components/      # 7 reusable components
│   ├── hooks/           # 3 custom hooks
│   ├── locales/         # 8 language files (i18next)
│   └── api/             # Mock data layer (swappable to real API)
```

**Key Patterns:**
- **Auth Context** — localStorage-based session, JWT token storage
- **Mock Data Layer** — All API calls return delayed promises from mockData.js. Swap to real `fetch()` calls with zero component changes.
- **PWA Service Worker** — Caches Dashboard, PolicySelection, PayoutHistory for offline access
- **Mobile-First** — 48px touch targets, icon-first design, max-w-lg container

**Tech:** Vite, React 18, React Router 6, Tailwind CSS, i18next, lucide-react icons

### 2. API Gateway (Express.js)

```
backend/api-gateway/
├── src/
│   ├── server.js           # Express app entry point
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── rateLimiter.js   # 100 req/min per IP
│   │   └── errorHandler.js  # Centralized error handling
│   ├── routes/              # 7 route files
│   ├── controllers/         # 5 controller files
│   ├── services/
│   │   └── premium.service.js  # Dynamic pricing formula
│   ├── db/
│   │   ├── pool.js          # pg Pool singleton
│   │   └── migrations/      # SQL schema
│   └── utils/
│       ├── eventHash.js     # SHA256 dedup hash
│       └── geoUtils.js      # Haversine distance
```

**API Groups:**
| Group | Endpoints | Auth |
|-------|-----------|------|
| Auth | send-otp, verify-otp | No |
| Workers | CRUD, trust score | Yes |
| Policies | Purchase, quote, list | Yes |
| Payouts | History, details, dispute | Yes |
| Events | List, details | Yes |
| Zones | List, details | No |

**Pricing Formula:**
```
Premium = Base(₹25) × ZoneRiskScore × SeasonFactor × LoyaltyDiscount × TierMultiplier
```

### 3. Trigger Engine (Python + Celery)

```
backend/trigger-engine/
├── src/
│   ├── celery_app.py        # Celery config + beat schedule
│   ├── config.py            # Env vars, thresholds
│   ├── tasks/
│   │   ├── weather_task.py  # Open-Meteo polling
│   │   ├── pollution_task.py # OpenAQ polling
│   │   └── news_task.py     # NewsData.io polling
│   └── monitors/
│       ├── threshold_checker.py  # Duration tracking + event creation
│       └── zone_manager.py       # Active zone caching
```

**Polling Schedule:**
| Task | Interval | Hours (IST) |
|------|----------|-------------|
| Weather | Every 15 min | 6 AM - 11 PM |
| Pollution | Every 15 min | 6 AM - 11 PM |
| News | Every 30 min | 6 AM - 11 PM |

**Threshold Tracking Flow:**
1. Poll API → get current reading
2. If reading exceeds threshold → store in Redis with start_time
3. Next poll → if still exceeding → append reading
4. If duration ≥ required minimum → create `disruption_event` in PostgreSQL
5. If reading drops below → clear Redis key

**Trigger Thresholds:**
| Event | Threshold | Duration | Severity |
|-------|-----------|----------|----------|
| Heavy Rain | ≥ 15 mm/hr | 30 min | HIGH |
| Moderate Rain | 7-15 mm/hr | 45 min | MEDIUM |
| Severe Pollution | AQI > 300 | 2 hours | HIGH |
| Extreme Heat | ≥ 44°C feels-like | 3 hours | MEDIUM |
| Strike/Curfew | News confirmed | Immediate | HIGH |

### 4. Fraud Engine (FastAPI)

```
backend/fraud-engine/
├── src/
│   ├── main.py              # FastAPI app
│   ├── routes/
│   │   ├── fraud.py         # POST /ml/fraud/score
│   │   └── payout.py        # POST /ml/process-payout
│   └── services/
│       ├── fraud_service.py       # 5-layer fraud check
│       ├── ml_inference.py        # Isolation Forest .pkl loading
│       ├── razorpay_service.py    # UPI payout via Razorpay
│       └── notification_service.py # Twilio WhatsApp/SMS
```

**5-Layer Fraud Detection:**

| Layer | Check | Action on Fail |
|-------|-------|----------------|
| 1. Location | GPS within 2km of trigger zone | Flag for review |
| 2. Activity | Worker was active in last 3 hours | Flag for review |
| 3. ML Model | Isolation Forest anomaly score | Score > 0.75 → review, > 0.90 → hold |
| 4. Duplicate | Event hash uniqueness per worker | Block payout |
| 5. Network | Shared UPI IDs, device clustering | Hold payout |

**Payout Formula:**
```
Payout = (DailyEarnings / 10 hours) × DisruptedHours × SeverityFactor
         Capped at tier coverage limit (₹200 / ₹350 / ₹600)
```

### 5. ML Models

```
ml-model/
├── feature_engineering.py   # Shared data generation + preprocessing
├── fraud_model.ipynb        # Isolation Forest training notebook
├── pricing_model.ipynb      # XGBoost training notebook
└── models/                  # Saved .pkl files (generated by training)
    ├── fraud_isolation_forest.pkl
    ├── fraud_scaler.pkl
    ├── pricing_xgboost.pkl
    └── pricing_encoders.pkl
```

**Fraud Model (Isolation Forest):**
- 5 input features: claims_past_30d, claim_to_coverage_ratio, gps_distance_km, time_gap_hours, earnings_match_score
- Trained on 1,500 synthetic claims (5% anomalous)
- Output: anomaly score 0-1
- SHAP explainability for flagged records

**Pricing Model (XGBoost):**
- 6 input features: zone_risk_score, month, platform_type, account_age, trust_score, disruption_frequency
- Trained on 2,600 zone-week records
- Output: weekly_risk_score (0.5-1.5)
- Fed into the premium pricing formula

### 6. Database (PostgreSQL + PostGIS)

**8 Tables:**
| Table | Purpose | Key Fields |
|-------|---------|------------|
| zones | 500m grid cells with risk data | location (PostGIS), risk_score |
| workers | Delivery partner profiles | phone (unique), trust_score |
| policies | Weekly insurance enrollments | tier, premium, coverage_limit |
| disruption_events | Detected parametric triggers | event_hash (unique), trigger_data |
| payouts | Compensation records | UNIQUE(worker_id, event_id) |
| fraud_checks | Fraud decision audit trail | anomaly_score, decision |
| trust_score_log | Trust score change history | action, score_change |
| disputes | Worker-initiated disputes | reason, status |

**PostGIS Usage:**
- `zones.location` — GEOGRAPHY(POINT, 4326) for spatial queries
- `ST_DWithin` — Find workers within radius of trigger zone
- GIST index on geography columns for fast spatial lookups

---

## Data Flow: End-to-End Payout

```
1. Worker pays weekly premium via UPI
   └→ Frontend → POST /api/policies → PostgreSQL

2. Trigger Engine polls weather API every 15 min
   └→ Open-Meteo returns rain at 22mm/hr for Kukatpally zone

3. Threshold Checker tracks duration in Redis
   └→ After 30 minutes sustained: creates disruption_event in PostgreSQL

4. Fraud Engine processes payout for each active policyholder
   └→ Layer 1: GPS check ✓
   └→ Layer 2: Activity check ✓
   └→ Layer 3: ML score 0.23 (auto_approve) ✓
   └→ Layer 4: Not duplicate ✓
   └→ Layer 5: No network flags ✓

5. Payout calculated: (₹700/day ÷ 10hr) × 2hr × 1.0 = ₹140
   └→ Razorpay UPI transfer initiated

6. Worker receives WhatsApp in Telugu:
   "GigShield నుండి ₹140 మీ ఖాతాలో జమ అయింది. భారీ వర్షం కారణంగా."
```
