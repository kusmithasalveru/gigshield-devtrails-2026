# GigShield - Database Documentation

## Overview

| Property | Value |
|----------|-------|
| Engine | PostgreSQL 14+ |
| Extensions | uuid-ossp, PostGIS |
| Tables | 8 |
| Hosting | Local or Supabase (free tier) |
| Schema File | `docs/db-schema.sql` |

---

## Setup

### Option A: Local PostgreSQL
```bash
createdb gigshield
psql gigshield -f docs/db-schema.sql
```

### Option B: Supabase (Recommended for hackathon)
1. Create account at https://supabase.com
2. Create new project → copy connection string
3. Go to SQL Editor → paste contents of `docs/db-schema.sql` → Run
4. Add connection string to `backend/api-gateway/.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   ```

### Option C: Using migration script
```bash
# Windows
scripts\db-migrate.bat

# Linux/Mac
bash scripts/db-migrate.sh
```

---

## Schema Diagram

```
┌──────────┐     ┌──────────┐     ┌───────────────────┐
│  zones   │◄────│ workers  │────►│    policies        │
│          │     │          │     │                     │
│ id (PK)  │     │ id (PK)  │     │ id (PK)            │
│ city     │     │ name     │     │ worker_id (FK)      │
│ grid_cell│     │ phone    │     │ tier                │
│ location │     │ language │     │ premium             │
│ risk_score│    │ platform │     │ coverage_limit      │
│          │     │ zone_id  │     │ start_date/end_date │
│          │     │ upi_id   │     │ status              │
│          │     │ trust_   │     └───────┬─────────────┘
│          │     │  score   │             │
└────┬─────┘     └──┬───┬──┘             │
     │              │   │                │
     │              │   │    ┌───────────┘
     ▼              │   │    ▼
┌──────────────┐    │   │  ┌────────────┐     ┌──────────────┐
│ disruption_  │    │   │  │  payouts   │────►│ fraud_checks │
│  events      │    │   │  │            │     │              │
│              │    │   │  │ id (PK)    │     │ id (PK)      │
│ id (PK)      │    │   └─►│ worker_id  │     │ payout_id    │
│ event_hash   │    │      │ policy_id  │     │ anomaly_score│
│ zone_id (FK) │◄───┼──────│ event_id   │     │ decision     │
│ event_type   │    │      │ amount     │     │ flags        │
│ severity     │    │      │ status     │     │ shap_explain │
│ trigger_data │    │      │ upi_txn_id │     └──────────────┘
│ duration_min │    │      └──────┬─────┘
└──────────────┘    │             │
                    │             ▼
              ┌─────┘      ┌────────────┐
              ▼            │  disputes  │
       ┌──────────────┐    │            │
       │ trust_score_ │    │ id (PK)    │
       │  log         │    │ payout_id  │
       │              │    │ worker_id  │
       │ id (PK)      │    │ reason     │
       │ worker_id    │    │ status     │
       │ action       │    └────────────┘
       │ score_change │
       │ new_score    │
       └──────────────┘
```

---

## Table Details

### zones
500m × 500m grid cells with geographical and risk data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique zone identifier |
| city | VARCHAR(100) | NOT NULL | City name (Hyderabad, Delhi, etc.) |
| grid_cell | VARCHAR(20) | UNIQUE, NOT NULL | Grid reference (e.g., HYD-17-42) |
| location | GEOGRAPHY(POINT) | NOT NULL | PostGIS point (lng, lat) |
| risk_score | NUMERIC(4,2) | CHECK 0.0-2.0, DEFAULT 1.0 | Historical disruption risk |
| flood_frequency | NUMERIC(5,2) | DEFAULT 0 | Annual flood events |
| disruption_days_per_month | NUMERIC(4,1) | DEFAULT 0 | Average disruption days |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:** GIST on location, B-tree on city

