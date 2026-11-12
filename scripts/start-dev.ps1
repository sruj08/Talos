<#
.SYNOPSIS
    Starts all three TALOS services (Rust Firewall, Go Orchestrator, Next.js Web Console)
    with strict port isolation and verified health checks.
.DESCRIPTION
    1. talos-firewall-rs on http://127.0.0.1:8081
    2. talos-orchestrator-go on http://127.0.0.1:8082
    3. talos-console-web on http://127.0.0.1:3000
.PARAMETER Detached
    If specified, exits after all services are healthy instead of supervising.
#>

param(
    [switch]$Detached
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                TALOS DEVELOPMENT ENVIRONMENT                    " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Load .env into process environment safely (never print secrets)
$envPath = Join-Path $RepoRoot ".env"
$envDict = [System.Collections.Generic.Dictionary[string, string]]::new()
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $k = $parts[0].Trim()
            $v = $parts[1].Trim().Trim('"').Trim("'")
            if (-not [string]::IsNullOrEmpty($k)) {
                $envDict[$k] = $v
                [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
            }
        }
    }
}

function Test-EndpointReady($url) {
    try {
        $res = Invoke-RestMethod -Method Get -Uri $url -TimeoutSec 1 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Start-TalosProcess {
    param(
        [string]$FileName,
        [string]$Arguments = "",
        [string]$WorkingDirectory,
        [hashtable]$CustomEnv = @{}
    )
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $FileName
    if ($Arguments) { $psi.Arguments = $Arguments }
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    # Populate process env
    foreach ($entry in $envDict.GetEnumerator()) {
        $psi.EnvironmentVariables[$entry.Key] = $entry.Value
    }
    # Apply custom overrides
    foreach ($k in $CustomEnv.Keys) {
        $psi.EnvironmentVariables[$k] = [string]$CustomEnv[$k]
    }

    return [System.Diagnostics.Process]::Start($psi)
}

$fwProc = $null
$goProc = $null
$webProc = $null

# 2. Rust Firewall (:8081)
if (-not (Test-EndpointReady "http://127.0.0.1:8081/healthz")) {
    Write-Host "[1/3] Starting talos-firewall-rs on http://127.0.0.1:8081..." -ForegroundColor Yellow
    $fwBin = Join-Path $RepoRoot "services\firewall-rs\target\debug\talos-firewall-rs.exe"
    if (-not (Test-Path $fwBin)) {
        Write-Host "  Building Rust firewall..." -ForegroundColor DarkGray
        Start-Process -FilePath "cargo" -ArgumentList "build" -WorkingDirectory (Join-Path $RepoRoot "services\firewall-rs") -Wait -NoNewWindow
    }
    $fwProc = Start-TalosProcess -FileName $fwBin -WorkingDirectory (Join-Path $RepoRoot "services\firewall-rs") -CustomEnv @{
        "PORT" = "8081"
        "RUST_FIREWALL_PORT" = "8081"
        "RUST_LOG" = "info"
    }
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-EndpointReady "http://127.0.0.1:8081/healthz") { break }
        Start-Sleep -Milliseconds 150
    }
}

if (Test-EndpointReady "http://127.0.0.1:8081/healthz") {
    Write-Host "  [OK] talos-firewall-rs is ONLINE (http://127.0.0.1:8081)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] talos-firewall-rs failed to respond on http://127.0.0.1:8081/healthz" -ForegroundColor Red
}

# 3. Go Orchestrator (:8082)
if (-not (Test-EndpointReady "http://127.0.0.1:8082/healthz")) {
    Write-Host "[2/3] Starting talos-orchestrator-go on http://127.0.0.1:8082..." -ForegroundColor Yellow
    $goBin = Join-Path $RepoRoot "services\orchestrator-go\talos-orchestrator.exe"
    if (-not (Test-Path $goBin)) {
        Write-Host "  Building Go orchestrator..." -ForegroundColor DarkGray
        Start-Process -FilePath "go" -ArgumentList "build -o talos-orchestrator.exe ./cmd/server" -WorkingDirectory (Join-Path $RepoRoot "services\orchestrator-go") -Wait -NoNewWindow
    }
    $goProc = Start-TalosProcess -FileName $goBin -WorkingDirectory (Join-Path $RepoRoot "services\orchestrator-go") -CustomEnv @{
        "PORT" = "8082"
        "GO_ORCHESTRATOR_PORT" = "8082"
        "RUST_FIREWALL_URL" = "http://127.0.0.1:8081"
    }
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-EndpointReady "http://127.0.0.1:8082/healthz") { break }
        Start-Sleep -Milliseconds 150
    }
}

