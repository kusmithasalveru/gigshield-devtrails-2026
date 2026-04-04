# GigShield API Reference

**Base URLs:**
- Express API Gateway: `http://localhost:3000`
- FastAPI Fraud Engine: `http://localhost:8000`

**Authentication:** Bearer JWT token in `Authorization` header
**Rate Limit:** 100 requests/minute per IP

---

## Authentication

### POST /api/auth/send-otp
Send OTP to a phone number.

**Request:**
```json
{ "phone": "9876543210" }
```
**Response:** `200`
```json
{ "success": true, "message": "OTP sent successfully" }
```

### POST /api/auth/verify-otp
Verify OTP and receive JWT token.

**Request:**
```json
{ "phone": "9876543210", "otp": "123456" }
```
**Response:** `200`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "isNewUser": false,
  "worker": { "id": "uuid", "name": "Ravi Shankar", "phone": "9876543210" }
}
```

---

## Workers

### POST /api/workers
Register a new worker.

**Request:**
```json
{
  "name": "Ravi Shankar",
  "phone": "9876543210",
  "language": "te",
  "platform": "swiggy",
  "zone_id": "uuid",
  "upi_id": "9876543210@paytm",
  "avg_weekly_earnings": 4500
}
```
**Response:** `201` — Full worker object

### GET /api/workers/:id
Get worker profile. **Auth required.**

**Response:** `200`
```json
{
  "id": "uuid",
  "name": "Ravi Shankar",
  "phone": "9876543210",
  "language": "te",
  "platform": "swiggy",
  "zone_id": "uuid",
  "upi_id": "9876543210@paytm",
  "trust_score": 58,
  "avg_weekly_earnings": 4500,
  "weeks_active": 8,
  "city": "Hyderabad",
  "grid_cell": "HYD-17-42",
  "zone_risk_score": 0.68
}
```

### PATCH /api/workers/:id
Update worker profile. **Auth required.**

**Request:** Any subset of: `name`, `language`, `platform`, `zone_id`, `upi_id`, `avg_weekly_earnings`

### GET /api/workers/:id/trust-score
Get trust score with history. **Auth required.**

**Response:** `200`
```json
{
  "currentScore": 58,
  "history": [
    { "action": "Successful validated claim", "score_change": 2, "new_score": 58, "created_at": "2026-03-25T..." }
  ]
}
```

---

## Policies

### POST /api/policies
Purchase a weekly policy. **Auth required.**

**Request:**
```json
{ "worker_id": "uuid", "tier": "standard" }
```
**Response:** `201`
```json
{
  "id": "uuid",
  "worker_id": "uuid",
  "tier": "standard",
  "premium": 30,
  "coverage_limit": 350,
  "start_date": "2026-04-04",
  "end_date": "2026-04-11",
  "status": "active"
}
```

### GET /api/policies/premium-quote?worker_id=uuid&tier=standard
Get dynamic premium calculation without purchasing. **Auth required.**

**Response:** `200`
```json
{
  "premium": 30,
  "coverageLimit": 350,
  "breakdown": {
    "basePremium": 25,
    "zoneRiskScore": 0.68,
    "seasonFactor": 1.10,
    "loyaltyDiscount": 0.95,
    "tierMultiplier": 1.4
  }
}
```

### GET /api/policies/:id
Get policy details. **Auth required.**

---

## Disruption Events

### GET /api/events
List disruption events. **Auth required.**

**Query params:** `zone_id`, `event_type`, `start_date`, `end_date`, `limit` (default 50)

**Response:** `200` — Array of disruption event objects

### GET /api/events/:id
Get event details. **Auth required.**

**Response:** `200`
```json
{
  "id": "uuid",
  "event_hash": "sha256...",
  "zone_id": "uuid",
  "event_type": "heavy_rain",
  "severity": "HIGH",
  "trigger_data": { "precipitation_mm": 22.5 },
  "trigger_value": 22.5,
  "threshold_value": 15.0,
  "duration_minutes": 45,
  "disrupted_hours": 0.75,
  "start_time": "2026-04-04T14:00:00Z"
}
```

---

## Payouts

### GET /api/payouts/:id
Get payout details with linked event data. **Auth required.**

### POST /api/payouts/:id/dispute
Initiate a dispute on a held payout. **Auth required.**

**Request:**
```json
{ "reason": "I was in the zone, GPS was inaccurate due to storm", "voice_note_url": "optional" }
```

---

## Zones

### GET /api/zones
List all monitored zones. Optional `city` query param.

### GET /api/zones/:id
Get zone details with risk data.

---

## ML Endpoints (FastAPI — port 8000)

### POST /ml/fraud/score
Score a claim for fraud.

**Request:**
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
**Response:** `200`
```json
{
  "anomaly_score": 0.234,
  "decision": "auto_approve",
  "flags": [],
  "shap_explanation": null
}
```

### POST /ml/process-payout
End-to-end payout processing (fraud check + payout + notification).

**Request:**
```json
{ "event_id": "uuid", "worker_id": "uuid", "gps_lat": 17.4947, "gps_lng": 78.3996 }
```

### GET /ml/fraud/explain/{check_id}
Get SHAP explanation for a fraud check.

---

## Error Codes
| Code | Meaning |
|------|---------|
| 400 | Bad request / missing fields |
| 401 | Unauthorized / invalid token |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
