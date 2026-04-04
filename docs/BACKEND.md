# GigShield - Backend Documentation

## Overview

The backend consists of **two processes** organized as a modular monolith:

| Process | Language | Framework | Port | Purpose |
|---------|----------|-----------|------|---------|
| API Gateway | Node.js | Express.js | 3000 | CRUD operations, auth, routing |
| Fraud Engine | Python | FastAPI | 8000 | ML inference, payout processing |

Plus a background worker:

| Process | Language | Framework | Purpose |
|---------|----------|-----------|---------|
| Trigger Engine | Python | Celery + Redis | Polls external APIs, detects disruptions |

---

## API Gateway (Express.js)

### Running
```bash
cd backend/api-gateway
cp .env.example .env   # First time only
npm install
npm run dev            # Development with nodemon
npm start              # Production
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| JWT_SECRET | Yes | — | Secret key for JWT signing |
| REDIS_URL | No | redis://localhost:6379 | Redis connection |
| TWILIO_ACCOUNT_SID | No | — | Twilio account SID |
| TWILIO_AUTH_TOKEN | No | — | Twilio auth token |
| TWILIO_PHONE_NUMBER | No | — | Twilio WhatsApp number |
| RAZORPAY_KEY_ID | No | — | Razorpay test key ID |
| RAZORPAY_KEY_SECRET | No | — | Razorpay test secret |
| FRAUD_ENGINE_URL | No | http://localhost:8000 | Fraud engine base URL |

### Middleware Stack

```
Request → CORS → Helmet → JSON Parser → Rate Limiter → Routes → Error Handler
```

| Middleware | File | Purpose |
|-----------|------|---------|
| CORS | express cors | Cross-origin requests |
| Helmet | express helmet | Security headers |
| Rate Limiter | `middleware/rateLimiter.js` | 100 req/min per IP |
| JWT Auth | `middleware/auth.js` | Token verification on protected routes |
| Error Handler | `middleware/errorHandler.js` | Centralized error responses |

### Route Structure

```
/health                          → health.routes.js
/api/auth/send-otp              → auth.routes.js
/api/auth/verify-otp            → auth.routes.js
/api/workers                     → worker.routes.js → worker.controller.js
/api/workers/:id                → worker.routes.js → worker.controller.js
/api/workers/:id/trust-score    → worker.routes.js → worker.controller.js
/api/policies                    → policy.routes.js → policy.controller.js
/api/policies/premium-quote     → policy.routes.js → policy.controller.js
/api/policies/:id               → policy.routes.js → policy.controller.js
/api/payouts/:id                → payout.routes.js → payout.controller.js
/api/payouts/:id/dispute        → payout.routes.js → payout.controller.js
/api/events                      → trigger.routes.js → trigger.controller.js
/api/events/:id                 → trigger.routes.js → trigger.controller.js
/api/zones                       → zone.routes.js → zone.controller.js
/api/zones/:id                  → zone.routes.js → zone.controller.js
```

### Authentication Flow

```
1. POST /api/auth/send-otp { phone: "9876543210" }
   → Generate 6-digit OTP, store in memory (Redis in production)
   → In dev: OTP printed to console

2. POST /api/auth/verify-otp { phone: "9876543210", otp: "123456" }
   → Verify OTP (any 6-digit code accepted in dev mode)
   → Issue JWT with { workerId, phone } payload, 7-day expiry
   → Return token + worker profile (or isNewUser: true)

3. Subsequent requests:
   Authorization: Bearer <jwt-token>
   → middleware/auth.js verifies token
   → Attaches req.user = { workerId, phone }
