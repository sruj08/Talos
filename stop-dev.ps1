<#
.SYNOPSIS
    Stops all running TALOS services (Rust Firewall, Go Orchestrator, Next.js Web Console).
#>

Write-Host "Stopping TALOS background services..." -ForegroundColor Yellow

# 1. Stop talos-firewall-rs
Get-Process -Name "talos-firewall-rs" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    Write-Host "  [STOPPED] talos-firewall-rs (PID $($_.Id))" -ForegroundColor Green
}

# 2. Stop talos-orchestrator
Get-Process -Name "talos-orchestrator" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    Write-Host "  [STOPPED] talos-orchestrator (PID $($_.Id))" -ForegroundColor Green
}

# 3. Stop any listeners on ports 8081, 8082, 3000
foreach ($p in @(8081, 8082, 3000)) {
    $connections = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pidToKill in $connections) {
        $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
        $pName = if ($proc) { $proc.ProcessName } else { "Unknown" }
        # MiniTool ShadowMaker MTAgentService on 8080 is PID 5500, we don't touch 8080, only 8081, 8082, 3000
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        Write-Host "  [STOPPED] Listener on port ${p}: $pName (PID $pidToKill)" -ForegroundColor Green
    }
}

Write-Host "All TALOS services stopped.`n" -ForegroundColor Cyan
