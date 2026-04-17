-- GigShield Database Schema
-- PostgreSQL 14+ with PostGIS extension
-- AI-Powered Parametric Income Insurance for Gig Workers

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE language_enum AS ENUM ('te','hi','ta','kn','ml','bn','mr','en');
CREATE TYPE platform_enum AS ENUM ('swiggy','zomato','amazon','zepto','other');
CREATE TYPE tier_enum AS ENUM ('basic','standard','pro');
CREATE TYPE policy_status AS ENUM ('active','expired','cancelled');
CREATE TYPE event_type_enum AS ENUM ('heavy_rain','moderate_rain','severe_pollution','extreme_heat','flash_flood','strike');
CREATE TYPE severity_enum AS ENUM ('HIGH','MEDIUM');
CREATE TYPE payout_status AS ENUM ('initiated','completed','failed','held','reversed');
CREATE TYPE fraud_decision AS ENUM ('auto_approve','human_review','hold','cleared','confirmed_fraud');

-- ============================================================
-- TABLES
-- ============================================================

-- Zones: 500m x 500m grid cells with risk data
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    grid_cell VARCHAR(20) NOT NULL UNIQUE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    risk_score NUMERIC(4,2) NOT NULL DEFAULT 1.0 CHECK (risk_score BETWEEN 0.0 AND 2.0),
    flood_frequency NUMERIC(5,2) DEFAULT 0,
    disruption_days_per_month NUMERIC(4,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workers: Delivery partner profiles
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    language language_enum NOT NULL DEFAULT 'en',
    platform platform_enum NOT NULL,
    zone_id UUID NOT NULL REFERENCES zones(id),
    upi_id VARCHAR(100) NOT NULL,
    trust_score INTEGER NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
    avg_weekly_earnings NUMERIC(8,2) DEFAULT 4000,
    weeks_active INTEGER DEFAULT 0,
    device_fingerprint VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies: Weekly insurance enrollments
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id),
    tier tier_enum NOT NULL,
    premium NUMERIC(8,2) NOT NULL,
    coverage_limit NUMERIC(8,2) NOT NULL,
    zone_risk_score NUMERIC(4,2) DEFAULT 1.0,
    season_factor NUMERIC(4,2) DEFAULT 1.0,
    loyalty_discount NUMERIC(4,2) DEFAULT 1.0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status policy_status NOT NULL DEFAULT 'active',
    payment_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Disruption Events: Detected parametric triggers
CREATE TABLE disruption_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_hash VARCHAR(64) UNIQUE NOT NULL,
    zone_id UUID NOT NULL REFERENCES zones(id),
    event_type event_type_enum NOT NULL,
    severity severity_enum NOT NULL,
    trigger_data JSONB NOT NULL,
    trigger_value NUMERIC(8,2),
    threshold_value NUMERIC(8,2),
    duration_minutes INTEGER NOT NULL,
    disrupted_hours NUMERIC(4,2),
    source VARCHAR(50),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts: Compensation records
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id),
    policy_id UUID NOT NULL REFERENCES policies(id),
    event_id UUID NOT NULL REFERENCES disruption_events(id),
    amount NUMERIC(8,2) NOT NULL CHECK (amount > 0),
    severity_factor NUMERIC(3,1) NOT NULL,
    disrupted_hours NUMERIC(4,2),
    status payout_status NOT NULL DEFAULT 'initiated',
    upi_txn_id VARCHAR(100),
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT unique_worker_event UNIQUE(worker_id, event_id)
);

-- Fraud Checks: Audit trail for every fraud decision
CREATE TABLE fraud_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID REFERENCES payouts(id),
    worker_id UUID NOT NULL REFERENCES workers(id),
    event_id UUID NOT NULL REFERENCES disruption_events(id),
    location_valid BOOLEAN,
    distance_km NUMERIC(6,2),
    activity_valid BOOLEAN,
    hours_inactive NUMERIC(4,1),
    anomaly_score NUMERIC(4,3) NOT NULL CHECK (anomaly_score BETWEEN 0 AND 1),
    is_duplicate BOOLEAN DEFAULT FALSE,
    network_flag BOOLEAN DEFAULT FALSE,
    flags JSONB DEFAULT '[]',
    shap_explanation TEXT,
    decision fraud_decision NOT NULL,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust Score Log: History of trust score changes
