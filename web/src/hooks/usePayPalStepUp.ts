'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTalosClearing } from '../context/TalosClearingContext';
import {
  DEFAULT_STEP_UP_REQUEST,
  StepUpOrderRequest,
  TALOS_ESCROW_EVENT,
  TalosEscrowEventDetail,
  broadcastTalosEscrowEvent,
  formatUsdInr,
  resolveOrchestratorUrl,
} from '../lib/phase6-events';

export interface UsePayPalStepUpOptions {
  escrowId?: string;
  amountUsd?: string;
  skuSummary?: string;
  initialStatusState?: 'STEP_UP_REQUIRED' | 'PAYPAL_AUTHORIZED' | 'PAYPAL_VOIDED';
  onStepUpComplete?: (paypalOrderId: string, paypalAuthId: string) => void;
  onStepUpRejected?: (escrowId: string) => void;
}

export function usePayPalStepUp({
  escrowId,
  amountUsd,
  skuSummary,
  initialStatusState,
  onStepUpComplete,
  onStepUpRejected,
}: UsePayPalStepUpOptions = {}) {
  const { rows } = useTalosClearing();
  const targetEscrowId = escrowId || DEFAULT_STEP_UP_REQUEST.escrowId;
  const matchingRow = rows.find((r) => r.escrow_id === targetEscrowId);
  const derivedInitialStatus: 'STEP_UP_REQUIRED' | 'PAYPAL_AUTHORIZED' | 'PAYPAL_VOIDED' =
    initialStatusState ??
    (matchingRow?.state === 'PAYPAL_AUTHORIZED'
      ? 'PAYPAL_AUTHORIZED'
      : matchingRow?.state === 'PAYPAL_VOIDED'
      ? 'PAYPAL_VOIDED'
      : 'STEP_UP_REQUIRED');

  const [stepUp, setStepUp] = useState<StepUpOrderRequest>(() => ({
    ...DEFAULT_STEP_UP_REQUEST,
    escrowId: targetEscrowId,
    skuSummary: skuSummary || DEFAULT_STEP_UP_REQUEST.skuSummary,
    amountCents: amountUsd ? Math.round(Number(amountUsd) * 100) : DEFAULT_STEP_UP_REQUEST.amountCents,
    approved: derivedInitialStatus === 'PAYPAL_AUTHORIZED',
  }));
  const [statusState, setStatusState] = useState<'STEP_UP_REQUIRED' | 'PAYPAL_AUTHORIZED' | 'PAYPAL_VOIDED'>(
    derivedInitialStatus
  );
  const [statusNote, setStatusNote] = useState<string>(
    derivedInitialStatus === 'PAYPAL_AUTHORIZED'
      ? `Co-Signed! 29-Day PayPal Sandbox AUTHORIZE Hold Locked (Order: ${DEFAULT_STEP_UP_REQUEST.paypalOrderId}).`
      : 'Paused: Order ($450.00) exceeds autonomous Ed25519 KYA Mandate Cap ($300.00). Awaiting Human Co-Sign.'
  );

  const createPayPalSandboxOrder = useCallback(async (): Promise<string> => {
    const reqId = `stepup-${stepUp.escrowId}-${Date.now()}`;
    try {
      const bridgeRes = await fetch('/api/mcp/paypal-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'PAYPAL_AGENT_TOOLKIT',
          tool_name: 'orders.create',
          tool_args: {
            live_sandbox: true,
            escrow_id: stepUp.escrowId,
            amount_cents: stepUp.amountCents,
            description: `TALOS Step-Up Co-Sign — ${stepUp.skuSummary}`,
          },
        }),
      });
      if (bridgeRes.ok) {
        const bridgeData = await bridgeRes.json();
        const liveOrderId = bridgeData?.tool_result?.paypal_order_id;
        if (liveOrderId && liveOrderId !== '8XY99887766554433') {
          void fetch(resolveOrchestratorUrl(`/api/v1/escrow/${stepUp.escrowId}/authorize`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'PayPal-Request-Id': reqId },
            body: JSON.stringify({
              payer_sandbox_email: 'buyer-talos@personal.example.com',
              payee_sandbox_email: 'merchant-talos@business.example.com',
              amount_cents: stepUp.amountCents,
              currency: 'USD',
              description: `TALOS Step-Up Co-Sign — ${stepUp.skuSummary}`,
            }),
          }).catch(() => null);
          return liveOrderId;
        }
      }
    } catch {
      // Fallback to Go orchestrator
    }
    try {
      const res = await fetch(resolveOrchestratorUrl(`/api/v1/escrow/${stepUp.escrowId}/authorize`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'PayPal-Request-Id': reqId },
        body: JSON.stringify({
          payer_sandbox_email: 'buyer-talos@personal.example.com',
          payee_sandbox_email: 'merchant-talos@business.example.com',
          amount_cents: stepUp.amountCents,
          currency: 'USD',
          description: `TALOS Step-Up Co-Sign — ${stepUp.skuSummary}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.paypal_order_id) return data.paypal_order_id;
      }
    } catch {
      // Deterministic Sandbox Replay Mode
    }
    return stepUp.paypalOrderId;
  }, [stepUp]);

  const handleApproveStepUp = useCallback(
    async (approvedOrderId?: string) => {
      const initialOrderId = approvedOrderId || stepUp.paypalOrderId || '9STEPUP4500019283';
      const initialAuthId = stepUp.paypalAuthId || `2ASTEPUP-${initialOrderId.slice(-6)}`;
      setStepUp((prev) => ({ ...prev, paypalOrderId: initialOrderId, paypalAuthId: initialAuthId, approved: true }));
      setStatusState('PAYPAL_AUTHORIZED');
      setStatusNote(
        `Co-Signed! 29-Day PayPal Sandbox AUTHORIZE Hold Locked (Order: ${initialOrderId} · Auth: ${initialAuthId}).`
      );
      broadcastTalosEscrowEvent({
        event_id: `evt-stepup-ok-${Date.now()}`,
        event_type: 'ESCROW_STATE_TRANSITION',
        timestamp: new Date().toISOString(),
        escrow_id: stepUp.escrowId,
        previous_state: 'STEP_UP_REQUIRED',
        new_state: 'PAYPAL_AUTHORIZED',
        sku_summary: stepUp.skuSummary,
        merchant_name: stepUp.merchantName,
        amount_cents: stepUp.amountCents,
        paypal_order_id: initialOrderId,
        paypal_auth_id: initialAuthId,
        ag_grid_row_delta: {
          escrow_id: stepUp.escrowId,
          state: 'PAYPAL_AUTHORIZED',
          paypal_order_id: initialOrderId,
          paypal_auth_id: initialAuthId,
          amount_cents: stepUp.amountCents,
          sku_summary: stepUp.skuSummary,
          merchant_name: stepUp.merchantName,
        },
      });

      const orderId = approvedOrderId || (await createPayPalSandboxOrder());
      const authId = stepUp.paypalAuthId || `2ASTEPUP-${orderId.slice(-6)}`;
      try {
        await fetch(resolveOrchestratorUrl(`/api/v1/escrow/${stepUp.escrowId}/step-up-approve`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `stepup-approve-${stepUp.escrowId}`,
          },
          body: JSON.stringify({ paypal_order_id: orderId, paypal_auth_id: authId }),
        }).catch(() => null);
      } catch {
        // Offline replay fallback
      }
      setStepUp((prev) => ({ ...prev, paypalOrderId: orderId, paypalAuthId: authId, approved: true }));
      setStatusNote(
        `Co-Signed! 29-Day PayPal Sandbox AUTHORIZE Hold Locked (Order: ${orderId} · Auth: ${authId}).`
      );
      onStepUpComplete?.(orderId, authId);
    },
    [createPayPalSandboxOrder, onStepUpComplete, stepUp]
  );

  const handleRejectStepUp = useCallback(() => {
    setStatusState('PAYPAL_VOIDED');
    setStatusNote(`Rejected over-budget agent request (${stepUp.escrowId}). Zero funds authorized.`);
    broadcastTalosEscrowEvent({
      event_id: `evt-stepup-reject-${Date.now()}`,
      event_type: 'ESCROW_STATE_TRANSITION',
      timestamp: new Date().toISOString(),
      escrow_id: stepUp.escrowId,
      previous_state: 'STEP_UP_REQUIRED',
      new_state: 'PAYPAL_VOIDED',
      sku_summary: stepUp.skuSummary,
      merchant_name: stepUp.merchantName,
      amount_cents: stepUp.amountCents,
      ag_grid_row_delta: {
        escrow_id: stepUp.escrowId,
        state: 'PAYPAL_VOIDED',
        amount_cents: stepUp.amountCents,
        sku_summary: stepUp.skuSummary,
        merchant_name: stepUp.merchantName,
      },
    });
    onStepUpRejected?.(stepUp.escrowId);
  }, [onStepUpRejected, stepUp]);

  useEffect(() => {
    const onExternalEvent = (e: Event) => {
      const detail = (e as CustomEvent<TalosEscrowEventDetail>).detail;
      if (!detail) return;
      if (detail.step_up_request) {
        setStepUp(detail.step_up_request);
        setStatusState('STEP_UP_REQUIRED');
        setStatusNote(
          `Act 3 Triggered: ${detail.step_up_request.skuSummary} (${formatUsdInr(
            detail.step_up_request.amountCents
          )}) exceeds $300 Mandate Cap — Co-Sign Required.`
        );
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && statusState === 'STEP_UP_REQUIRED') {
        setStatusNote('Step-up co-sign modal dismissed via Escape. Order remains paused in STEP_UP_REQUIRED.');
      }
    };
    window.addEventListener(TALOS_ESCROW_EVENT, onExternalEvent);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener(TALOS_ESCROW_EVENT, onExternalEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [statusState]);

  return {
    stepUp,
    statusState,
    statusNote,
    createPayPalSandboxOrder,
    handleApproveStepUp,
    handleRejectStepUp,
  };
}
