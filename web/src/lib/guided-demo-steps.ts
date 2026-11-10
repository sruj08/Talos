import { DemoStepNumber } from '../context/TalosClearingContext';
import { DEFAULT_STEP_UP_REQUEST, broadcastTalosEscrowEvent } from './phase6-events';

export interface GuidedDemoStepSpec {
  step: DemoStepNumber;
  badge: string;
  title: string;
  plainSummary: string;
  outcomeBanner: string;
  whatToLookAt: string;
  ctaLabel: string;
  targetAnchor: string;
  targetRoute: string;
  primaryClickTestId: string;
  secondaryClickTestId?: string;
  dotClass: 'dot-paypal' | 'dot-crimson' | 'dot-emerald' | 'dot-amber';
}

export const GUIDED_DEMO_STEPS: GuidedDemoStepSpec[] = [
  {
    step: 1,
    badge: 'Step 01 · Module 01',
    title: 'Lock AI Spending Rules',
    plainSummary:
      'Sign a cryptographic rule: AI can spend max $300, max 15% above fair market price, and vendor must deliver in 48h.',
    outcomeBanner:
      'Outcome (Step 1): Human CFO locked a $300 Ed25519 mandate in Module 01. The AI shopping agent cannot override this budget or pay unverified markups.',
    whatToLookAt:
      'In Module 01, inspect the $300 budget cap, 15% price-gouging limit (1500 bps), 48h delivery deadline, and the 128-character Ed25519 hardware signature.',
    ctaLabel: 'Open Step 1: Sign $300 Rule',
    targetAnchor: '#chapter-mandates',
    targetRoute: '/mandates',
    primaryClickTestId: 'btn-sign-mandate',
    dotClass: 'dot-paypal',
  },
  {
    step: 2,
    badge: 'Step 02 · Module 02 → 03',
    title: 'Stop a Hacked Storefront',
    plainSummary:
      'Send the AI to buy a Shure SM7B microphone from a hacked website charging $480 with a hidden prompt injection.',
    outcomeBanner:
      'Outcome (Step 2): Blocked $480 scammer & saved $231! Rust lol_html stripped the hidden SYSTEM OVERRIDE attack in 2.84ms (Module 02) and logged BLOCKED_DOM_INJECTION in Module 03.',
    whatToLookAt:
      'In Module 02 & Module 03, compare the crimson Raw Storefront HTML (containing hidden SYSTEM OVERRIDE text) against the green Sanitized HTML and the blocked $480 row.',
    ctaLabel: 'Open Step 2: Block $480 Attack',
    targetAnchor: '#chapter-simulator',
    targetRoute: '/simulator',
    primaryClickTestId: 'btn-scenario-act1',
    secondaryClickTestId: 'select-row-esc-901-trap',
    dotClass: 'dot-crimson',
  },
  {
    step: 3,
    badge: 'Step 03 · Module 02 → 03 → 04',
    title: 'Verified Purchase & Delivery',
    plainSummary:
      'Channel3 finds a verified $249 seller. PayPal locks $249 in reversible escrow until FedEx delivers the package.',
    outcomeBanner:
      'Outcome (Step 3): Locked $249 in PayPal Hold until FedEx delivered! Channel3 verified the $249 fair price (0 bps spread) and PayPal auto-captured $249 (9CAP-2A112233) on delivery.',
    whatToLookAt:
      'In Module 03, see row esc-902-sm7b transition to green PAYPAL_CAPTURED ($249.00) with 0 bps markup in the Channel3 Price Spread chart.',
    ctaLabel: 'Open Step 3: Verify & Pay $249',
    targetAnchor: '#chapter-blotter',
    targetRoute: '/blotter',
    primaryClickTestId: 'btn-scenario-act2',
    secondaryClickTestId: 'select-row-esc-902-sm7b',
    dotClass: 'dot-emerald',
  },
  {
    step: 4,
    badge: 'Step 04 · Module 04 → 05',
    title: 'Late Delivery Refund & $450 Co-Sign',
    plainSummary:
      'DHL misses the 48h deadline -> PayPal voids the $219 hold in 0s. Plus, co-sign a $450 purchase above the $300 cap.',
    outcomeBanner:
      'Outcome (Step 4): Instant $219 refund because DHL missed the 48h deadline (PAYPAL_VOIDED in Module 04), plus the $450 studio monitor order is ready for 1-click Human Co-Sign in Module 05!',
    whatToLookAt:
      'In Module 04 & Module 05, see the Scarlett 4i4 lane turn crimson ([↩ VOIDED / PAYPAL_VOIDED]) and click Co-Sign in Module 05 to approve the $450 Genelec monitors.',
    ctaLabel: 'Open Step 4: SLA Refund & Co-Sign',
    targetAnchor: '#chapter-sla',
    targetRoute: '/sla',
    primaryClickTestId: 'btn-scenario-act3',
    dotClass: 'dot-amber',
  },
];