```

### Premium Pricing Service

**File:** `services/premium.service.js`

**Formula:**
```
Weekly Premium = Base(₹25) × ZoneRiskScore × SeasonFactor × LoyaltyDiscount × TierMultiplier
```

**Parameters:**

| Parameter | Values | Logic |
|-----------|--------|-------|
| Base Premium | ₹25 | Fixed floor |
| Zone Risk Score | 0.5 - 1.5 | From zones table, based on historical data |
| Season Factor | 0.85 / 1.10 / 1.30 | Winter=0.85, Post-monsoon=1.10, Monsoon=1.30 |
| Loyalty Discount | 1.0 / 0.95 / 0.90 | <6 weeks=none, 6+=5% off, 20+=10% off |
| Tier Multiplier | 1.0 / 1.4 / 2.2 | Basic / Standard / Pro |

**Coverage Limits:**

| Tier | Premium Range | Max Payout/Event |
|------|---------------|------------------|
| Basic | ₹11-38 | ₹200 |
| Standard | ₹15-53 | ₹350 |
| Pro | ₹24-83 | ₹600 |

**Payout Formula:**
```
Payout = (DailyEarnings ÷ 10 hours) × DisruptedHours × SeverityFactor
         Capped at tier coverage limit
```

| Severity | Factor | Event Types |
|----------|--------|-------------|
| HIGH | 1.0 | Heavy Rain, Flash Flood, Strike |
| MEDIUM | 0.6 | Moderate Rain, Extreme Heat |

### Database Connection

**File:** `db/pool.js`

Uses `pg.Pool` with:
- Max 20 connections
- 30s idle timeout
- 2s connection timeout
- Auto-reconnect on error

### Utility Functions

**eventHash.js** — SHA256 deduplication:
```js
generateEventHash(zoneId, eventType, timestamp)
// → SHA256(zone_id:event_type:YYYY-MM-DD:hour_bucket)
// One unique event per zone + type + hour window
```

**geoUtils.js** — Distance calculation:
```js
haversineDistance(lat1, lng1, lat2, lng2)  // → distance in km
isWithinRadius(lat, lng, centerLat, centerLng, radiusKm) // → boolean
```

---

## Trigger Engine (Python + Celery)

### Running
```bash
cd backend/trigger-engine
pip install -r requirements.txt
python -m celery -A src.celery_app worker --beat --loglevel=info
```

**Prerequisites:** Redis must be running on `localhost:6379`

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://localhost:5432/gigshield | PostgreSQL connection |
| REDIS_URL | redis://localhost:6379/0 | Redis for Celery broker + result backend |
| NEWSDATA_API_KEY | — | NewsData.io API key (optional) |
| POLLING_INTERVAL_MINUTES | 15 | How often to poll APIs |

### Celery Beat Schedule

| Task | Schedule | Time Window |
|------|----------|-------------|
| poll_weather | Every 15 min | 6 AM - 11 PM IST |
| poll_pollution | Every 15 min | 6 AM - 11 PM IST |
| poll_news | Every 30 min | 6 AM - 11 PM IST |

### External API Integrations

#### Open-Meteo (Weather)
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None required (free)
- **Parameters:** latitude, longitude, current precipitation + apparent_temperature
- **Rate Limit:** ~10,000 requests/day

#### OpenAQ (Air Quality)
- **URL:** `https://api.openaq.org/v2/latest`
- **Auth:** None required (free)
- **Parameters:** coordinates, radius 25km, parameter=pm25
- **Note:** Data can be sparse for some Indian cities

#### NewsData.io (News)
- **URL:** `https://newsdata.io/api/1/news`
- **Auth:** API key required
- **Query:** `(city) AND (strike OR curfew OR bandh OR shutdown)`
- **Timeframe:** Last 6 hours

### Threshold Checker Logic

**State Tracking (Redis):**
```
Key:   trigger:{zone_id}:{event_type}
Value: { "start_time": "...", "readings": [{ "value": 22.5, "time": "..." }] }
TTL:   2 hours
```

**Flow:**
```
Reading above threshold?
├─ YES → Key exists in Redis?
│        ├─ YES → Append reading, check duration
│        │        ├─ Duration ≥ required → CREATE EVENT in PostgreSQL, clear Redis
│        │        └─ Duration < required → Wait for next poll
│        └─ NO  → Create new Redis key with start_time
└─ NO  → Delete Redis key (threshold no longer breached)
```

