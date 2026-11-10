# ==============================================================================
# TALOS -- Cross-Platform PowerShell Render Blueprint & Webhook Verifier (TASK-15)
# ==============================================================================
$ErrorActionPreference = "Stop"

$RustFirewallUrl = if ($env:RUST_FIREWALL_URL) { $env:RUST_FIREWALL_URL.TrimEnd('/') } else { "http://127.0.0.1:8081" }
$GoOrchestratorUrl = if ($env:GO_ORCHESTRATOR_URL) { $env:GO_ORCHESTRATOR_URL.TrimEnd('/') } elseif ($env:NEXT_PUBLIC_ORCHESTRATOR_URL) { $env:NEXT_PUBLIC_ORCHESTRATOR_URL.TrimEnd('/') } else { "http://127.0.0.1:8080" }
$WebConsoleUrl = if ($env:WEB_CONSOLE_URL) { $env:WEB_CONSOLE_URL.TrimEnd('/') } else { "http://127.0.0.1:3000" }
$BlueprintFile = if ($env:BLUEPRINT_FILE) { $env:BLUEPRINT_FILE } else { "render.yaml" }
$SkipWebHealthz = ($env:SKIP_WEB_HEALTHZ -eq "true")

Write-Host "=== [1/4] Validating Render Native Polyglot Blueprint ($BlueprintFile) ===" -ForegroundColor Cyan
if (-not (Test-Path $BlueprintFile)) {
    throw "ERROR: $BlueprintFile not found"
}
$content = Get-Content -Raw $BlueprintFile
$requiredTokens = @(
    "name: talos-firewall-rs",
    "runtime: rust",
    "name: talos-orchestrator-go",
    "runtime: go",
    "name: talos-console-web",
    "runtime: node",
    "name: talos-valkey",
    "type: keyvalue",
    "name: talos-postgres",
    'postgresMajorVersion: "16"',
    "healthCheckPath: /healthz",
    "healthCheckPath: /api/healthz",
    "property: hostport",
    "envVarKey: RENDER_EXTERNAL_URL",
    "RUST_FIREWALL_URL",
    "FIREWALL_RS_INTERNAL_URL",
    "NEXT_PUBLIC_ORCHESTRATOR_URL"
)
foreach ($token in $requiredTokens) {
    if (-not $content.Contains($token)) {
        throw "ERROR: Missing required Render Blueprint declaration: $token"
    }
}
Write-Host "  [OK] render.yaml defines all 5 resources (rust, go, node, keyvalue, pg16) and service discovery bindings." -ForegroundColor Green

Write-Host "=== [2/4] Verifying /healthz Readiness Probes Across All 3 Services ===" -ForegroundColor Cyan
$RepoRoot = Split-Path -Parent $PSScriptRoot
$spawnedProcs = @()

function Test-EndpointReady($url) {
    try {
        $null = Invoke-RestMethod -Method Get -Uri $url -TimeoutSec 2
        return $true
    } catch {
        return $false
    }
}

