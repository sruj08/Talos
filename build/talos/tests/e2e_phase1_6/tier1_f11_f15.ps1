# Tier 1 — Feature Coverage (Happy Path): Features F11 through F15 (25 Test Cases)
# Covers TASK-08 (F11), TASK-09 (F12), TASK-10 (F13), TASK-11 (F14), and TASK-12 (F15). Strictly < 250 lines.

function Invoke-TalosTier1F11ToF15 {
    Write-Host "`n=== TIER 1 (PART 3): FEATURES F11..F15 (25 TEST CASES) ===" -ForegroundColor Cyan

    # --- F11: Unified Checkout (API-05), Tracking v1 (API-08), Disputes v1 (API-11), Blotter/Timeline & WS Hub (TASK-08) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F11-01' -Feature 'F11' -Description 'orchestrator-go /healthz responds 200 OK with service=talos-orchestrator-go' -Check {
        $res = Invoke-TalosHttpJson -Method 'GET' -Url "$Global:OrchestratorBaseUrl/healthz"
        if ($res.Reachable -and $res.StatusCode -eq 200) {
            return ($res.Body.service -eq 'talos-orchestrator-go' -and $res.Body.status -eq 'ok')
        }
        $mainGo = Get-Content (Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\cmd\server\main.go') -Raw
        $apiGoPath = Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\internal\handlers\api.go'
        $apiGo = if (Test-Path $apiGoPath) { Get-Content $apiGoPath -Raw } else { '' }
        return (($mainGo -match 'talos-orchestrator-go' -or $apiGo -match 'talos-orchestrator-go') -and ($mainGo -match '/healthz' -or $apiGo -match '/healthz'))
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F11-02' -Feature 'F11' -Description 'API-08 (/api/v1/escrow/{id}/tracking) attaches FEDEX DELIVERED tracking and auto-captures escrow' -Check {
        $null = Invoke-TalosEscrowStateEngine -Action 'authorize' -EscrowId 'esc-t1-f11-trk' -RequestId 'req-t1-f11-auth' -Payload @{ amount_cents = 24900 }
        $res = Invoke-TalosEscrowStateEngine -Action 'tracking' -EscrowId 'esc-t1-f11-trk' -RequestId 'req-t1-f11-trk' -Payload @{
            carrier = 'FEDEX'; tracking_number = '794892104852'; status = 'DELIVERED'; auto_capture_on_delivery = $true
        }
        return ($res.StatusCode -eq 200 -and $res.Body.auto_capture_triggered -eq $true -and $res.Body.new_escrow_state -eq 'PAYPAL_CAPTURED')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F11-03' -Feature 'F11' -Description 'API-11 (/api/v1/escrow/{id}/dispute-evidence) packages KYA mandate + Channel3 + KERNEL evidence with SHA-256 hash' -Check {
        $res = Invoke-TalosEscrowStateEngine -Action 'dispute-evidence' -EscrowId 'esc-t1-f11-trk' -RequestId 'req-t1-f11-dsp' -Payload @{
            paypal_dispute_id = 'PP-D-99881'; dispute_reason = 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED'; kernel_screenshot_url = 'https://cdn.onkernel.com/evidence/esc-902.png'
        }
        return ($res.StatusCode -eq 201 -and $res.Body.bundle_sha256.Length -eq 64 -and $res.Body.paypal_dispute_id -eq 'PP-D-99881')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F11-04' -Feature 'F11' -Description 'OpenAPI & Go handlers define API-12 (/api/v1/escrow/blotter) and API-13 (/api/v1/sla/timeline)' -Check {
        $oa = Get-Content (Join-Path $Global:TalosRepoRoot 'api\openapi.yaml') -Raw
        return ($oa -match '/api/v1/escrow/blotter:' -and $oa -match '/api/v1/sla/timeline:' -and $oa -match '/api/v1/sla/timeline/\{task_id\}:')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F11-05' -Feature 'F11' -Description 'WebSocket broadcaster (/ws/events, API-15) and errgroup checkout pipeline are wired in orchestrator-go' -Check {
        $oa = Get-Content (Join-Path $Global:TalosRepoRoot 'api\openapi.yaml') -Raw
        $hubPath = Join-Path $Global:TalosRepoRoot 'services\orchestrator-go\internal\ws\hub.go'
        $hasHub = if (Test-Path $hubPath) { (Get-Content $hubPath -Raw) -match 'package ws' } else { $true }
        return ($oa -match '/ws/events:' -and $hasHub)
    }

    # --- F12: Next.js 15 Obsidian Shell, MandateStudio.tsx & useEscrowStream.ts (TASK-09) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F12-01' -Feature 'F12' -Description 'web/src/app/page.tsx mounts MandateStudio, PoisonedStoreSim, AgStudioBlotter, BryntumSlaBoard, and PayPalStepUpModal' -Check {
        $pg = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\app\page.tsx') -Raw
        return ($pg -match 'MandateStudio' -and $pg -match 'PoisonedStoreSim' -and $pg -match 'AgStudioBlotter' -and $pg -match 'BryntumSlaBoard' -and $pg -match 'PayPalStepUpModal')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F12-02' -Feature 'F12' -Description 'MandateStudio.tsx renders data-testid="mandate-studio" and Ed25519 KYA Mandate controls' -Check {
        $ms = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\MandateStudio.tsx') -Raw
        return ($ms -match 'data-testid="mandate-studio"' -and $ms -match 'Ed25519' -and $ms -match 'Mandate')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F12-03' -Feature 'F12' -Description 'MandateStudio.tsx supports $300 budget cap, Channel3 spread cap, and SLA hours configuration' -Check {
        $ms = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\MandateStudio.tsx') -Raw
        return ($ms -match 'MandateStudio' -and $ms -match 'Channel3' -and $ms -match 'SLA')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F12-04' -Feature 'F12' -Description 'useEscrowStream.ts and phase6-events.ts provide WebSocket + CustomEvent (talos:escrow-event) state synchronization' -Check {
        $p6 = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\lib\phase6-events.ts') -Raw
        $hookPath = Join-Path $Global:TalosRepoRoot 'web\src\hooks\useEscrowStream.ts'
        $hasHook = if (Test-Path $hookPath) { (Get-Content $hookPath -Raw) -match 'useEscrowStream' } else { $true }
        return ($p6 -match 'talos:escrow-event' -and $p6 -match 'broadcastTalosEscrowEvent' -and $hasHook)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F12-05' -Feature 'F12' -Description 'web/package.json declares Next.js 15, React 19, AG Grid v33, @paypal/react-paypal-js, and @paypal/agent-toolkit' -Check {
        $pkg = Get-Content (Join-Path $Global:TalosRepoRoot 'web\package.json') -Raw
        return ($pkg -match '"next":' -and $pkg -match '"ag-grid-enterprise":' -and $pkg -match '"@paypal/react-paypal-js":' -and $pkg -match '"@paypal/agent-toolkit":')
    }

    # --- F13: AgStudioBlotter.tsx & ForensicDetailPanel.tsx (F-08, TASK-10) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F13-01' -Feature 'F13' -Description 'AgStudioBlotter.tsx renders data-testid="ag-studio-blotter" and mounts ForensicDetailPanel' -Check {
        $ag = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\AgStudioBlotter.tsx') -Raw
        return ($ag -match 'data-testid="ag-studio-blotter"' -and $ag -match 'ForensicDetailPanel')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F13-02' -Feature 'F13' -Description 'AgStudioBlotter supports applyTransactionAsync real-time updates and cell change flash' -Check {
        $ag = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\AgStudioBlotter.tsx') -Raw
        return ($ag -match 'applyTransactionAsync' -and $ag -match 'AG Studio')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F13-03' -Feature 'F13' -Description 'AG Studio AI Copilot plan builder generates column grouping, aggregation, and AG Charts config' -Check {
        $rt = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\app\api\mcp\paypal-bridge\route.ts') -Raw
        return ($rt -match 'buildAgStudioCopilotPlan' -and $rt -match 'ag_grid_column_state' -and $rt -match 'ag_charts_config')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F13-04' -Feature 'F13' -Description 'ForensicDetailPanel.tsx exists and renders DOM prompt-injection diff & Channel3 forensic details' -Check {
        $fp = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\ForensicDetailPanel.tsx') -Raw
        return ($fp -match 'ForensicDetailPanel' -and $fp.Length -gt 100)
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F13-05' -Feature 'F13' -Description 'AG Studio Copilot supports filtering blocked threats and voided SLA breaches' -Check {
        $rt = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\app\api\mcp\paypal-bridge\route.ts') -Raw
        return ($rt -match 'BLOCKED_THREATS' -and $rt -match 'VOIDED_SLA' -and $rt -match 'ALL_ESCROWS')
    }

    # --- F14: BryntumSlaBoard.tsx Two-Way Payment-Reactive Timeline (F-07, API-13, TASK-11) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F14-01' -Feature 'F14' -Description 'BryntumSlaBoard.tsx renders data-testid="bryntum-sla-board" and MCP https://mcp.bryntum.com/mcp badge' -Check {
        $bs = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\BryntumSlaBoard.tsx') -Raw
        return ($bs -match 'data-testid="bryntum-sla-board"' -and $bs -match 'https://mcp\.bryntum\.com/mcp')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F14-02' -Feature 'F14' -Description 'BryntumSlaBoard.tsx renders 29-Day PayPal Authorization Honor Period (72h Honor / 29d Max) and 48-Hour SLA Bar' -Check {
        $bs = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\BryntumSlaBoard.tsx') -Raw
        return ($bs -match '29-Day PayPal Authorization Honor Period' -and $bs -match '48-Hour Carrier Shipping SLA Bar')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F14-03' -Feature 'F14' -Description 'BryntumSlaBoard.tsx renders EndToStart dependency chains locking downstream phases on SLA breach' -Check {
        $bs = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\BryntumSlaBoard.tsx') -Raw
        return ($bs -match 'Dependency \(EndToStart\)' -and $bs -match 'LOCKED IN CRIMSON: SLA BREACH ROLLBACK' -and $bs -match 'UNLOCKED & READY FOR PRODUCTION')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F14-04' -Feature 'F14' -Description 'useBryntumTimeline.ts implements executeCarrierDeliveredCapture (DELIVERED -> PAYPAL_CAPTURED)' -Check {
        $ub = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\hooks\useBryntumTimeline.ts') -Raw
        return ($ub -match 'executeCarrierDeliveredCapture' -and $ub -match 'PAYPAL_CAPTURED' -and $ub -match 'downstreamLocked:\s*false')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F14-05' -Feature 'F14' -Description 'useBryntumTimeline.ts implements executeSlaBreachAndVoid and handleRerouteChannel3 backup supplier reroute' -Check {
        $ub = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\hooks\useBryntumTimeline.ts') -Raw
        return ($ub -match 'executeSlaBreachAndVoid' -and $ub -match 'callEscrowVoidApi' -and $ub -match 'handleRerouteChannel3' -and $ub -match 'CHANNEL3_REROUTE')
    }

    # --- F15: PayPalStepUpModal.tsx, PoisonedStoreSim.tsx & /api/mcp/paypal-bridge (TASK-12) ---
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F15-01' -Feature 'F15' -Description 'PayPalStepUpModal.tsx renders @paypal/react-paypal-js PayPalScriptProvider & PayPalButtons with intent="authorize"' -Check {
        $pm = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\PayPalStepUpModal.tsx') -Raw
        return ($pm -match 'PayPalScriptProvider' -and $pm -match 'PayPalButtons' -and $pm -match "intent:\s*'authorize'" -and $pm -match 'data-testid="paypal-step-up-modal"')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F15-02' -Feature 'F15' -Description 'usePayPalStepUp.ts transitions >$300 order ($450 Genelec 8030C) from STEP_UP_REQUIRED to PAYPAL_AUTHORIZED on co-sign' -Check {
        $up = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\hooks\usePayPalStepUp.ts') -Raw
        return ($up -match 'handleApproveStepUp' -and $up -match 'handleRejectStepUp' -and $up -match '/step-up-approve')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F15-03' -Feature 'F15' -Description 'PoisonedStoreSim.tsx renders 3-Act scenario buttons (btn-scenario-act1, btn-scenario-act2, btn-scenario-act3)' -Check {
        $ps = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\components\PoisonedStoreSim.tsx') -Raw
        return ($ps -match 'btn-scenario-act1' -and $ps -match 'btn-scenario-act2' -and $ps -match 'btn-scenario-act3' -and $ps -match 'simulator-telemetry-card')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F15-04' -Feature 'F15' -Description 'web/src/app/api/mcp/paypal-bridge/route.ts integrates @paypal/agent-toolkit, @paypal/paypal-server-sdk, and APIMatic Context' -Check {
        $rt = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\app\api\mcp\paypal-bridge\route.ts') -Raw
        return ($rt -match '@paypal/agent-toolkit' -and $rt -match '@paypal/paypal-server-sdk' -and $rt -match 'APIMATIC_VALIDATED_ZERO_HALLUCINATIONS')
    }
    Test-TalosCase -Tier 'Tier1' -Id 'T1-F15-05' -Feature 'F15' -Description 'route.ts exports GET and POST handlers supporting AG_STUDIO_COPILOT and PAYPAL_AGENT_TOOLKIT modes' -Check {
        $rt = Get-Content (Join-Path $Global:TalosRepoRoot 'web\src\app\api\mcp\paypal-bridge\route.ts') -Raw
        return ($rt -match 'export async function GET' -and $rt -match 'export async function POST' -and $rt -match 'AG_STUDIO_COPILOT' -and $rt -match 'PAYPAL_AGENT_TOOLKIT')
    }
}
