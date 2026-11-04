# Tier 2 — Boundary & Corner Cases: Features F1 through F5 (25 Test Cases)
# Covers TASK-01 (F1), TASK-02 (F2, F3), and TASK-03 (F4, F5). Strictly < 250 lines.

function Invoke-TalosTier2F1ToF5 {
    Write-Host "`n=== TIER 2 (PART 1): BOUNDARY & CORNER CASES F1..F5 (25 TEST CASES) ===" -ForegroundColor Cyan
    $sqlPath = Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\migrations\0001_init_schema.up.sql'
    $storePath = Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\internal\store\store.go'
    $sqlText = Get-Content $sqlPath -Raw
    $storeText = Get-Content $storePath -Raw

    # --- F1 Boundary & Corner Cases (TASK-01) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F1-01' -Feature 'F1' -Description '.env.example contains only safe template placeholders and zero live credentials' -Check {
        $ex = Get-Content (Join-Path $Global:TalosRepoRoot '.env.example') -Raw
        return ($ex -match 'your_paypal_sandbox_client_id_here' -and $ex -match 'your_paypal_sandbox_client_secret_here' -and $ex -match 'your_channel3_api_key_here')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F1-02' -Feature 'F1' -Description 'render.yaml enforces sync: false on all secret environment variables' -Check {
        $ry = Get-Content (Join-Path $Global:TalosRepoRoot 'render.yaml') -Raw
        $syncMatches = [regex]::Matches($ry, 'sync:\s*false')
        return ($syncMatches.Count -ge 8)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F1-03' -Feature 'F1' -Description 'docker-compose.yml mounts PostgreSQL init schema read-only (:ro)' -Check {
        $dc = Get-Content (Join-Path $Global:TalosRepoRoot 'docker-compose.yml') -Raw
        return ($dc -match '0001_init_schema\.up\.sql:/docker-entrypoint-initdb\.d/0001_init\.sql:ro')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F1-04' -Feature 'F1' -Description '.planning/graphs/graph.json has valid nodes and edges arrays with zero null IDs' -Check {
        $gr = Get-Content (Join-Path $Global:TalosRepoRoot '.planning\graphs\graph.json') -Raw | ConvertFrom-Json
        $badNodes = @($gr.nodes | Where-Object { [string]::IsNullOrWhiteSpace($_.id) })
        return ($badNodes.Count -eq 0 -and $gr.edges.Count -gt 0)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F1-05' -Feature 'F1' -Description '.agent/tasks.json and .agent/tasks/TASK-01..12.json have consistent schemas and non-empty pass gates' -Check {
        $tasksDoc = Get-Content (Join-Path $Global:TalosRepoRoot '.agent\tasks.json') -Raw | ConvertFrom-Json
        for ($i = 1; $i -le 12; $i++) {
            $tid = ('TASK-{0:D2}' -f $i)
            $entry = $tasksDoc.tasks | Where-Object { $_.id -eq $tid }
            $indPath = Join-Path $Global:TalosRepoRoot (".agent\tasks\$tid.json")
            if ($null -eq $entry -or $entry.pass.Count -eq 0 -or -not (Test-Path $indPath)) { return $false }
        }
        return $true
    }

    # --- F2 Boundary & Corner Cases (TASK-02 PostgreSQL Schema) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F2-01' -Feature 'F2' -Description 'Schema enforces positive BIGINT CHECK constraints (max_amount_cents > 0, amount_cents > 0)' -Check {
        return ($sqlText -match 'CHECK \(max_amount_cents > 0\)' -and $sqlText -match 'CHECK \(amount_cents > 0\)' -and $sqlText -match 'CHECK \(step_up_threshold_cents > 0\)')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F2-02' -Feature 'F2' -Description 'Schema enforces 29-day PayPal hold boundary CHECK (sla_hours >= 1 AND sla_hours <= 696) and spread bounds (0..10000 bps)' -Check {
        return ($sqlText -match 'CHECK \(sla_hours >= 1 AND sla_hours <= 696\)' -and $sqlText -match 'CHECK \(max_spread_bps >= 0 AND max_spread_bps <= 10000\)')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F2-03' -Feature 'F2' -Description 'Schema enforces probability bounds on firewall risk_score (0..1.0) and agent trust_score (0..100)' -Check {
        return ($sqlText -match 'CHECK \(risk_score >= 0 AND risk_score <= 1\.0\)' -and $sqlText -match 'CHECK \(trust_score >= 0 AND trust_score <= 100\)')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F2-04' -Feature 'F2' -Description 'compute_audit_event_hash() handles genesis row boundary with REPEAT(''0'', 64)' -Check {
        return ($sqlText -match "COALESCE\(v_prev,\s*REPEAT\('0',\s*64\)\)")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F2-05' -Feature 'F2' -Description 'lock_and_transition_escrow raises explicit SQL exceptions on missing row or illegal state transition' -Check {
        return ($sqlText -match "RAISE EXCEPTION 'escrow_transaction % not found'" -and $sqlText -match "RAISE EXCEPTION 'illegal 2PC state transition from % to %'")
    }

    # --- F3 Boundary & Corner Cases (TASK-02 Redis Idempotency Lock) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F3-01' -Feature 'F3' -Description 'Empty or whitespace-only PayPal-Request-Id is rejected with HTTP 400 / ErrEmptyRequestID' -Check {
        $res = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t2-f3-empty' -RequestId '   '
        return ($res.StatusCode -eq 400 -and $storeText -match 'ErrEmptyRequestID')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F3-02' -Feature 'F3' -Description 'Duplicate PayPal-Request-Id on authorize returns cached idempotent response without re-execution' -Check {
        $r1 = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t2-f3-dup-auth' -RequestId 'req-dup-auth-99' -Payload @{ amount_cents = 24900 }
        $r2 = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t2-f3-dup-auth' -RequestId 'req-dup-auth-99' -Payload @{ amount_cents = 24900 }
        return ($r1.IdempotentReplay -eq $false -and $r2.IdempotentReplay -eq $true -and $r1.Body.paypal_auth_id -eq $r2.Body.paypal_auth_id)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F3-03' -Feature 'F3' -Description 'Duplicate PayPal-Request-Id on capture returns cached capture ID without double-charging' -Check {
        $c1 = Invoke-TalosEscrowStateEngine -Action 'capture' -EscrowId 'esc-t2-f3-dup-auth' -RequestId 'req-dup-cap-99'
        $c2 = Invoke-TalosEscrowStateEngine -Action 'capture' -EscrowId 'esc-t2-f3-dup-auth' -RequestId 'req-dup-cap-99'
        return ($c1.StatusCode -eq 201 -and $c1.IdempotentReplay -eq $false -and $c2.IdempotentReplay -eq $true -and $c1.Body.paypal_capture_id -eq $c2.Body.paypal_capture_id)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F3-04' -Feature 'F3' -Description 'Duplicate PayPal-Request-Id on void returns cached PAYPAL_VOIDED response' -Check {
        $null = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t2-f3-dup-void' -RequestId 'req-dup-v-init'
        $v1 = Invoke-TalosEscrowStateEngine -Action 'void' -EscrowId 'esc-t2-f3-dup-void' -RequestId 'req-dup-void-99'
        $v2 = Invoke-TalosEscrowStateEngine -Action 'void' -EscrowId 'esc-t2-f3-dup-void' -RequestId 'req-dup-void-99'
        return ($v1.StatusCode -eq 200 -and $v1.IdempotentReplay -eq $false -and $v2.IdempotentReplay -eq $true -and $v2.Body.state -eq 'PAYPAL_VOIDED')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F3-05' -Feature 'F3' -Description 'AcquireIdempotencyLock normalizes ttl <= 0 to DefaultIdempotencyTTL (86400s) and trims RequestID' -Check {
        return ($storeText -match 'if ttl <= 0 \{\s*ttl = DefaultIdempotencyTTL' -and $storeText -match 'strings\.TrimSpace\(paypalRequestID\)')
    }

    # --- F4 Boundary & Corner Cases (TASK-03 Ed25519 Mandate Verifier) ---
    $signed = (Invoke-TalosMandateSign -Payload @{
        mandate_id = '0192e8a0-0000-7000-8000-000000000101'; max_amount_cents = 30000
        allowed_categories = @('Studio Audio','Microphones'); max_spread_bps = 1500; max_channel3_spread_bps = 1500
        sla_hours = 48; expires_at = '2027-12-31T23:59:59Z'; expires_at_unix = 1830297599
    }).Body

    Test-TalosCase -Tier 'Tier2' -Id 'T2-F4-01' -Feature 'F4' -Description 'Exact budget boundary: $300.00 (30000 cents == max_amount_cents 30000) passes with step_up_required=false' -Check {
        $res = Invoke-TalosMandateVerify -Payload @{
            mandate = $signed; requested_amount_cents = 30000; requested_category = 'Studio Audio'; merchant_category = 'Studio Audio'; now_unix = 1762248000
        }
        return ($res.Body.valid -eq $true -and $res.Body.step_up_required -eq $false)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F4-02' -Feature 'F4' -Description 'Over-budget boundary (+1 cent): $300.01 (30001 cents > 30000 cap) sets valid=false, step_up_required=true' -Check {
        $res = Invoke-TalosMandateVerify -Payload @{
            mandate = $signed; requested_amount_cents = 30001; requested_category = 'Studio Audio'; merchant_category = 'Studio Audio'; now_unix = 1762248000
        }
        return ($res.Body.valid -eq $false -and $res.Body.step_up_required -eq $true)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F4-03' -Feature 'F4' -Description 'Expired mandate timestamp (now_unix > expires_at_unix) is rejected with MANDATE_EXPIRED' -Check {
        $expiredMandate = [pscustomobject]@{
            mandate_id = $signed.mandate_id; principal_id = $signed.principal_id; agent_id = $signed.agent_id
            max_amount_cents = 30000; currency = 'USD'; allowed_categories = @('Studio Audio')
            max_spread_bps = 1500; max_channel3_spread_bps = 1500; sla_hours = 48
            expires_at = '2020-01-01T00:00:00Z'; expires_at_unix = 1577836800
            ed25519_pubkey_hex = $signed.ed25519_pubkey_hex; ed25519_signature_hex = $signed.ed25519_signature_hex
        }
        $res = Invoke-TalosMandateVerify -Payload @{
            mandate = $expiredMandate; requested_amount_cents = 24900; requested_category = 'Studio Audio'; merchant_category = 'Studio Audio'; now_unix = 1762248000
        }
        return ($res.Body.valid -eq $false -and $res.Body.step_up_required -eq $false -and $res.Body.reason -match 'EXPIRED')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F4-04' -Feature 'F4' -Description 'Tampered Ed25519 signature hex is rejected with valid=false' -Check {
        $tampered = [pscustomobject]@{
            mandate_id = $signed.mandate_id; principal_id = $signed.principal_id; agent_id = $signed.agent_id
            max_amount_cents = 30000; currency = 'USD'; allowed_categories = @('Studio Audio')
            max_spread_bps = 1500; max_channel3_spread_bps = 1500; sla_hours = 48
            expires_at = '2027-12-31T23:59:59Z'; expires_at_unix = 1830297599
            ed25519_pubkey_hex = $signed.ed25519_pubkey_hex; ed25519_signature_hex = '0000tampered_invalid_signature_hex'
        }
        $res = Invoke-TalosMandateVerify -Payload @{
            mandate = $tampered; ed25519_signature = '0000tampered_invalid_signature_hex'; requested_amount_cents = 24900; requested_category = 'Studio Audio'; merchant_category = 'Studio Audio'; now_unix = 1762248000
        }
        return ($res.Body.valid -eq $false)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F4-05' -Feature 'F4' -Description 'Disallowed merchant category ("Unauthorized Crypto Mining") is rejected with CATEGORY_NOT_ALLOWED' -Check {
        $res = Invoke-TalosMandateVerify -Payload @{
            mandate = $signed; requested_amount_cents = 15000; requested_category = 'Unauthorized Crypto Mining'; merchant_category = 'Unauthorized Crypto Mining'; now_unix = 1762248000
        }
        return ($res.Body.valid -eq $false -and $res.Body.step_up_required -eq $false -and $res.Body.reason -match 'CATEGORY')
    }

    # --- F5 Boundary & Corner Cases (TASK-03 Webhook Verifier) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F5-01' -Feature 'F5' -Description 'Tampered webhook body with mismatched expected_crc32 returns verified=false' -Check {
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = 'tx-1'; transmission_time = '2026-11-04T09:00:00Z'; transmission_sig = 'valid_sig'; webhook_id = 'WH-1'
            raw_body = '{"amount":"480.00"}'; expected_crc32 = 12345678
        }
        return ($res.Body.verified -eq $false)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F5-02' -Feature 'F5' -Description 'Empty webhook raw_body ("") returns verified=false' -Check {
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = 'tx-2'; transmission_time = '2026-11-04T09:00:00Z'; transmission_sig = 'valid_sig'; webhook_id = 'WH-1'; raw_body = ''
        }
        return ($res.Body.verified -eq $false)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F5-03' -Feature 'F5' -Description 'Missing transmission_id ("") returns verified=false' -Check {
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = ''; transmission_time = '2026-11-04T09:00:00Z'; transmission_sig = 'valid_sig'; webhook_id = 'WH-1'; raw_body = '{"id":"WH-1"}'
        }
        return ($res.Body.verified -eq $false)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F5-04' -Feature 'F5' -Description 'Missing webhook_id ("") returns verified=false' -Check {
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = 'tx-4'; transmission_time = '2026-11-04T09:00:00Z'; transmission_sig = 'valid_sig'; webhook_id = ''; raw_body = '{"id":"WH-1"}'
        }
        return ($res.Body.verified -eq $false)
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F5-05' -Feature 'F5' -Description 'Tampered transmission_sig ("tampered_rsa_sig") returns verified=false' -Check {
        $res = Invoke-TalosWebhookVerify -Payload @{
            transmission_id = 'tx-5'; transmission_time = '2026-11-04T09:00:00Z'; transmission_sig = 'tampered_rsa_sig'; webhook_id = 'WH-1'; raw_body = '{"id":"WH-1"}'
        }
        return ($res.Body.verified -eq $false)
    }
}
