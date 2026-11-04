# Tier 2 -- Boundary & Corner Cases: Features F11 through F15 (25 Test Cases)
# Covers TASK-08 (F11), TASK-09 (F12), TASK-10 (F13), TASK-11 (F14), and TASK-12 (F15). Strictly < 250 lines.

function Invoke-TalosTier2F11ToF15 {
    Write-Host "`n=== TIER 2 (PART 3): BOUNDARY & CORNER CASES F11..F15 (25 TEST CASES) ===" -ForegroundColor Cyan
    $bsText = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\BryntumSlaBoard.tsx') -Raw
    $ubText = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\hooks\useBryntumTimeline.ts') -Raw
    $pmText = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\PayPalStepUpModal.tsx') -Raw
    $upText = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\hooks\usePayPalStepUp.ts') -Raw
    $psText = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\PoisonedStoreSim.tsx') -Raw
    $rtText = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\app\api\mcp\paypal-bridge\route.ts') -Raw
    $p6Text = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\lib\phase6-events.ts') -Raw

    # --- F11 Boundary & Corner Cases (TASK-08 Unified Checkout, Tracking, Disputes) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F11-01' -Feature 'F11' -Description 'API-05 (/api/v1/checkout/evaluate) defines 422 ProblemDetails response on DOM injection or price gouging' -Check {
        $oa = Get-Content (Join-Path $Global:TalosRepoRoot 'api\openapi.yaml') -Raw
        return ($oa -match '"422":' -and $oa -match 'Blocked by Rust DOM Firewall or Channel3 Price-Gouging Oracle' -and $oa -match 'ProblemDetails')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F11-02' -Feature 'F11' -Description 'API-05 (/api/v1/checkout/evaluate) defines 202 Accepted response when step-up co-sign is required (>$300)' -Check {
        $oa = Get-Content (Join-Path $Global:TalosRepoRoot 'api\openapi.yaml') -Raw
        return ($oa -match '"202":' -and $oa -match 'Exceeds autonomous cap; step-up co-sign required')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F11-03' -Feature 'F11' -Description 'API-08 (/api/v1/escrow/{id}/tracking) with status=IN_TRANSIT sets TRACKING_VERIFIED without premature capture' -Check {
        $null = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t2-f11-transit' -RequestId 'req-transit-auth'
        $res = Invoke-TalosEscrowStateEngine -Action 'tracking' -EscrowId 'esc-t2-f11-transit' -RequestId 'req-transit-trk' -Payload @{
            carrier = 'FEDEX'; tracking_number = '794892104852'; status = 'IN_TRANSIT'; auto_capture_on_delivery = $true
        }
        return ($res.StatusCode -eq 200 -and $res.Body.auto_capture_triggered -eq $false -and $res.Body.new_escrow_state -eq 'TRACKING_VERIFIED')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F11-04' -Feature 'F11' -Description 'API-08 (/api/v1/escrow/{id}/tracking) with status=SLA_BREACHED transitions escrow to PAYPAL_VOIDED' -Check {
        $null = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t2-f11-breach' -RequestId 'req-breach-auth'
        $res = Invoke-TalosEscrowStateEngine -Action 'tracking' -EscrowId 'esc-t2-f11-breach' -RequestId 'req-breach-trk' -Payload @{
            carrier = 'DHL'; tracking_number = '992184710293'; status = 'SLA_BREACHED'; auto_capture_on_delivery = $true
        }
        return ($res.StatusCode -eq 200 -and $res.Body.auto_capture_triggered -eq $false -and $res.Body.new_escrow_state -eq 'PAYPAL_VOIDED')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F11-05' -Feature 'F11' -Description 'API-08 (/api/v1/escrow/{id}/tracking) on already PAYPAL_VOIDED escrow is rejected with HTTP 409' -Check {
        $res = Invoke-TalosEscrowStateEngine -Action 'tracking' -EscrowId 'esc-t2-f11-breach' -RequestId 'req-breach-trk-after-void' -Payload @{
            carrier = 'DHL'; tracking_number = '992184710293'; status = 'DELIVERED'; auto_capture_on_delivery = $true
        }
        return ($res.StatusCode -eq 409)
    }

    # --- F12 Boundary & Corner Cases (TASK-09 Command Center Shell, MandateStudio, useEscrowStream) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F12-01' -Feature 'F12' -Description 'broadcastTalosEscrowEvent guards typeof window === "undefined" for SSR safety' -Check {
        return ($p6Text -match "if \(typeof window === 'undefined'\) return;")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F12-02' -Feature 'F12' -Description 'formatUsdInr formats dual-currency USD ($) and INR values with 2-decimal precision' -Check {
        return ($p6Text -match 'toFixed\(2\)' -and $p6Text -match "toLocaleString\('en-IN'\)")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F12-03' -Feature 'F12' -Description 'callEscrowVoidApi falls back to deterministic Sandbox Replay Mode when Go orchestrator is offline' -Check {
        return ($p6Text -match 'Deterministic Sandbox Replay Mode when Go orchestrator is offline' -and $p6Text -match "state:\s*'PAYPAL_VOIDED'")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F12-04' -Feature 'F12' -Description 'INITIAL_SLA_TASKS seeds multi-vendor lanes with 48h SLA deadlines and 72h/29d PayPal honor windows' -Check {
        return ($p6Text -match 'slaDeadlineHours:\s*48' -and $p6Text -match 'authHonorHours:\s*72' -and $p6Text -match 'authExpiryDays:\s*29')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F12-05' -Feature 'F12' -Description 'All TypeScript/React source files in web/src/ are < 255 lines (modular limit check)' -Check {
        $tsFiles = Get-ChildItem (Join-Path $Global:TalosRepoRoot 'web\src') -Include '*.ts','*.tsx' -Recurse
        foreach ($f in $tsFiles) {
            if ((Get-Content $f.FullName).Count -gt 255) { return $false }
        }
        return ($tsFiles.Count -ge 8)
    }

    # --- F13 Boundary & Corner Cases (TASK-10 AgStudioBlotter & ForensicDetailPanel) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F13-01' -Feature 'F13' -Description 'Placeholder NEXT_PUBLIC_AG_GRID_LICENSE_KEY in .env does not crash AG Grid initialization' -Check {
        $ag = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\AgStudioBlotter.tsx') -Raw
        return ($ag -notmatch 'throw new Error.*LICENSE')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F13-02' -Feature 'F13' -Description 'Empty query in buildAgStudioCopilotPlan defaults to Group by state and ALL_ESCROWS preset' -Check {
        return ($rtText -match "body\.natural_language_query \|\| 'Group by state and sum escrow volume'" -and $rtText -match "'ALL_ESCROWS'")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F13-03' -Feature 'F13' -Description 'Merchant/risk query in buildAgStudioCopilotPlan groups by merchant_name and sorts deberta_risk_score desc' -Check {
        return ($rtText -match "colId:\s*groupByMerchant \? 'merchant_name' : 'state'" -and $rtText -match "colId:\s*'deberta_risk_score',\s*sort:\s*filterBlocked \? 'desc' : null")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F13-04' -Feature 'F13' -Description 'Void/SLA query in buildAgStudioCopilotPlan switches chartType to bar and filter_preset to VOIDED_SLA' -Check {
        return ($rtText -match "chartType:\s*filterVoided \? 'bar' : 'groupedColumn'" -and $rtText -match "'VOIDED_SLA'")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F13-05' -Feature 'F13' -Description 'broadcastTalosEscrowEvent checks if blotterEl exists before setting DOM attributes' -Check {
        return ($p6Text -match 'if \(blotterEl\) \{' -and $p6Text -match 'data-last-escrow-state')
    }

    # --- F14 Boundary & Corner Cases (TASK-11 BryntumSlaBoard Two-Way Timeline) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F14-01' -Feature 'F14' -Description 'Exact 48h SLA boundary (nextHours <= task.slaDeadlineHours) updates hours without triggering PayPal VOID' -Check {
        return ($bsText -match 'if \(nextHours > task\.slaDeadlineHours\)' -and $bsText -match 'slaHoursElapsed:\s*nextHours')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F14-02' -Feature 'F14' -Description 'Over-48h SLA boundary (nextHours > task.slaDeadlineHours) triggers executeSlaBreachAndVoid' -Check {
        return ($bsText -match "executeSlaBreachAndVoid\(task,\s*nextHours,\s*'BRYNTUM_SLA_BAR_DRAGGED_PAST_DEADLINE'\)")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F14-03' -Feature 'F14' -Description 'executeSlaBreachAndVoid short-circuits if task.escrowState is already PAYPAL_VOIDED' -Check {
        return ($ubText -match "if \(task\.escrowState === 'PAYPAL_VOIDED'\) return;")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F14-04' -Feature 'F14' -Description 'Deliver/Void buttons disable on terminal states and Reroute button renders only when isVoided is true' -Check {
        return ($bsText -match 'disabled=\{isVoided \|\| isCaptured\}' -and $bsText -match 'disabled=\{isVoided\}' -and $bsText -match '\{isVoided \? \(')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F14-05' -Feature 'F14' -Description 'handleRerouteChannel3 deduplicates replacement task ID on repeated clicks' -Check {
        return ($ubText -match 'prev\.filter\(\(t\) => t\.id !== replacement\.id\)')
    }

    # --- F15 Boundary & Corner Cases (TASK-12 PayPalStepUpModal, PoisonedStoreSim & MCP Bridge) ---
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F15-01' -Feature 'F15' -Description 'PayPalStepUpModal clamps overageCents with Math.max(0, stepUp.amountCents - stepUp.mandateCapCents)' -Check {
        return ($pmText -match 'Math\.max\(0,\s*stepUp\.amountCents - stepUp\.mandateCapCents\)')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F15-02' -Feature 'F15' -Description 'PayPalStepUpModal falls back to clientId="sb" when NEXT_PUBLIC_PAYPAL_CLIENT_ID is unset' -Check {
        return ($pmText -match "process\.env\.NEXT_PUBLIC_PAYPAL_CLIENT_ID \|\| 'sb'")
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F15-03' -Feature 'F15' -Description 'Escape key press in usePayPalStepUp keeps order paused in STEP_UP_REQUIRED without approving' -Check {
        return ($upText -match "e\.key === 'Escape' && statusState === 'STEP_UP_REQUIRED'" -and $upText -match 'Order remains paused in STEP_UP_REQUIRED')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F15-04' -Feature 'F15' -Description 'POST /api/mcp/paypal-bridge catches malformed JSON bodies with req.json().catch(() => ({}))' -Check {
        return ($rtText -match 'req\.json\(\)\.catch\(\(\) => \(\{\}\)\)')
    }
    Test-TalosCase -Tier 'Tier2' -Id 'T2-F15-05' -Feature 'F15' -Description 'PoisonedStoreSim disables all 3 scenario buttons while a simulation is running (disabled={running})' -Check {
        $regexMatches = [regex]::Matches($psText, 'disabled=\{running\}')
        return ($regexMatches.Count -eq 3)
    }
}
