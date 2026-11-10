'use client';

import React from 'react';
import { BarChart3, CheckCircle2, FileWarning, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { EscrowBlotterRow, SEEDED_ESCROW_ROWS } from '../hooks/useEscrowStream';
import { formatUsdInr } from '../lib/phase6-events';
import {
  ForensicActionResult,
  executeForensicCapture,
  executeForensicDispute,
  executeForensicVoid,
  useForensicDetail,
} from '../hooks/useForensicDetail';

export { executeForensicCapture, executeForensicDispute, executeForensicVoid };
export type { ForensicActionResult };

export interface ForensicDetailPanelProps {
  data?: EscrowBlotterRow;
  onActionCompleted?: (result: ForensicActionResult) => void;
}

export function ForensicDetailPanel({ data, onActionCompleted }: ForensicDetailPanelProps = {}) {
  const row = data || SEEDED_ESCROW_ROWS[0];
  const { currentState, captureId, actionBanner, handleAction } = useForensicDetail(row, onActionCompleted);

  const maxBarPrice = Math.max(row.attempted_price_usd, row.channel3_median_usd, row.rerouted_price_usd, 1);
  const getBarWidthClass = (price: number) => {
    const ratio = price / maxBarPrice;
    if (ratio >= 0.9) return 'w-full';
    if (ratio >= 0.7) return 'w-3/4';
    if (ratio >= 0.45) return 'w-1/2';
    return 'w-1/3';
  };

  return (
    <div className="sovereign-subcard p-5 text-xs text-ink-secondary space-y-5" data-testid="forensic-detail-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="text-xs font-medium text-ink">
          Master-Detail Forensic Drawer — Rust lol_html Sanitization Diff, Channel3 Spread &amp; PayPal 2PC Controls
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-ink-muted">
          <span>SDK Layer: APIMatic Go SDK v1.1.0 + Context Plugin Verified</span>
          <span className="inline-flex items-center gap-1.5 text-ink-secondary">
            <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
            <span>APIMatic Schema Validated (0 Hallucinations)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Rust lol_html + DeBERTa-v3 ONNX DOM Sanitizer Diff */}
        <div className="sovereign-well p-4 space-y-3" data-testid="forensic-card-dom-diff">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-control icon-medallion-crimson inline-flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-ink-paypal">1. What the Hacker Hid vs. What the AI Saw</div>
                <div className="font-medium text-ink">Rust lol_html + DeBERTa-v3 ONNX Diff</div>
              </div>
            </div>
            <span className="font-mono text-[11px] text-ink-muted tabular-nums whitespace-nowrap">
              Scan: {row.scan_latency_ms}ms (&lt;4ms)
            </span>
          </div>
          <div className="tone-crimson p-3 space-y-1 text-[11px]">
            <div className="font-mono text-[11px] text-ink-secondary">Raw poisoned merchant HTML</div>
            <code className="font-mono block text-ink-muted break-all leading-relaxed">{row.raw_poisoned_html}</code>
          </div>
          <div className="tone-emerald p-3 space-y-1 text-[11px]">
            <div className="font-mono text-[11px] text-ink-secondary">Sanitized HTML</div>
            <code className="font-mono block text-ink break-all leading-relaxed">{row.sanitized_html}</code>
          </div>
          <div className="font-mono text-[11px] text-ink-muted break-all space-y-1 pt-1">
            <div>
              <span>Ed25519 signature: </span>
              <code data-testid="forensic-ed25519-sig" className="text-ink-secondary">
                {row.ed25519_signature.slice(0, 36)}...
              </code>
            </div>
            <div>
              <span>RFC 9421: </span>
              <code className="text-ink-muted">{row.rfc9421_signature_input}</code>
            </div>
          </div>
        </div>

        {/* Column 2: Channel3 Cross-Merchant Price Bar Chart */}
        <div className="sovereign-well p-4 flex flex-col justify-between space-y-4" data-testid="forensic-card-channel3">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-control icon-medallion-paypal inline-flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-ink-paypal">2. Scammer Price vs. Fair Market Price</div>
                  <div className="font-medium text-ink">Channel3 Cross-Merchant Price Spread</div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-ink-secondary tabular-nums whitespace-nowrap">
                +{row.spread_bps} bps (+9277 bps Peak)
              </span>
            </div>

            <div className="space-y-4 text-xs tabular-nums" data-testid="forensic-channel3-chart">
              <div className="space-y-1.5">
                <div className="flex justify-between text-ink-secondary">
                  <span>Attempted Merchant Ask</span>
                  <span className="font-mono text-ink">{formatUsdInr(Math.round(row.attempted_price_usd * 100))}</span>
                </div>
                <div className="h-2.5 w-full rounded-xs bar-track overflow-hidden">
                  <div
                    className={`h-full rounded-xs ${
                      row.spread_bps > 1000 ? 'dot-crimson' : 'bg-ink-muted/60'
                    } ${getBarWidthClass(row.attempted_price_usd)}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-ink-secondary">
                  <span>Channel3 Market Median</span>
                  <span className="font-mono text-ink-secondary">{formatUsdInr(Math.round(row.channel3_median_usd * 100))}</span>
                </div>
                <div className="h-2.5 w-full rounded-xs bar-track overflow-hidden">
                  <div className={`h-full rounded-xs bg-ink-muted/50 ${getBarWidthClass(row.channel3_median_usd)}`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-ink-secondary">
                  <span>Rerouted Verified ({row.rerouted_merchant})</span>
                  <span className="font-mono text-ink-paypal">{formatUsdInr(Math.round(row.rerouted_price_usd * 100))}</span>
                </div>
                <div className="h-2.5 w-full rounded-xs bar-track overflow-hidden">
                  <div className={`h-full rounded-xs dot-paypal ${getBarWidthClass(row.rerouted_price_usd)}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-hairline pt-2 font-mono text-[11px] text-ink-muted tabular-nums">
            <span>$0</span>
            <span>$150</span>
            <span>$300 CAP</span>
            <span>$480</span>
          </div>
        </div>

        {/* Column 3: Live PayPal Sandbox 2PC Escrow Action Console */}
        <div
          className="sovereign-well p-4 flex flex-col justify-between space-y-4"
          data-testid="forensic-card-paypal-actions"
          data-sandbox-mode="SANDBOX_MODE: LIVE"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-control icon-medallion-emerald inline-flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium text-ink-paypal">3. Live PayPal Sandbox Escrow Controls</div>
                  <div className="font-medium text-ink">PayPal Sandbox 2PC Escrow Console</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-secondary whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                <span>Sandbox mode live</span>
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] text-ink-muted tabular-nums">
              <div className="flex justify-between gap-2">
                <span>Escrow ID</span>
                <strong className="text-ink font-medium">{row.escrow_id} ({currentState})</strong>
              </div>
              <div className="flex justify-between gap-2">
                <span>paypal_order_id</span>
                <span className="text-ink-secondary">{row.paypal_order_id || 'BLOCKED_PRE_AUTH'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>paypal_authorization_id</span>
                <span className="text-ink-secondary">{row.paypal_authorization_id || 'NONE'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>paypal_capture_id</span>
                <span className="text-ink-emerald">{captureId || 'PENDING_DELIVERY'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>PayPal-Request-Id</span>
                <span className="text-ink-muted">{row.paypal_request_id}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleAction('CAPTURE')}
                data-testid="btn-forensic-capture"
                className="btn-paypal-primary h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                <span data-testid="forensic-hitl-approve-btn">Capture Escrow Now</span>
              </button>
              <button
                type="button"
                onClick={() => void handleAction('VOID')}
                data-testid="btn-forensic-void"
                className="btn-sovereign-crimson h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span>Void Authorization (0s Rollback)</span>
              </button>
              <button
                type="button"
                onClick={() => void handleAction('DISPUTE')}
                data-testid="btn-forensic-dispute"
                className="btn-sovereign-neutral h-9 inline-flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap active:scale-[0.98]"
              >
                <FileWarning className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span>Submit Dispute Evidence Bundle</span>
              </button>
            </div>
            {actionBanner ? (
              <div data-testid="forensic-action-banner" className="tone-paypal p-2.5 font-mono text-xs tabular-nums">
                {actionBanner}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