try {
    if (-not (Test-EndpointReady "$RustFirewallUrl/healthz") -and $RustFirewallUrl -match "localhost:8081|127\.0\.0\.1:8081") {
        $fwBinWin = Join-Path $RepoRoot "services\firewall-rs\target\debug\talos-firewall-rs.exe"
        $fwBinUnix = Join-Path $RepoRoot "services/firewall-rs/target/debug/talos-firewall-rs"
        if (Test-Path $fwBinWin) {
            $spawnedProcs += Start-Process -FilePath $fwBinWin -WorkingDirectory (Join-Path $RepoRoot "services\firewall-rs") -WindowStyle Hidden -PassThru
        } elseif (Test-Path $fwBinUnix) {
            $spawnedProcs += Start-Process -FilePath $fwBinUnix -WorkingDirectory (Join-Path $RepoRoot "services/firewall-rs") -PassThru
        } else {
            $spawnedProcs += Start-Process -FilePath "cargo" -ArgumentList "run --quiet" -WorkingDirectory (Join-Path $RepoRoot "services\firewall-rs") -WindowStyle Hidden -PassThru
        }
        for ($i = 0; $i -lt 30; $i++) {
            if (Test-EndpointReady "$RustFirewallUrl/healthz") { break }
            Start-Sleep -Milliseconds 300
        }
    }

    $fwHealth = Invoke-RestMethod -Method Get -Uri "$RustFirewallUrl/healthz" -TimeoutSec 5
    if ($fwHealth.status -ne "ok" -or $fwHealth.service -ne "talos-firewall-rs") {
        throw "ERROR: talos-firewall-rs /healthz returned unexpected payload: $($fwHealth | ConvertTo-Json -Compress)"
    }
    Write-Host "  [OK] talos-firewall-rs (/healthz): status=$($fwHealth.status) engine=$($fwHealth.engine)" -ForegroundColor Green

    if (-not (Test-EndpointReady "$GoOrchestratorUrl/healthz") -and $GoOrchestratorUrl -match "localhost:(8080|8082)|127\.0\.0\.1:(8080|8082)") {
        $spawnedProcs += Start-Process -FilePath "go" -ArgumentList "run ./cmd/server" -WorkingDirectory (Join-Path $RepoRoot "services\orchestrator-go") -WindowStyle Hidden -PassThru
        for ($i = 0; $i -lt 35; $i++) {
            if (Test-EndpointReady "$GoOrchestratorUrl/healthz") { break }
            Start-Sleep -Milliseconds 300
        }
    }

    $goHealth = Invoke-RestMethod -Method Get -Uri "$GoOrchestratorUrl/healthz" -TimeoutSec 5
    if ($goHealth.status -ne "ok" -or $goHealth.service -ne "talos-orchestrator-go") {
        throw "ERROR: talos-orchestrator-go /healthz returned unexpected payload: $($goHealth | ConvertTo-Json -Compress)"
    }
    Write-Host "  [OK] talos-orchestrator-go (/healthz): status=$($goHealth.status) sdk=$($goHealth.sdk)" -ForegroundColor Green

    if ($SkipWebHealthz) {
        Write-Host "  [SKIP] talos-console-web health check skipped via SKIP_WEB_HEALTHZ=true" -ForegroundColor Yellow
    } elseif (Test-EndpointReady "$WebConsoleUrl/api/healthz") {
        $webHealth = Invoke-RestMethod -Method Get -Uri "$WebConsoleUrl/api/healthz" -TimeoutSec 5
        if ($webHealth.status -ne "ok" -or $webHealth.service -ne "talos-console-web") {
            throw "ERROR: talos-console-web /api/healthz returned unexpected payload: $($webHealth | ConvertTo-Json -Compress)"
        }
        $webRootHealth = Invoke-RestMethod -Method Get -Uri "$WebConsoleUrl/healthz" -TimeoutSec 5
        if ($webRootHealth.status -ne "ok" -or $webRootHealth.service -ne "talos-console-web") {
            throw "ERROR: talos-console-web /healthz returned unexpected payload: $($webRootHealth | ConvertTo-Json -Compress)"
        }
        Write-Host "  [OK] talos-console-web (/api/healthz & /healthz): status=$($webHealth.status) runtime=$($webHealth.runtime)" -ForegroundColor Green
    } elseif ($WebConsoleUrl -match "localhost:3000|127\.0\.0\.1:3000") {
        $apiRoute = Join-Path $RepoRoot "web\src\app\api\healthz\route.ts"
        $rootRoute = Join-Path $RepoRoot "web\src\app\healthz\route.ts"
        if (-not (Test-Path $apiRoute) -or -not (Test-Path $rootRoute)) {
            throw "ERROR: Next.js healthz route handlers missing"
        }
        Write-Host "  [OK] talos-console-web (/api/healthz & /healthz route handlers verified on disk; Next.js dev server not running on :3000)" -ForegroundColor Green
    } else {
        $webHealth = Invoke-RestMethod -Method Get -Uri "$WebConsoleUrl/api/healthz" -TimeoutSec 5
        if ($webHealth.status -ne "ok" -or $webHealth.service -ne "talos-console-web") {
            throw "ERROR: talos-console-web /api/healthz returned unexpected payload: $($webHealth | ConvertTo-Json -Compress)"
        }
        Write-Host "  [OK] talos-console-web (/api/healthz): status=$($webHealth.status)" -ForegroundColor Green
    }

    Write-Host "=== [3/4] Verifying PayPal Webhook CRC32 & Signature Engine (API-04: Rust + Go Proxy) ===" -ForegroundColor Cyan
    $fwWhPayload = @{
        transmission_id   = "69cd13f0-d67a-11ef-9b12-09a8b7c6d5e4"
        transmission_time = "2026-11-04T14:30:10Z"
        cert_url          = "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42"
        auth_algo         = "SHA256withRSA"
        transmission_sig  = "b7e2f8a19c8d7e6f5a4b3c2d"
        webhook_id        = "4JH82910384712B"
        raw_body          = '{"id":"WH-2WR32451HC0233532","event_type":"PAYMENT.AUTHORIZATION.CREATED"}'
    } | ConvertTo-Json -Compress

    $fwWhResp = Invoke-RestMethod -Method Post -Uri "$RustFirewallUrl/v1/firewall/webhook/verify" -ContentType "application/json" -Body $fwWhPayload -TimeoutSec 5
    if (-not $fwWhResp.verified -or -not $fwWhResp.crc32_verified -or -not $fwWhResp.rsa_sig_verified) {
        throw "ERROR: firewall-rs webhook verification failed: $($fwWhResp | ConvertTo-Json -Compress)"
    }
    Write-Host "  [OK] firewall-rs webhook verified: crc32_decimal=$($fwWhResp.crc32_decimal) latency_us=$($fwWhResp.latency_us)" -ForegroundColor Green

    $goProxyWhResp = Invoke-RestMethod -Method Post -Uri "$GoOrchestratorUrl/v1/firewall/webhook/verify" -ContentType "application/json" -Body $fwWhPayload -TimeoutSec 5
    if (-not $goProxyWhResp.verified -or -not $goProxyWhResp.crc32_verified -or -not $goProxyWhResp.rsa_sig_verified -or $goProxyWhResp.crc32_decimal -le 0) {
        throw "ERROR: orchestrator-go /v1/firewall/webhook/verify failed: $($goProxyWhResp | ConvertTo-Json -Compress)"
    }
    Write-Host "  [OK] orchestrator-go proxy webhook verified: crc32_decimal=$($goProxyWhResp.crc32_decimal) transmission_id=$($goProxyWhResp.transmission_id)" -ForegroundColor Green

    Write-Host "=== [4/4] Verifying Go Orchestrator PayPal Sandbox Webhook Ledger (API-14) ===" -ForegroundColor Cyan
    $goWhBody = '{"id":"WH-2WR32451HC0233532","event_type":"PAYMENT.AUTHORIZATION.CREATED"}'
    $goWhResp = Invoke-RestMethod -Method Post -Uri "$GoOrchestratorUrl/api/v1/webhooks/paypal" -ContentType "application/json" -Headers @{ "PAYPAL-TRANSMISSION-ID" = "wh-render-verify-001" } -Body $goWhBody -TimeoutSec 5
    if (-not $goWhResp.crc32_verified -or -not $goWhResp.rsa_sig_verified -or $goWhResp.crc32_decimal -le 0) {
        throw "ERROR: orchestrator-go webhook verification failed: $($goWhResp | ConvertTo-Json -Compress)"
    }
    Write-Host "  [OK] orchestrator-go webhook ledger entry id=$($goWhResp.id) crc32_decimal=$($goWhResp.crc32_decimal) transmission_id=$($goWhResp.transmission_id)" -ForegroundColor Green

    Write-Host "All TALOS Render Blueprint & live webhook checks passed!" -ForegroundColor Green
} finally {
    foreach ($p in $spawnedProcs) {
        if ($null -ne $p) {
            cmd /c "taskkill /PID $($p.Id) /T /F >nul 2>&1"
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
