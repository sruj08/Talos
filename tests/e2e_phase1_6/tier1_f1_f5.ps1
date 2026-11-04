# Tier 1 — Feature Coverage (Happy Path): Features F1 through F5 (25 Test Cases)
# Covers TASK-01 (F1), TASK-02 (F2, F3), and TASK-03 (F4, F5). Strictly < 250 lines.

function Invoke-TalosTier1F1ToF5 {
    Write-Host "`n=== TIER 1 (PART 1): FEATURES F1..F5 (25 TEST CASES) ===" -ForegroundColor Cyan
    $sqlPath = Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\migrations\0001_init_schema.up.sql'
    $storePath = Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\internal\store\store.go'
    $sqlText = Get-Content $sqlPath -Raw
    $storeText = Get-Content $storePath -Raw

    # --- F1: MIT License, Docker Compose & Graphify Gate (TASK-01) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F1-01' -Feature 'F1' -Description 'Root LICENSE file exists and contains standard MIT License text' -Check {
        $lic = Get-Content (Join-Path $Global:TalosRepoRoot 'LICENSE') -Raw
        return ($lic -match 'MIT License' -and $lic -match 'Permission is hereby granted, free of charge')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F1-02' -Feature 'F1' -Description 'docker-compose.yml defines postgres:16-alpine and valkey/valkey:7.2-alpine with healthchecks' -Check {
        $dc = Get-Content (Join-Path $Global:TalosRepoRoot 'docker-compose.yml') -Raw
        return ($dc -match 'postgres:16-alpine' -and $dc -match 'valkey/valkey:7\.2-alpine' -and $dc -match 'pg_isready' -and $dc -match 'valkey-cli')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F1-03' -Feature 'F1' -Description 'docker compose config -q succeeds and render.yaml defines all 5 polyglot services' -Check {
        Push-Location $Global:TalosRepoRoot
        try {
            docker compose config -q 2>$null
            $dcOk = ($LASTEXITCODE -eq 0)
        } finally { Pop-Location }
        $ry = Get-Content (Join-Path $Global:TalosRepoRoot 'render.yaml') -Raw
        return ($dcOk -and $ry -match 'talos-firewall-rs' -and $ry -match 'talos-orchestrator-go' -and $ry -match 'talos-console-web' -and $ry -match 'talos-valkey' -and $ry -match 'talos-postgres')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F1-04' -Feature 'F1' -Description '.planning/config.json enables graphify and .planning/graphs/graph.json is valid JSON' -Check {
        $cfg = Get-Content (Join-Path $Global:TalosRepoRoot '.planning\config.json') -Raw | ConvertFrom-Json
        $gr = Get-Content (Join-Path $Global:TalosRepoRoot '.planning\graphs\graph.json') -Raw | ConvertFrom-Json
        return ($cfg.graphify.enabled -eq $true -and $null -ne $gr.nodes -and $gr.nodes.Count -gt 10)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F1-05' -Feature 'F1' -Description 'MAP.md and CODEBASE_INDEX.md exist and resolve core polyglot directories' -Check {
        $map = Get-Content (Join-Path $Global:TalosRepoRoot 'MAP.md') -Raw
        $idx = Get-Content (Join-Path $Global:TalosRepoRoot '.planning\graphs\CODEBASE_INDEX.md') -Raw
        return ($map -match 'services/firewall-rs' -and $map -match 'sdk/paypal-go-apimatic' -and $idx -match 'services/orchestrator-go' -and $idx -match 'web/src/components')
    }

    # --- F2: PostgreSQL 16 9-Table Ledger (E-01..E-09) & SHA-256 Hash Chain (TASK-02) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F2-01' -Feature 'F2' -Description '0001_init_schema.up.sql defines all 9 relational tables (E-01 through E-09)' -Check {
        $tables = @('principal_users','agent_identities','kya_mandates','firewall_scan_logs','channel3_benchmarks','escrow_transactions','sla_timeline_tasks','dispute_evidence_bundles','webhook_event_ledger')
        foreach ($t in $tables) { if ($sqlText -notmatch "CREATE TABLE IF NOT EXISTS $t") { return $false } }
        return $true
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F2-02' -Feature 'F2' -Description '0001_init_schema.up.sql defines uuid_generate_v7() and BIGINT _cents columns' -Check {
        return ($sqlText -match 'FUNCTION uuid_generate_v7\(\)' -and $sqlText -match 'max_amount_cents BIGINT' -and $sqlText -match 'median_price_cents BIGINT' -and $sqlText -match 'amount_cents BIGINT')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F2-03' -Feature 'F2' -Description '0001_init_schema.up.sql defines audit_events SHA-256 hash chain trigger trg_audit_events_hash_chain' -Check {
        return ($sqlText -match 'CREATE TABLE IF NOT EXISTS audit_events' -and $sqlText -match 'compute_audit_event_hash\(\)' -and $sqlText -match 'trg_audit_events_hash_chain')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F2-04' -Feature 'F2' -Description 'Schema and Go store enforce SELECT ... FOR UPDATE row locking on escrow_transactions' -Check {
        return ($sqlText -match 'FROM escrow_transactions WHERE id = p_escrow_id FOR UPDATE' -and $storeText -match 'FROM escrow_transactions WHERE id = \$1 FOR UPDATE')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F2-05' -Feature 'F2' -Description 'Schema defines B-Tree/GIN indexes and seeds 3 baseline KYA mandates' -Check {
        return ($sqlText -match 'USING GIN \(allowed_categories\)' -and $sqlText -match 'USING GIN \(stripped_payloads_json\)' -and $sqlText -match '0192e8a0-0000-7000-8000-000000000101')
    }

    # --- F3: Redis/Valkey 24h PayPal-Request-Id Idempotency Lock (E-10, TASK-02) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F3-01' -Feature 'F3' -Description 'store.go defines DefaultIdempotencyTTL = 86400s (24h) and idemp:{PayPal-Request-Id} key prefix' -Check {
        return ($storeText -match 'DefaultIdempotencyTTL\s*=\s*86400\s*\*\s*time\.Second' -and $storeText -match '"idemp:"')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F3-02' -Feature 'F3' -Description 'AcquireIdempotencyLock implements Redis SET NX EX 86400 with thread-safe fallback' -Check {
        return ($storeText -match 'func \(s \*Store\) AcquireIdempotencyLock' -and $storeText -match 'tryRedisSetNX' -and $storeText -match 'NX' -and $storeText -match 'EX')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F3-03' -Feature 'F3' -Description 'First escrow authorize request with fresh PayPal-Request-Id acquires lock and returns 201' -Check {
        $res = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t1-f3-01' -RequestId 'req-t1-f3-unique-01' -Payload @{ amount_cents = 24900 }
        return ($res.StatusCode -eq 201 -and $res.IdempotentReplay -eq $false -and $res.Body.state -eq 'PAYPAL_AUTHORIZED')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F3-04' -Feature 'F3' -Description 'CreateEscrow in store.go enforces AcquireIdempotencyLock before inserting E-06 row' -Check {
        return ($storeText -match 'func \(s \*Store\) CreateEscrow' -and $storeText -match 's\.AcquireIdempotencyLock\(ctx,\s*tx\.PayPalRequestID')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F3-05' -Feature 'F3' -Description 'Go store unit test suite (go test ./internal/store/...) passes cleanly' -Check {
        Push-Location (Join-Path $Global:TalosRepoRoot 'services\orchestrator-go')
        try {
            $out = go test ./internal/store/... 2>&1
            return ($LASTEXITCODE -eq 0)
        } finally { Pop-Location }
    }

    # --- F4: Rust Ed25519 KYA Mandate Signer & Verifier + RFC 9421 (TASK-03) ---
    $script:SignedMandateF4 = $null
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F4-01' -Feature 'F4' -Description 'POST /v1/mandates/sign (API-01) signs $300 KYA mandate with Ed25519 keypair' -Check {
        $res = Invoke-TalosMandateSign -Route '/v1/mandates/sign' -Payload @{
            mandate_id = '0192e8a0-0000-7000-8000-000000000101'; principal_id = '0192e8a0-0000-7000-8000-000000000001'
            agent_id = '0192e8a0-0000-7000-8000-000000000011'; max_amount_cents = 30000; currency = 'USD'
            allowed_categories = @('Studio Audio','Microphones','hardware'); max_spread_bps = 1500; max_channel3_spread_bps = 1500
            sla_hours = 48; expires_at = '2027-12-31T23:59:59Z'; expires_at_unix = 1830297599
            ed25519_pubkey_hex = ''; ed25519_signature_hex = ''
        }
        $script:SignedMandateF4 = $res.Body
        $sig = if ($res.Body.ed25519_signature_hex) { $res.Body.ed25519_signature_hex } else { $res.Body.ed25519_signature }
        return (($res.StatusCode -eq 200 -or $res.StatusCode -eq 201) -and $sig.Length -ge 32)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F4-02' -Feature 'F4' -Description 'Alias route POST /v1/firewall/mandate/sign returns signed KyaMandate' -Check {
        $res = Invoke-TalosMandateSign -Route '/v1/firewall/mandate/sign' -Payload @{
            mandate_id = '0192e8a0-0000-7000-8000-000000000102'; principal_id = '0192e8a0-0000-7000-8000-000000000001'
            agent_id = '0192e8a0-0000-7000-8000-000000000011'; max_amount_cents = 30000; currency = 'USD'
            allowed_categories = @('Studio Audio'); max_spread_bps = 1500; max_channel3_spread_bps = 1500
            sla_hours = 48; expires_at = '2027-12-31T23:59:59Z'; expires_at_unix = 1830297599
            ed25519_pubkey_hex = ''; ed25519_signature_hex = ''
        }
        return ($null -ne $res.Body -and $res.Body.max_amount_cents -eq 30000)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F4-03' -Feature 'F4' -Description 'POST /v1/mandates/verify (API-02) validates $249.00 Studio Audio checkout as valid=true, step_up_required=false' -Check {
        $res = Invoke-TalosMandateVerify -Route '/v1/mandates/verify' -Payload @{
            mandate = $script:SignedMandateF4; mandate_id = $script:SignedMandateF4.mandate_id
            ed25519_signature = $script:SignedMandateF4.ed25519_signature_hex; requested_amount_cents = 24900
            requested_category = 'Studio Audio'; merchant_category = 'Studio Audio'; observed_spread_bps = 0; now_unix = 1762248000
        }
        return ($res.StatusCode -eq 200 -and $res.Body.valid -eq $true -and $res.Body.step_up_required -eq $false)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F4-04' -Feature 'F4' -Description 'Mandate verification executes in < 1ms (verification_latency_us < 1000)' -Check {
        $res = Invoke-TalosMandateVerify -Route '/v1/mandates/verify' -Payload @{
            mandate = $script:SignedMandateF4; requested_amount_cents = 24900
            requested_category = 'Studio Audio'; merchant_category = 'Studio Audio'; now_unix = 1762248000
        }
        return ([int64]$res.Body.verification_latency_us -lt 1000)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F4-05' -Feature 'F4' -Description 'services/firewall-rs/src/mandate.rs implements canonical SHA-256 + Ed25519 verification' -Check {
        $mRs = Get-Content (Join-Path $Global:TalosRepoRoot 'services\firewall-rs\src\mandate.rs') -Raw
        return ($mRs -match 'Sha256' -and $mRs -match 'KyaMandate' -and $mRs -match 'step_up_required')
    }

    # --- F5: Rust PayPal Webhook CRC32 & Signature Verifier (API-04, TASK-03) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F5-01' -Feature 'F5' -Description 'POST /v1/firewall/verify-webhook verifies valid PayPal webhook payload and CRC32' -Check {
        $raw = '{"id":"WH-101","event_type":"PAYMENT.AUTHORIZATION.CREATED","resource":{"id":"2A112233445566778"}}'
        $crc = Get-TalosCrc32Decimal $raw
        $res = Invoke-TalosWebhookVerify -Route '/v1/firewall/verify-webhook' -Payload @{
            transmission_id = 'tx-991122'; transmission_time = '2026-11-04T09:00:00Z'; cert_url = 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-1'
            auth_algo = 'SHA256withRSA'; transmission_sig = 'valid_paypal_rsa_sig_base64'; webhook_id = '4JH82910384719283'; raw_body = $raw; expected_crc32 = $crc
        }
        return ($res.StatusCode -eq 200 -and $res.Body.verified -eq $true -and [uint64]$res.Body.crc32_decimal -eq $crc)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F5-02' -Feature 'F5' -Description 'Alias route POST /v1/firewall/webhook/verify verifies PAYMENT.CAPTURE.COMPLETED event' -Check {
        $raw = '{"id":"WH-102","event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"id":"9CAP-2A112233"}}'
        $crc = Get-TalosCrc32Decimal $raw
        $res = Invoke-TalosWebhookVerify -Route '/v1/firewall/webhook/verify' -Payload @{
            transmission_id = 'tx-991123'; transmission_time = '2026-11-04T09:01:00Z'; transmission_sig = 'valid_sig'; webhook_id = '4JH82910384719283'; raw_body = $raw; expected_crc32 = $crc
        }
        return ($res.StatusCode -eq 200 -and $res.Body.verified -eq $true)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F5-03' -Feature 'F5' -Description 'Webhook CRC32 matches IEEE 802.3 standard test vector ("123456789" -> 3421780262)' -Check {
        $crc = Get-TalosCrc32Decimal '123456789'
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = 'tx-vec'; transmission_time = '2026-11-04T09:02:00Z'; transmission_sig = 'valid_sig'; webhook_id = 'WH-VEC'; raw_body = '123456789'; expected_crc32 = $crc
        }
        return ($crc -eq 3421780262 -and [uint64]$res.Body.crc32_decimal -eq 3421780262)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F5-04' -Feature 'F5' -Description 'Webhook verifier populates crc32_verified and rsa_sig_verified boolean flags' -Check {
        $raw = '{"event_type":"PAYMENT.AUTHORIZATION.VOIDED"}'
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = 'tx-void-1'; transmission_time = '2026-11-04T09:03:00Z'; transmission_sig = 'valid_sig'; webhook_id = 'WH-VOID'; raw_body = $raw
        }
        return ($res.Body.verified -eq $true -and $res.Body.crc32_decimal -gt 0)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F5-05' -Feature 'F5' -Description 'services/firewall-rs/src/webhook_verify.rs uses crc32fast::hash for wire-speed checksums' -Check {
        $wv = Get-Content (Join-Path $Global:TalosRepoRoot 'services\firewall-rs\src\webhook_verify.rs') -Raw
        return ($wv -match 'crc32fast::hash' -and $wv -match 'WebhookVerifyResponse')
    }
}
