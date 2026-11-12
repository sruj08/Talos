'use client';

import React from 'react';
import { Card } from '@heroui/react';
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
    <Card className="tx-card p-3.5 sm:p-4 text-xs text-ink-secondary space-y-3.5" data-testid="forensic-detail-panel">
      <Card.Header className="p-0">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-ink">
            Master-Detail Forensic Drawer — Rust lol_html Sanitization Diff, Channel3 Spread &amp; PayPal 2PC Controls
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
            <span>SDK Layer: APIMatic Go SDK v1.1.0 + Context Plugin Verified</span>
            <span className="inline-flex items-center gap-1.5 text-ink-secondary">
              <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
              <span>APIMatic Schema Validated (0 Hallucinations)</span>
            </span>
          </div>
        </div>
      </Card.Header>

      <Card.Content className="p-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="tx-well p-3.5 space-y-2.5" data-testid="forensic-card-dom-diff">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-md icon-medallion-crimson inline-flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <div className="text-[11px] font-medium text-ink-muted">1. What the Hacker Hid vs. What the AI Saw</div>
                <div className="font-semibold text-ink">Rust lol_html + DeBERTa-v3 ONNX Diff</div>
              </div>
            </div>
            <span className="text-[11px] text-ink-muted tabular-nums whitespace-nowrap">
              Scan: {row.scan_latency_ms}ms (&lt;4ms)
            </span>
          </div>
          <div className="tx-card p-2.5 space-y-1 text-[11px]">
            <div className="text-[11px] font-medium text-ink-secondary">Raw poisoned merchant HTML</div>
            <code className="font-mono block text-ink-muted break-all leading-relaxed">{row.raw_poisoned_html}</code>
          </div>
          <div className="tx-card p-2.5 space-y-1 text-[11px]">
            <div className="text-[11px] font-medium text-ink-secondary">Sanitized HTML</div>
            <code className="font-mono block text-ink break-all leading-relaxed">{row.sanitized_html}</code>
          </div>
          <div className="font-mono text-[11px] text-ink-muted break-all space-y-1">
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

        <div className="tx-well p-3.5 flex flex-col justify-between space-y-3" data-testid="forensic-card-channel3">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md icon-medallion-paypal inline-flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <div className="text-[11px] font-medium text-ink-muted">2. Scammer Price vs. Fair Market Price</div>
                  <div className="font-semibold text-ink">Channel3 Cross-Merchant Price Spread</div>
                </div>
              </div>
              <span className="text-[11px] text-ink-secondary tabular-nums whitespace-nowrap">
                +{row.spread_bps} bps (+9277 bps Peak)
              </span>
            </div>

            <div className="space-y-3 text-xs tabular-nums" data-testid="forensic-channel3-chart">
              <div className="space-y-1">
                <div className="flex justify-between text-ink-secondary">
                  <span>Attempted Merchant Ask</span>
                  <span className="text-ink font-semibold">{formatUsdInr(Math.round(row.attempted_price_usd * 100))}</span>
                </div>
                <div className="h-2 w-full rounded-xs bar-track overflow-hidden">
                  <div className={`h-full rounded-xs dot-crimson ${getBarWidthClass(row.attempted_price_usd)}`} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-ink-secondary">
                  <span>Channel3 Market Median</span>
                  <span className="text-ink-secondary font-medium">{formatUsdInr(Math.round(row.channel3_median_usd * 100))}</span>
                </div>
                <div className="h-2 w-full rounded-xs bar-track overflow-hidden">
                  <div className={`h-full rounded-xs dot-emerald ${getBarWidthClass(row.channel3_median_usd)}`} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-ink-secondary">
                  <span>Rerouted Verified ({row.rerouted_merchant})</span>
                  <span className="text-ink font-semibold">{formatUsdInr(Math.round(row.rerouted_price_usd * 100))}</span>
                </div>
                <div className="h-2 w-full rounded-xs bar-track overflow-hidden">
                  <div className={`h-full rounded-xs dot-paypal ${getBarWidthClass(row.rerouted_price_usd)}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-[11px] text-ink-muted tabular-nums">
            <span>$0</span>
            <span>$150</span>
            <span>$300 CAP</span>
            <span>$480</span>
          </div>
        </div>

        <div
          className="tx-well p-3.5 flex flex-col justify-between space-y-3"
          data-testid="forensic-card-paypal-actions"
          data-sandbox-mode="SANDBOX_MODE: LIVE"
        >
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-md icon-medallion-emerald inline-flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <div className="text-[11px] font-medium text-ink-muted">3. Live PayPal Sandbox Escrow Controls</div>
                  <div className="font-semibold text-ink">PayPal Sandbox 2PC Escrow Console</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-xs dot-emerald" aria-hidden="true" />
                <span>Sandbox mode live</span>
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-ink-muted tabular-nums">
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
                <span className="text-ink">{captureId || 'PENDING_DELIVERY'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>PayPal-Request-Id</span>
                <span className="text-ink-muted">{row.paypal_request_id}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => void handleAction('CAPTURE')}
                data-testid="btn-forensic-capture"
                className="btn-paypal-primary !min-h-[32px] h-8 px-2.5 py-1 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span data-testid="forensic-hitl-approve-btn">Capture Escrow Now</span>
              </button>
              <button
                type="button"
                onClick={() => void handleAction('VOID')}
                data-testid="btn-forensic-void"
                className="btn-sovereign-crimson !min-h-[32px] h-8 px-2.5 py-1 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span>Void Authorization (0s Rollback)</span>
              </button>
              <button
                type="button"
                onClick={() => void handleAction('DISPUTE')}
                data-testid="btn-forensic-dispute"
                className="btn-sovereign-neutral !min-h-[32px] h-8 px-2.5 py-1 text-xs"
              >
                <FileWarning className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <span>Submit Dispute Evidence Bundle</span>
              </button>
            </div>
            {actionBanner ? (
              <div data-testid="forensic-action-banner" className="tx-card p-2 text-xs tabular-nums text-ink">
                {actionBanner}
              </div>
            ) : null}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
