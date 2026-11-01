-- TALOS PostgreSQL 16 Schema (Entities E-01 through E-09)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS principal_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    paypal_sandbox_buyer_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID NOT NULL REFERENCES principal_users(id),
    mcp_client_id VARCHAR(128) NOT NULL,
    ed25519_pubkey_hex VARCHAR(128) NOT NULL,
    rfc9421_key_id VARCHAR(128) NOT NULL,
    trust_score NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kya_mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID NOT NULL REFERENCES principal_users(id),
    agent_id UUID NOT NULL REFERENCES agent_identities(id),
    max_amount_cents BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    allowed_categories TEXT[] NOT NULL,
    max_spread_bps INT NOT NULL DEFAULT 1500,
    sla_hours INT NOT NULL DEFAULT 48,
    ed25519_signature_hex TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS firewall_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_url TEXT NOT NULL,
    raw_dom_hash VARCHAR(64) NOT NULL,
    injection_detected BOOLEAN NOT NULL DEFAULT FALSE,
    stripped_payloads_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_score NUMERIC(5,4) NOT NULL DEFAULT 0.0,
    latency_us BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel3_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_query VARCHAR(255) NOT NULL,
    matched_product_id VARCHAR(128) NOT NULL,
    median_price_cents BIGINT NOT NULL,
    lowest_verified_price_cents BIGINT NOT NULL,
    lowest_merchant_url TEXT NOT NULL,
    spread_bps INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandate_id UUID REFERENCES kya_mandates(id),
    firewall_scan_id UUID REFERENCES firewall_scan_logs(id),
    channel3_benchmark_id UUID REFERENCES channel3_benchmarks(id),
    paypal_request_id VARCHAR(128) UNIQUE NOT NULL,
    paypal_order_id VARCHAR(64),
    paypal_auth_id VARCHAR(64),
    paypal_capture_id VARCHAR(64),
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    state VARCHAR(64) NOT NULL,
    step_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sla_timeline_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id),
    task_name VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    auth_expiry_date TIMESTAMPTZ NOT NULL,
    carrier_code VARCHAR(64),
    tracking_number VARCHAR(128),
    tracking_status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    dependency_task_id UUID REFERENCES sla_timeline_tasks(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispute_evidence_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID NOT NULL REFERENCES escrow_transactions(id),
    paypal_dispute_id VARCHAR(64) NOT NULL,
    mandate_sig_hex TEXT NOT NULL,
    channel3_snapshot_json JSONB NOT NULL,
    kernel_screenshot_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_event_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transmission_id VARCHAR(128) UNIQUE NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    crc32_verified BOOLEAN NOT NULL DEFAULT FALSE,
    rsa_sig_verified BOOLEAN NOT NULL DEFAULT FALSE,
    payload_json JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_state ON escrow_transactions(state);
CREATE INDEX IF NOT EXISTS idx_escrow_paypal_order ON escrow_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_sla_escrow_id ON sla_timeline_tasks(escrow_id);