CREATE TABLE trust_score_log (
    id SERIAL PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES workers(id),
    action VARCHAR(100) NOT NULL,
    score_change INTEGER NOT NULL,
    new_score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes: Worker-initiated claim disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES payouts(id),
    worker_id UUID NOT NULL REFERENCES workers(id),
    reason TEXT NOT NULL,
    voice_note_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'under_review' CHECK (status IN ('under_review', 'resolved_approved', 'resolved_rejected')),
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_zones_location ON zones USING GIST(location);
CREATE INDEX idx_zones_city ON zones(city);

CREATE INDEX idx_workers_zone ON workers(zone_id);
CREATE INDEX idx_workers_phone ON workers(phone);
CREATE INDEX idx_workers_trust ON workers(trust_score);

CREATE INDEX idx_policies_worker ON policies(worker_id);
CREATE INDEX idx_policies_status_dates ON policies(status, start_date, end_date);

CREATE INDEX idx_events_zone_time ON disruption_events(zone_id, start_time DESC);
CREATE INDEX idx_events_hash ON disruption_events(event_hash);
CREATE INDEX idx_events_type ON disruption_events(event_type);
CREATE INDEX idx_events_trigger_data ON disruption_events USING GIN(trigger_data);

CREATE INDEX idx_payouts_worker ON payouts(worker_id, created_at DESC);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_event ON payouts(event_id);

CREATE INDEX idx_fraud_worker ON fraud_checks(worker_id);
CREATE INDEX idx_fraud_decision ON fraud_checks(decision);

CREATE INDEX idx_trust_log_worker ON trust_score_log(worker_id, created_at DESC);

CREATE INDEX idx_disputes_worker ON disputes(worker_id);
CREATE INDEX idx_disputes_payout ON disputes(payout_id);

-- ============================================================
-- SEED DATA: Demo zones and workers for Hyderabad
-- ============================================================

INSERT INTO zones (id, city, grid_cell, location, risk_score, flood_frequency, disruption_days_per_month) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Hyderabad', 'HYD-17-42', ST_MakePoint(78.3996, 17.4947)::geography, 0.68, 8.5, 6.2),
  ('a1000001-0000-0000-0000-000000000002', 'Hyderabad', 'HYD-18-40', ST_MakePoint(78.3816, 17.4400)::geography, 0.85, 11.0, 8.0),
  ('a1000001-0000-0000-0000-000000000003', 'Hyderabad', 'HYD-19-43', ST_MakePoint(78.3548, 17.4486)::geography, 0.52, 5.2, 4.1),
  ('a1000001-0000-0000-0000-000000000004', 'Hyderabad', 'HYD-16-41', ST_MakePoint(78.4983, 17.4399)::geography, 0.73, 9.0, 6.8),
  ('a1000001-0000-0000-0000-000000000005', 'Hyderabad', 'HYD-20-39', ST_MakePoint(78.4474, 17.4611)::geography, 0.61, 6.8, 5.0);

INSERT INTO workers (id, name, phone, language, platform, zone_id, upi_id, trust_score, avg_weekly_earnings, weeks_active) VALUES
  ('b2000001-0000-0000-0000-000000000001', 'Ravi Shankar', '9876543210', 'te', 'swiggy',
   'a1000001-0000-0000-0000-000000000001', '9876543210@paytm', 58, 4500, 8),
  ('b2000001-0000-0000-0000-000000000002', 'Arjun Kumar', '9876543211', 'hi', 'zomato',
   'a1000001-0000-0000-0000-000000000004', '9876543211@phonepe', 52, 4200, 5);

-- Initial trust score log entries
INSERT INTO trust_score_log (worker_id, action, score_change, new_score) VALUES
  ('b2000001-0000-0000-0000-000000000001', 'Account created', 0, 50),
  ('b2000001-0000-0000-0000-000000000001', 'Successful validated claim', 2, 52),
  ('b2000001-0000-0000-0000-000000000001', 'Four weeks continuous coverage', 3, 55),
  ('b2000001-0000-0000-0000-000000000001', 'Anomaly flagged (not confirmed)', -3, 52),
  ('b2000001-0000-0000-0000-000000000001', 'Successful validated claim', 2, 54),
  ('b2000001-0000-0000-0000-000000000001', 'Four weeks continuous coverage', 3, 57),
  ('b2000001-0000-0000-0000-000000000001', 'Successful validated claim', 2, 58),
  ('b2000001-0000-0000-0000-000000000002', 'Account created', 0, 50),
  ('b2000001-0000-0000-0000-000000000002', 'Successful validated claim', 2, 52);
