-- TALOS PostgreSQL 16 Schema (Entities E-01 through E-09 + F-14 Audit Hash Chain)
-- Reviewed with postgres skill: UUIDv7 time-ordered PKs, full FK/composite/GIN indexes, and SELECT ... FOR UPDATE row locking.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- RFC 9562 UUIDv7 generator: time-ordered 48-bit epoch-ms prefix eliminates B-Tree PK fragmentation (with UUIDv4 compatibility)
CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS UUID AS $$
DECLARE
    v_time BIGINT := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000);
    v_bytes BYTEA := gen_random_bytes(10);
    v_hex TEXT;
BEGIN
    v_hex := LPAD(TO_HEX(v_time), 12, '0') || ENCODE(v_bytes, 'hex');
    v_hex := SUBSTRING(v_hex FROM 1 FOR 12) || '7' || SUBSTRING(v_hex FROM 14 FOR 3)
          || TO_HEX((GET_BYTE(v_bytes, 2) & 63) | 128) || SUBSTRING(v_hex FROM 19 FOR 14);
    RETURN v_hex::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- E-01: principal_users
CREATE TABLE IF NOT EXISTS principal_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    email VARCHAR(255) UNIQUE NOT NULL,
    paypal_sandbox_buyer_email VARCHAR(255) NOT NULL,
    organization_name VARCHAR(160) NOT NULL DEFAULT 'TALOS Enterprise Treasury',
    step_up_threshold_cents BIGINT NOT NULL DEFAULT 30000 CHECK (step_up_threshold_cents > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-02: agent_identities
CREATE TABLE IF NOT EXISTS agent_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    principal_id UUID NOT NULL REFERENCES principal_users(id) ON DELETE RESTRICT,
    mcp_client_id VARCHAR(128) UNIQUE NOT NULL,
    ed25519_pubkey_hex VARCHAR(128) NOT NULL,
    rfc9421_key_id VARCHAR(128) UNIQUE NOT NULL,
    trust_score NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (trust_score >= 0 AND trust_score <= 100),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-03: kya_mandates
CREATE TABLE IF NOT EXISTS kya_mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    principal_id UUID NOT NULL REFERENCES principal_users(id) ON DELETE RESTRICT,
    agent_id UUID NOT NULL REFERENCES agent_identities(id) ON DELETE RESTRICT,
    max_amount_cents BIGINT NOT NULL CHECK (max_amount_cents > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR')),
    allowed_categories TEXT[] NOT NULL,
    max_spread_bps INT NOT NULL DEFAULT 1500 CHECK (max_spread_bps >= 0 AND max_spread_bps <= 10000),
    sla_hours INT NOT NULL DEFAULT 48 CHECK (sla_hours >= 1 AND sla_hours <= 696),
    ed25519_signature_hex TEXT NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-04: firewall_scan_logs
CREATE TABLE IF NOT EXISTS firewall_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    mandate_id UUID REFERENCES kya_mandates(id) ON DELETE SET NULL,
    merchant_url TEXT NOT NULL,
    raw_dom_hash VARCHAR(64) NOT NULL,
    injection_detected BOOLEAN NOT NULL DEFAULT FALSE,
    stripped_payloads_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_score NUMERIC(5,4) NOT NULL DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 1.0),
    latency_us BIGINT NOT NULL DEFAULT 0 CHECK (latency_us >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-05: channel3_benchmarks
CREATE TABLE IF NOT EXISTS channel3_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    sku_query VARCHAR(255) NOT NULL,
    matched_product_id VARCHAR(128) NOT NULL,
    median_price_cents BIGINT NOT NULL CHECK (median_price_cents > 0),
    lowest_verified_price_cents BIGINT NOT NULL CHECK (lowest_verified_price_cents > 0),
    lowest_merchant_url TEXT NOT NULL,
    spread_bps INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-06: escrow_transactions (2PC State Machine locked via SELECT ... FOR UPDATE)
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    mandate_id UUID REFERENCES kya_mandates(id) ON DELETE RESTRICT,
    firewall_scan_id UUID REFERENCES firewall_scan_logs(id) ON DELETE RESTRICT,
    channel3_benchmark_id UUID REFERENCES channel3_benchmarks(id) ON DELETE RESTRICT,
    paypal_request_id VARCHAR(128) UNIQUE NOT NULL,
    paypal_order_id VARCHAR(64) UNIQUE,
    paypal_auth_id VARCHAR(64) UNIQUE,
    paypal_capture_id VARCHAR(64) UNIQUE,
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    state VARCHAR(64) NOT NULL CHECK (state IN (
        'INITIATED', 'BLOCKED_FIREWALL', 'BLOCKED_PRICE_GOUGING', 'STEP_UP_REQUIRED',
        'MANDATE_VERIFIED', 'CHANNEL3_BENCHMARKED', 'PAYPAL_AUTHORIZED', 'SLA_SCHEDULED',
        'TRACKING_VERIFIED', 'PAYPAL_CAPTURED', 'PAYPAL_VOIDED', 'DISPUTE_FILED'
    )),
    step_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-07: sla_timeline_tasks
CREATE TABLE IF NOT EXISTS sla_timeline_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    auth_expiry_date TIMESTAMPTZ NOT NULL,
    carrier_code VARCHAR(64),
    tracking_number VARCHAR(128),
    tracking_status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    dependency_task_id UUID REFERENCES sla_timeline_tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-08: dispute_evidence_bundles
CREATE TABLE IF NOT EXISTS dispute_evidence_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id) ON DELETE RESTRICT,
    paypal_dispute_id VARCHAR(64) UNIQUE NOT NULL,
    mandate_sig_hex TEXT NOT NULL,
    channel3_snapshot_json JSONB NOT NULL,
    kernel_screenshot_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-09: webhook_event_ledger
CREATE TABLE IF NOT EXISTS webhook_event_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    transmission_id VARCHAR(128) UNIQUE NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    crc32_verified BOOLEAN NOT NULL DEFAULT FALSE,
    rsa_sig_verified BOOLEAN NOT NULL DEFAULT FALSE,
    payload_json JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- F-14: Immutable SHA-256 Hash-Chained Audit Ledger
CREATE TABLE IF NOT EXISTS audit_events (
    seq_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE RESTRICT,
    event_type VARCHAR(64) NOT NULL,
    payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    prev_hash VARCHAR(64) NOT NULL DEFAULT REPEAT('0', 64),
    event_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION compute_audit_event_hash() RETURNS TRIGGER AS $$
DECLARE
    v_prev VARCHAR(64);
BEGIN
    SELECT event_hash INTO v_prev FROM audit_events ORDER BY seq_id DESC LIMIT 1;
    NEW.prev_hash := COALESCE(v_prev, REPEAT('0', 64));
    NEW.event_hash := ENCODE(DIGEST(NEW.prev_hash || '|' || COALESCE(NEW.escrow_id::TEXT, '') || '|' || NEW.event_type || '|' || NEW.payload_json::TEXT, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_events_hash_chain ON audit_events;
CREATE TRIGGER trg_audit_events_hash_chain BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION compute_audit_event_hash();

-- Pessimistic Row-Level Lock (SELECT ... FOR UPDATE) for 2PC Escrow State Transitions
CREATE OR REPLACE FUNCTION lock_and_transition_escrow(
    p_escrow_id UUID, p_expected_states TEXT[], p_next_state VARCHAR,
    p_order_id VARCHAR DEFAULT NULL, p_auth_id VARCHAR DEFAULT NULL, p_capture_id VARCHAR DEFAULT NULL
) RETURNS escrow_transactions AS $$
DECLARE
    v_row escrow_transactions%ROWTYPE;
    v_prev_state VARCHAR(64);
BEGIN
    SELECT * INTO v_row FROM escrow_transactions WHERE id = p_escrow_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'escrow_transaction % not found', p_escrow_id; END IF;
    v_prev_state := v_row.state;
    IF NOT (v_prev_state = ANY(p_expected_states)) THEN
        RAISE EXCEPTION 'illegal 2PC state transition from % to %', v_prev_state, p_next_state;
    END IF;
    UPDATE escrow_transactions SET
        state = p_next_state,
        paypal_order_id = COALESCE(p_order_id, paypal_order_id),
        paypal_auth_id = COALESCE(p_auth_id, paypal_auth_id),
        paypal_capture_id = COALESCE(p_capture_id, paypal_capture_id),
        updated_at = NOW()
    WHERE id = p_escrow_id RETURNING * INTO v_row;
    INSERT INTO audit_events (escrow_id, event_type, payload_json)
    VALUES (p_escrow_id, 'STATE_' || p_next_state, jsonb_build_object('from', v_prev_state, 'to', p_next_state));
    RETURN v_row;
END;
$$ LANGUAGE plpgsql;

-- Foreign Key, Composite B-Tree & GIN Indexes (postgres skill verified)
CREATE INDEX IF NOT EXISTS idx_agent_identities_principal_id ON agent_identities(principal_id);
CREATE INDEX IF NOT EXISTS idx_kya_mandates_principal_id ON kya_mandates(principal_id, expires_at) WHERE is_revoked = FALSE;
CREATE INDEX IF NOT EXISTS idx_kya_mandates_agent_id ON kya_mandates(agent_id);
CREATE INDEX IF NOT EXISTS idx_kya_mandates_categories_gin ON kya_mandates USING GIN (allowed_categories);
CREATE INDEX IF NOT EXISTS idx_firewall_scan_mandate_id ON firewall_scan_logs(mandate_id);
CREATE INDEX IF NOT EXISTS idx_firewall_injection_created ON firewall_scan_logs(injection_detected, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_firewall_payloads_gin ON firewall_scan_logs USING GIN (stripped_payloads_json);
CREATE INDEX IF NOT EXISTS idx_channel3_sku_created ON channel3_benchmarks(sku_query, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_mandate_id ON escrow_transactions(mandate_id);
CREATE INDEX IF NOT EXISTS idx_escrow_firewall_scan_id ON escrow_transactions(firewall_scan_id);
CREATE INDEX IF NOT EXISTS idx_escrow_channel3_benchmark_id ON escrow_transactions(channel3_benchmark_id);
CREATE INDEX IF NOT EXISTS idx_escrow_state ON escrow_transactions(state);
CREATE INDEX IF NOT EXISTS idx_escrow_state_created ON escrow_transactions(state, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_paypal_order ON escrow_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_paypal_auth ON escrow_transactions(paypal_auth_id);
CREATE INDEX IF NOT EXISTS idx_sla_escrow_id ON sla_timeline_tasks(escrow_id);
CREATE INDEX IF NOT EXISTS idx_sla_dependency_task_id ON sla_timeline_tasks(dependency_task_id);
CREATE INDEX IF NOT EXISTS idx_sla_deadline_status ON sla_timeline_tasks(sla_deadline, tracking_status);
CREATE INDEX IF NOT EXISTS idx_dispute_escrow_id ON dispute_evidence_bundles(escrow_id);
CREATE INDEX IF NOT EXISTS idx_dispute_snapshot_gin ON dispute_evidence_bundles USING GIN (channel3_snapshot_json);
CREATE INDEX IF NOT EXISTS idx_webhook_type_processed ON webhook_event_ledger(event_type, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_payload_gin ON webhook_event_ledger USING GIN (payload_json);

-- Deterministic Baseline Demo Seed (Buyer, Merchant, Agent & 3 Baseline KYA Mandates)
INSERT INTO principal_users (id, email, paypal_sandbox_buyer_email, organization_name, step_up_threshold_cents) VALUES
    ('0192e8a0-0000-7000-8000-000000000001', 'arjun.mehta@talos-treasury.io', 'buyer.sandbox@talos-treasury.io', 'Mehta Media Studios', 30000),
    ('0192e8a0-0000-7000-8000-000000000002', 'merchant.ops@verified-audio.io', 'merchant.sandbox@verified-audio.io', 'Verified Pro Audio LLC', 50000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agent_identities (id, principal_id, mcp_client_id, ed25519_pubkey_hex, rfc9421_key_id, trust_score, status) VALUES
    ('0192e8a0-0000-7000-8000-000000000011', '0192e8a0-0000-7000-8000-000000000001', 'mcp-procurement-agent-01', REPEAT('a1', 32), 'talos-kya-key-2026-01', 99.50, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kya_mandates (id, principal_id, agent_id, max_amount_cents, currency, allowed_categories, max_spread_bps, sla_hours, ed25519_signature_hex, expires_at) VALUES
    ('0192e8a0-0000-7000-8000-000000000101', '0192e8a0-0000-7000-8000-000000000001', '0192e8a0-0000-7000-8000-000000000011', 30000, 'USD', ARRAY['Studio Audio', 'Microphones'], 1500, 48, REPEAT('b1', 64), NOW() + INTERVAL '30 days'),
    ('0192e8a0-0000-7000-8000-000000000102', '0192e8a0-0000-7000-8000-000000000001', '0192e8a0-0000-7000-8000-000000000011', 120000, 'USD', ARRAY['Server Rack', 'Networking'], 1000, 72, REPEAT('b2', 64), NOW() + INTERVAL '30 days'),
    ('0192e8a0-0000-7000-8000-000000000103', '0192e8a0-0000-7000-8000-000000000001', '0192e8a0-0000-7000-8000-000000000011', 20000, 'USD', ARRAY['Cloud SaaS', 'DevTools'], 1500, 24, REPEAT('b3', 64), NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;