### workers
Delivery partner profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | |
| name | VARCHAR(200) | NOT NULL | Full name |
| phone | VARCHAR(15) | UNIQUE, NOT NULL | 10-digit mobile |
| language | language_enum | NOT NULL, DEFAULT 'en' | te/hi/ta/kn/ml/bn/mr/en |
| platform | platform_enum | NOT NULL | swiggy/zomato/amazon/zepto/other |
| zone_id | UUID | FK→zones, NOT NULL | Primary delivery zone |
| upi_id | VARCHAR(100) | NOT NULL | UPI payment address |
| trust_score | INTEGER | CHECK 0-100, DEFAULT 50 | Trust score |
| avg_weekly_earnings | NUMERIC(8,2) | DEFAULT 4000 | In rupees |
| weeks_active | INTEGER | DEFAULT 0 | Policy weeks purchased |
| device_fingerprint | VARCHAR(255) | | For network fraud detection |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:** B-tree on zone_id, phone, trust_score

### policies
Weekly insurance enrollments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | |
| worker_id | UUID | FK→workers, NOT NULL | |
| tier | tier_enum | NOT NULL | basic/standard/pro |
| premium | NUMERIC(8,2) | NOT NULL | Calculated premium amount |
| coverage_limit | NUMERIC(8,2) | NOT NULL | Max payout per event (200/350/600) |
| zone_risk_score | NUMERIC(4,2) | DEFAULT 1.0 | Score at time of purchase |
| season_factor | NUMERIC(4,2) | DEFAULT 1.0 | Factor at time of purchase |
| loyalty_discount | NUMERIC(4,2) | DEFAULT 1.0 | Discount at time of purchase |
| start_date | DATE | NOT NULL | Coverage start |
| end_date | DATE | NOT NULL | Coverage end (start + 7 days) |
| status | policy_status | DEFAULT 'active' | active/expired/cancelled |
| payment_ref | VARCHAR(100) | | Razorpay/UPI reference |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraints:** `end_date > start_date`
**Indexes:** B-tree on worker_id, (status, start_date, end_date)

### disruption_events
Detected parametric triggers from external APIs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | |
| event_hash | VARCHAR(64) | UNIQUE, NOT NULL | SHA256 dedup hash |
| zone_id | UUID | FK→zones, NOT NULL | |
| event_type | event_type_enum | NOT NULL | heavy_rain/moderate_rain/severe_pollution/extreme_heat/flash_flood/strike |
| severity | severity_enum | NOT NULL | HIGH/MEDIUM |
| trigger_data | JSONB | NOT NULL | Raw API readings |
| trigger_value | NUMERIC(8,2) | | Actual reading (mm/hr, AQI, °C) |
| threshold_value | NUMERIC(8,2) | | Threshold that was crossed |
| duration_minutes | INTEGER | NOT NULL | How long the trigger lasted |
| disrupted_hours | NUMERIC(4,2) | | Capped at 4 hours |
| source | VARCHAR(50) | | open-meteo/openaq/newsdata |
| start_time | TIMESTAMPTZ | NOT NULL | When trigger began |
| end_time | TIMESTAMPTZ | | When trigger ended |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:** B-tree on (zone_id, start_time), event_hash, event_type; GIN on trigger_data

### payouts
Compensation payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | |
| worker_id | UUID | FK→workers, NOT NULL | |
| policy_id | UUID | FK→policies, NOT NULL | |
| event_id | UUID | FK→disruption_events, NOT NULL | |
| amount | NUMERIC(8,2) | CHECK > 0, NOT NULL | Payout amount in rupees |
| severity_factor | NUMERIC(3,1) | NOT NULL | 1.0 (HIGH) or 0.6 (MEDIUM) |
| disrupted_hours | NUMERIC(4,2) | | Hours of disruption |
| status | payout_status | DEFAULT 'initiated' | initiated/completed/failed/held/reversed |
| upi_txn_id | VARCHAR(100) | | Razorpay transaction ID |
| notification_sent | BOOLEAN | DEFAULT FALSE | WhatsApp notification sent |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| completed_at | TIMESTAMPTZ | | When payout completed |

**Constraints:** UNIQUE(worker_id, event_id) — one payout per worker per event
**Indexes:** B-tree on (worker_id, created_at), status, event_id

