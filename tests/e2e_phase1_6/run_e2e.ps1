param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"
$SuiteDir = $PSScriptRoot

. (Join-Path $SuiteDir "lib_assert.ps1")
. (Join-Path $SuiteDir "lib_contracts.ps1")
. (Join-Path $SuiteDir "tier1_f1_f5.ps1")
. (Join-Path $SuiteDir "tier1_f6_f10.ps1")
. (Join-Path $SuiteDir "tier1_f11_f15.ps1")
. (Join-Path $SuiteDir "tier2_f1_f5.ps1")
. (Join-Path $SuiteDir "tier2_f6_f10.ps1")
. (Join-Path $SuiteDir "tier2_f11_f15.ps1")
. (Join-Path $SuiteDir "tier3_pairwise.ps1")
. (Join-Path $SuiteDir "tier4_scenarios.ps1")

$Global:TalosRepoRoot = $RepoRoot

function Test-LocalPortOpen {
    param([int]$Port)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        $connected = $iar.AsyncWaitHandle.WaitOne(250, $false)
        if ($connected) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch {
        return $false
    }
}

$spawnedProcesses = @()
try {
    Write-Host "================================================================"
    Write-Host " TALOS Phase 1-6 Opaque-Box 4-Tier E2E Verification Suite"
    Write-Host " Workspace: $RepoRoot"
    Write-Host "================================================================"

    $envPath = Join-Path $RepoRoot ".env"
    if (-not (Test-Path $envPath)) {
        $envPath = Join-Path $RepoRoot ".env.example"
    }
    $envMap = Import-TalosDotEnvSafe -EnvPath $envPath
    $baselineGitHead = (git -C $RepoRoot rev-parse HEAD).Trim()

    # Optional ephemeral service startup if pre-built binary exists and port is free
    $fwExe = Join-Path $RepoRoot "services\firewall-rs\target\debug\talos-firewall.exe"
    if ((-not (Test-LocalPortOpen -Port 8081)) -and (Test-Path $fwExe)) {
        try {
            $p = Start-Process -FilePath $fwExe -WorkingDirectory (Join-Path $RepoRoot "services\firewall-rs") -PassThru -WindowStyle Hidden
            $spawnedProcesses += $p
            Start-Sleep -Milliseconds 400
        } catch {}
    }

    # --- TIER 1: Feature Coverage (F1-F15, 75 tests) ---
    Invoke-TalosTier1F1ToF5
    Invoke-TalosTier1F6ToF10 -EnvMap $envMap
    Invoke-TalosTier1F11ToF15

    # --- TIER 2: Boundary & Corner Cases (F1-F15, 75 tests) ---
    Invoke-TalosTier2F1ToF5
    Invoke-TalosTier2F6ToF10
    Invoke-TalosTier2F11ToF15

    # --- TIER 3: Cross-Feature Pairwise Combinations (16 tests) ---
    Invoke-TalosTier3Pairwise

    # --- TIER 4: Real-World Application Scenarios (10 tests) ---
    Invoke-TalosTier4Scenarios -EnvMap $envMap -BaselineGitHead $baselineGitHead

    $t1Pass = [int]$Global:TalosE2eTierPassed['Tier1']
    $t1Tot  = [int]$Global:TalosE2eTierCounts['Tier1']
    $t2Pass = [int]$Global:TalosE2eTierPassed['Tier2']
    $t2Tot  = [int]$Global:TalosE2eTierCounts['Tier2']
    $t3Pass = [int]$Global:TalosE2eTierPassed['Tier3']
    $t3Tot  = [int]$Global:TalosE2eTierCounts['Tier3']
    $t4Pass = [int]$Global:TalosE2eTierPassed['Tier4']
    $t4Tot  = [int]$Global:TalosE2eTierCounts['Tier4']
    $totalTests = $Global:TalosE2ePassed + $Global:TalosE2eFailed

    Write-Host ""
    Write-Host "----------------------------------------------------------------"
    Write-Host (" Tier 1 (Feature Coverage F1-F15) : {0}/{1} passed" -f $t1Pass, $t1Tot)
    Write-Host (" Tier 2 (Boundary & Corner Cases) : {0}/{1} passed" -f $t2Pass, $t2Tot)
    Write-Host (" Tier 3 (Pairwise Combinations)   : {0}/{1} passed" -f $t3Pass, $t3Tot)
    Write-Host (" Tier 4 (Real-World Scenarios)    : {0}/{1} passed" -f $t4Pass, $t4Tot)
    Write-Host "----------------------------------------------------------------"
    Write-Host (" TOTAL E2E VERIFICATION RESULTS   : {0}/{1} PASSED ({2} FAILED)" -f $Global:TalosE2ePassed, $totalTests, $Global:TalosE2eFailed)
    Write-Host "================================================================"

    if ($Global:TalosE2eFailed -gt 0) {
        Write-Host "Failed Test Cases:" -ForegroundColor Red
        foreach ($fmsg in $Global:TalosE2eFailures) {
            Write-Host "  [FAIL] $fmsg" -ForegroundColor Red
        }
        exit 1
    }
    exit 0
} finally {
    foreach ($proc in $spawnedProcesses) {
        if ($null -ne $proc -and (-not $proc.HasExited)) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