function broadcastStepFallbackEvent(step: DemoStepNumber): void {
  const now = new Date().toISOString();
  if (step === 2) {
    broadcastTalosEscrowEvent({
      event_id: `evt-guided-step2-${Date.now()}`,
      event_type: 'ACT_SCENARIO_TRIGGERED',
      timestamp: now,
      escrow_id: 'esc-901-trap',
      new_state: 'BLOCKED_DOM_INJECTION',
      sku_summary: 'Shure SM7B (Poisoned DOM + +92.7% Gouge)',
      merchant_name: 'ShadowGear Unverified Trap',
      amount_cents: 48000,
      ag_grid_row_delta: {
        escrow_id: 'esc-901-trap',
        state: 'BLOCKED_DOM_INJECTION',
        amount_cents: 48000,
        sku_summary: 'Shure SM7B (Poisoned DOM + +92.7% Gouge)',
        merchant_name: 'ShadowGear Unverified Trap',
      },
    });
  } else if (step === 3) {
    broadcastTalosEscrowEvent({
      event_id: `evt-guided-step3-${Date.now()}`,
      event_type: 'ESCROW_STATE_TRANSITION',
      timestamp: now,
      escrow_id: 'esc-902-sm7b',
      previous_state: 'PAYPAL_AUTHORIZED',
      new_state: 'PAYPAL_CAPTURED',
      sku_summary: 'Shure SM7B Vocal Dynamic Microphone',
      merchant_name: 'AudioPro Verified (Channel3 Preferred)',
      amount_cents: 24900,
      paypal_order_id: '8XY99887766554433',
      paypal_auth_id: '2A112233445566778',
      paypal_capture_id: '9CAP-2A112233',
      ag_grid_row_delta: {
        escrow_id: 'esc-902-sm7b',
        state: 'PAYPAL_CAPTURED',
        paypal_order_id: '8XY99887766554433',
        paypal_auth_id: '2A112233445566778',
        paypal_capture_id: '9CAP-2A112233',
        amount_cents: 24900,
      },
      bryntum_task_delta: {
        id: 'task-sm7b-01',
        escrowId: 'esc-902-sm7b',
        escrowState: 'PAYPAL_CAPTURED',
        percentDone: 100,
        downstreamLocked: false,
      },
    });
  } else if (step === 4) {
    broadcastTalosEscrowEvent({
      event_id: `evt-guided-step4-${Date.now()}`,
      event_type: 'STEP_UP_REQUIRED',
      timestamp: now,
      escrow_id: 'esc-903-scarlett',
      previous_state: 'PAYPAL_AUTHORIZED',
      new_state: 'PAYPAL_VOIDED',
      paypal_order_id: '4KL88210938471122',
      paypal_auth_id: '2A883120944556677',
      void_reason: 'ACT_3_BRYNTUM_CARRIER_DELAY_SLA_BREACH',
      ag_grid_row_delta: {
        escrow_id: 'esc-903-scarlett',
        state: 'PAYPAL_VOIDED',
        paypal_order_id: '4KL88210938471122',
        paypal_auth_id: '2A883120944556677',
        amount_cents: 21900,
      },
      bryntum_task_delta: {
        id: 'task-scarlett-02',
        escrowId: 'esc-903-scarlett',
        escrowState: 'PAYPAL_VOIDED',
        percentDone: 100,
        slaHoursElapsed: 56,
        downstreamLocked: true,
      },
      step_up_request: {
        ...DEFAULT_STEP_UP_REQUEST,
        approved: false,
      },
    });
  }
}

export function executeGuidedDemoStepDomAction(
  spec: GuidedDemoStepSpec,
  options: { navigate?: (href: string) => void } = {}
): void {
  if (typeof document !== 'undefined') {
    const primaryBtn = document.querySelector<HTMLElement>(`[data-testid="${spec.primaryClickTestId}"]`);
    if (primaryBtn) {
      primaryBtn.click();
    } else {
      broadcastStepFallbackEvent(spec.step);
    }

    if (spec.secondaryClickTestId) {
      const secondaryBtn = document.querySelector<HTMLElement>(`[data-testid="${spec.secondaryClickTestId}"]`);
      if (secondaryBtn) {
        secondaryBtn.click();
      }
    }
  }

  if (options.navigate) {
    options.navigate(spec.targetRoute);
  }
}