**Event Deduplication:**
```
event_hash = SHA256(zone_id + event_type + date + hour_bucket)
INSERT ... ON CONFLICT (event_hash) DO NOTHING
```

### Zone Manager

**File:** `monitors/zone_manager.py`

Queries PostgreSQL for zones with active policies. Caches in Redis for 1 hour.

```python
get_active_zones()   # Returns list of zone dicts with lat/lng
invalidate_cache()   # Call when new policies are created
```

---

## Fraud Engine (FastAPI)

### Running
```bash
cd backend/fraud-engine
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --port 8000
```

**Swagger Docs:** http://localhost:8000/docs

### Endpoints

#### POST /ml/fraud/score
Score a single claim for fraud.

**Input:**
```json
{
  "worker_id": "uuid",
  "event_id": "uuid",
  "gps_lat": 17.4947,
  "gps_lng": 78.3996,
  "last_activity_hours_ago": 0.5,
  "claims_past_30d": 2,
  "claim_to_coverage_ratio": 0.25,
  "earnings_match_score": 0.90
}
```

**Output:**
```json
{
  "anomaly_score": 0.234,
  "decision": "auto_approve",
  "flags": [],
  "shap_explanation": null
}
```

#### POST /ml/process-payout
End-to-end payout processing:
1. Fetch worker + active policy + event data
2. Run 5-layer fraud check
3. Calculate payout amount
4. Initiate Razorpay UPI transfer (if approved)
5. Send WhatsApp notification
6. Update trust score

#### GET /ml/fraud/explain/{check_id}
Returns SHAP explanation for a past fraud check.

### 5-Layer Fraud Detection

**File:** `services/fraud_service.py`

| Layer | Check | Threshold | Result |
|-------|-------|-----------|--------|
| 1 | GPS distance from zone | > 2km | Flag |
| 2 | Hours since last activity | > 3 hours | Flag |
| 3 | Isolation Forest score | > 0.75 review, > 0.90 hold | Score |
| 4 | Duplicate event check | Already paid | Block |
| 5 | Shared UPI / device cluster | Multiple accounts | Hold |

**Decision Matrix:**

| Condition | Decision |
|-----------|----------|
| Duplicate event | hold |
| ML score ≥ 0.90 OR network flag | hold |
| ML score ≥ 0.75 OR location fail OR activity fail | human_review |
| All checks pass | auto_approve |

### ML Inference

**File:** `services/ml_inference.py`

- Loads `fraud_isolation_forest.pkl` and `fraud_scaler.pkl` on startup
- Falls back to heuristic scoring if .pkl files not found
- Normalizes Isolation Forest `decision_function()` output to 0-1 range

**Heuristic Fallback Scoring:**

| Feature | Condition | Score Added |
|---------|-----------|-------------|
| claims_past_30d | > 8 | +0.30 |
| claim_ratio | > 0.8 | +0.25 |
| gps_distance_km | > 5 | +0.25 |
| time_gap_hours | > 6 | +0.20 |
| earnings_match | < 0.3 | +0.15 |

### Razorpay Integration

**File:** `services/razorpay_service.py`

Uses Razorpay Fund Accounts API (sandbox mode):
1. Create contact → `POST /v1/contacts`
2. Create fund account (UPI) → `POST /v1/fund_accounts`
3. Create payout → `POST /v1/payouts`

In development: simulates payout and returns mock reference ID.

### Notification Service

**File:** `services/notification_service.py`

Sends WhatsApp messages via Twilio API.

**Templates (per language):**
- Payout credited: "GigShield నుండి ₹{amount} జమ అయింది..." (Telugu)
- Claim under review: "మీ ₹{amount} క్లెయిమ్ సమీక్షలో ఉంది..." (Telugu)

Supports: Telugu, Hindi, Tamil, Kannada, English.
Falls back to English for unsupported languages.
In development: prints to console instead of sending.