if (Test-EndpointReady "http://127.0.0.1:8082/healthz") {
    Write-Host "  [OK] talos-orchestrator-go is ONLINE (http://127.0.0.1:8082)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] talos-orchestrator-go failed to respond on http://127.0.0.1:8082/healthz" -ForegroundColor Red
}

# 4. Next.js Web Console (:3000)
$webDir = Join-Path $RepoRoot "web"
if (-not (Test-EndpointReady "http://127.0.0.1:3000/api/healthz")) {
    Write-Host "[3/3] Starting talos-console-web on http://127.0.0.1:3000..." -ForegroundColor Yellow
    $webProc = Start-TalosProcess -FileName "cmd.exe" -Arguments "/c npm run dev -- -p 3000" -WorkingDirectory $webDir -CustomEnv @{
        "PORT" = "3000"
        "NEXT_PUBLIC_ORCHESTRATOR_URL" = "http://localhost:8082"
        "NEXT_PUBLIC_ORCHESTRATOR_WS_URL" = "ws://localhost:8082/ws/events"
    }
    for ($i = 0; $i -lt 50; $i++) {
        if (Test-EndpointReady "http://127.0.0.1:3000/api/healthz") { break }
        Start-Sleep -Milliseconds 250
    }
}

if (Test-EndpointReady "http://127.0.0.1:3000/api/healthz") {
    Write-Host "  [OK] talos-console-web is ONLINE (http://127.0.0.1:3000)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] talos-console-web failed to respond on http://127.0.0.1:3000/api/healthz" -ForegroundColor Red
}

Write-Host "`n=== Service Status Matrix ===" -ForegroundColor Cyan
@(
    [PSCustomObject]@{
        Service = "talos-firewall-rs"
        Port = 8081
        Health = if (Test-EndpointReady "http://127.0.0.1:8081/healthz") { "ONLINE (OK)" } else { "OFFLINE" }
        URL = "http://127.0.0.1:8081/healthz"
    },
    [PSCustomObject]@{
        Service = "talos-orchestrator-go"
        Port = 8082
        Health = if (Test-EndpointReady "http://127.0.0.1:8082/healthz") { "ONLINE (OK)" } else { "OFFLINE" }
        URL = "http://127.0.0.1:8082/healthz"
    },
    [PSCustomObject]@{
        Service = "talos-console-web"
        Port = 3000
        Health = if (Test-EndpointReady "http://127.0.0.1:3000/api/healthz") { "ONLINE (OK)" } else { "OFFLINE" }
        URL = "http://127.0.0.1:3000"
    }
) | Format-Table -AutoSize

Write-Host "TALOS Financial Command Center is running at http://localhost:3000`n" -ForegroundColor Green

if (-not $Detached) {
    Write-Host "Services are running. Press Ctrl+C to terminate all services.`n" -ForegroundColor Cyan
    try {
        while ($true) {
            Start-Sleep -Seconds 5
            if ($fwProc -and $fwProc.HasExited) {
                Write-Warning "talos-firewall-rs exited with code $($fwProc.ExitCode)"
            }
            if ($goProc -and $goProc.HasExited) {
                Write-Warning "talos-orchestrator exited with code $($goProc.ExitCode)"
            }
            if ($webProc -and $webProc.HasExited) {
                Write-Warning "talos-console-web exited with code $($webProc.ExitCode)"
            }
        }
    } finally {
        Write-Host "`nShutting down TALOS services..." -ForegroundColor Yellow
        & (Join-Path $PSScriptRoot "stop-dev.ps1")
    }
}