### fraud_checks
Audit trail for every fraud detection decision.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | |
| payout_id | UUID | FK→payouts | |
| worker_id | UUID | FK→workers, NOT NULL | |
| event_id | UUID | FK→disruption_events, NOT NULL | |
| location_valid | BOOLEAN | | Layer 1 result |
| distance_km | NUMERIC(6,2) | | GPS distance from zone |
| activity_valid | BOOLEAN | | Layer 2 result |
| hours_inactive | NUMERIC(4,1) | | Hours since last activity |
| anomaly_score | NUMERIC(4,3) | CHECK 0-1, NOT NULL | Layer 3 ML score |
| is_duplicate | BOOLEAN | DEFAULT FALSE | Layer 4 result |
| network_flag | BOOLEAN | DEFAULT FALSE | Layer 5 result |
| flags | JSONB | DEFAULT '[]' | Array of flag reasons |
| shap_explanation | TEXT | | Plain-language SHAP explanation |
| decision | fraud_decision | NOT NULL | auto_approve/human_review/hold/cleared/confirmed_fraud |
| reviewed_by | VARCHAR(100) | | Human reviewer (if applicable) |
| reviewed_at | TIMESTAMPTZ | | When reviewed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### trust_score_log
History of trust score changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK | |
| worker_id | UUID | FK→workers, NOT NULL | |
| action | VARCHAR(100) | NOT NULL | What caused the change |
| score_change | INTEGER | NOT NULL | Points added/removed |
| new_score | INTEGER | NOT NULL | Score after change |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Trust Score Rules:**
| Action | Change |
|--------|--------|
| Successful validated claim | +2 |
| Four weeks continuous coverage | +3 |
| Dispute resolved in worker's favour | +2 |
| Peer worker vouches | +1 |
| Anomaly flagged (not confirmed) | -3 |
| Confirmed fraud attempt | -25 |

### disputes
Worker-initiated claim disputes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | |
| payout_id | UUID | FK→payouts, NOT NULL | |
| worker_id | UUID | FK→workers, NOT NULL | |
| reason | TEXT | NOT NULL | Worker's explanation |
| voice_note_url | VARCHAR(500) | | Optional voice recording URL |
| status | VARCHAR(20) | CHECK IN(...) | under_review/resolved_approved/resolved_rejected |
| resolution_note | TEXT | | Reviewer's note |
| resolved_at | TIMESTAMPTZ | | When resolved |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Enum Types

| Enum | Values |
|------|--------|
| language_enum | te, hi, ta, kn, ml, bn, mr, en |
| platform_enum | swiggy, zomato, amazon, zepto, other |
| tier_enum | basic, standard, pro |
| policy_status | active, expired, cancelled |
| event_type_enum | heavy_rain, moderate_rain, severe_pollution, extreme_heat, flash_flood, strike |
| severity_enum | HIGH, MEDIUM |
| payout_status | initiated, completed, failed, held, reversed |
| fraud_decision | auto_approve, human_review, hold, cleared, confirmed_fraud |

---

## Seed Data

The schema includes seed data for demo purposes:

**5 Hyderabad Zones:**
| Grid Cell | Area | Risk Score | Flood Frequency |
|-----------|------|------------|-----------------|
| HYD-17-42 | Kukatpally | 0.68 | 8.5/year |
| HYD-18-40 | Madhapur | 0.85 | 11.0/year |
| HYD-19-43 | HITEC City | 0.52 | 5.2/year |
| HYD-16-41 | Secunderabad | 0.73 | 9.0/year |
| HYD-20-39 | LB Nagar | 0.61 | 6.8/year |

**2 Demo Workers:**
| Name | Platform | Language | Zone | Trust Score |
|------|----------|----------|------|-------------|
| Ravi Shankar | Swiggy | Telugu | Kukatpally | 58 |
| Arjun Kumar | Zomato | Hindi | Secunderabad | 52 |

---

## Key PostGIS Queries

**Find workers within 2km of a disruption zone:**
```sql
SELECT w.* FROM workers w
JOIN zones z ON w.zone_id = z.id
WHERE ST_DWithin(z.location, ST_MakePoint(78.3996, 17.4947)::geography, 2000);
```

**Get zone coordinates:**
```sql
SELECT id, city, grid_cell,
       ST_Y(location::geometry) as lat,
       ST_X(location::geometry) as lng,
       risk_score
FROM zones;
```
