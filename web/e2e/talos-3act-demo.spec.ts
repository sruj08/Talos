// Playwright E2E Verification Suite for TALOS 3-Act Demo & Multi-Page PayPal Design System
import { test, expect, type Page, type Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export const E2E_SCENARIOS = [
  'Act 1: Rust lol_html blocks Poisoned Merchant DOM prompt injection & Channel3 blocks +92% price gouging',
  'Act 2: Go APIMatic SDK creates PayPal Sandbox Orders v2 AUTHORIZE -> Tracking DELIVERED -> Auto-CAPTURE',
  'Act 3: Bryntum Scheduler Pro SLA Breach triggers live PayPal Sandbox authorizationsVoid rollback',
];

const SCREENSHOT_DIR = path.resolve(__dirname, '../../.agent/screenshots');

function ensureScreenshotDir(): void {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

class TalosCommandCenterPage {
  readonly page: Page;
  readonly root: Locator;
  readonly mandateBudgetInput: Locator;
  readonly signMandateBtn: Locator;
  readonly mandateSignatureHex: Locator;
  readonly act1Btn: Locator;
  readonly act2Btn: Locator;
  readonly act3Btn: Locator;
  readonly telemetryCard: Locator;
  readonly copilotInput: Locator;
  readonly copilotRunBtn: Locator;
  readonly presetFraudBtn: Locator;
  readonly presetChartBtn: Locator;
  readonly bryntumVoidBtn: Locator;
  readonly bryntumScarlettBadge: Locator;
  readonly bryntumDownstreamPhase: Locator;
  readonly stepUpCoSignBtn: Locator;
  readonly stepUpStatusBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByTestId('talos-command-center');
    this.mandateBudgetInput = page.getByTestId('input-mandate-budget');
    this.signMandateBtn = page.getByTestId('btn-sign-mandate');
    this.mandateSignatureHex = page.getByTestId('mandate-signature-hex');
    this.act1Btn = page.getByTestId('btn-scenario-act1');
    this.act2Btn = page.getByTestId('btn-scenario-act2');
    this.act3Btn = page.getByTestId('btn-scenario-act3');
    this.telemetryCard = page.getByTestId('simulator-telemetry-card');
    this.copilotInput = page.getByTestId('input-ag-studio-copilot');
    this.copilotRunBtn = page.getByTestId('btn-ag-studio-copilot-run');
    this.presetFraudBtn = page.getByTestId('preset-fraud-injection');
    this.presetChartBtn = page.getByTestId('preset-chart-saved-vs-settled');
    this.bryntumVoidBtn = page.getByTestId('btn-void-esc-903-scarlett');
    this.bryntumScarlettBadge = page.getByTestId('bryntum-badge-esc-903-scarlett');
    this.bryntumDownstreamPhase = page.getByTestId('downstream-phase-esc-903-scarlett');
    this.stepUpCoSignBtn = page.getByTestId('btn-step-up-cosign');
    this.stepUpStatusBadge = page.getByTestId('step-up-status-badge');
  }

  async goto(): Promise<void> {
    await this.page.goto('/command-center');
    await expect(this.root).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /TALOS/i }).first()).toBeVisible();
  }
}

test.describe('TALOS 3-Act Autonomous Procurement & Zero-Trust Escrow Suite', () => {
  test.beforeAll(() => {
    ensureScreenshotDir();
  });

  test(E2E_SCENARIOS[0], { tag: ['@critical', '@e2e', '@firewall'] }, async ({ page }) => {
    const pom = new TalosCommandCenterPage(page);
    await pom.goto();

    // Computed-Style Audit: Verify PayPal Design System (paypal.design.md) Typography, Radius & Tabular Nums
    const computedAudit = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const body = document.body;
      const card = document.querySelector('.paypal-feature-card');
      const kpiNum = document.querySelector('[data-testid="kpi-protected-gmv"] .tabular-nums');
      const monoEl = document.querySelector('.font-mono');
      return {
        fxAttr: document.documentElement.getAttribute('data-fx'),
        h1Font: h1 ? window.getComputedStyle(h1).fontFamily : '',
        bodyFont: window.getComputedStyle(body).fontFamily,
        bodyBg: window.getComputedStyle(body).backgroundColor,
        cardRadius: card ? window.getComputedStyle(card).borderRadius : '',
        kpiVariantNumeric: kpiNum ? window.getComputedStyle(kpiNum).fontVariantNumeric : '',
        monoFont: monoEl ? window.getComputedStyle(monoEl).fontFamily : '',
      };
    });
    expect(['high', 'static']).toContain(computedAudit.fxAttr);
    expect(computedAudit.h1Font).toMatch(/PayPal Pro|PayPal Open|Helvetica Neue/i);
    expect(computedAudit.bodyFont).toMatch(/PayPal Pro|PayPal Open|Helvetica Neue/i);
    expect(computedAudit.monoFont).toMatch(/SFMono-Regular|Consolas/i);
    expect(computedAudit.cardRadius).toBe('16px');
    expect(computedAudit.kpiVariantNumeric).toContain('tabular-nums');

    await pom.mandateBudgetInput.fill('300');
    await pom.signMandateBtn.click();
    await expect(pom.mandateSignatureHex).toHaveText(/^[0-9a-f]{128}$/i);

    await pom.act1Btn.click();
    await expect(pom.telemetryCard).toContainText('Scenario A (Act 1): Attack');
    await expect(pom.telemetryCard).toContainText('Risk: 0.9942');
    await expect(pom.telemetryCard).toContainText('Spread: 9277 bps');
    await expect(page.getByTestId('forensic-card-dom-diff').last()).toContainText('SYSTEM OVERRIDE');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'act1-firewall-gouging-blocked.png'),
      animations: 'disabled',
    });
  });

  test(E2E_SCENARIOS[1], { tag: ['@critical', '@e2e', '@paypal'] }, async ({ page }) => {
    const pom = new TalosCommandCenterPage(page);
    await pom.goto();

    await pom.act2Btn.click();
    await expect(pom.telemetryCard).toContainText('Scenario B (Act 2): Happy Path');
    await expect(pom.telemetryCard).toContainText('$249.00');
    await expect(pom.telemetryCard).toContainText('Auto-CAPTURED');

    await page.getByTestId('select-row-esc-902-sm7b').click();
    const paypalForensicCard = page.getByTestId('forensic-card-paypal-actions').last();
    await expect(paypalForensicCard).toContainText('esc-902-sm7b (PAYPAL_CAPTURED)');
    await expect(paypalForensicCard).toContainText('9CAP-2A112233');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'act2-paypal-authorize-capture.png'),
      animations: 'disabled',
    });
  });

  test(E2E_SCENARIOS[2], { tag: ['@critical', '@e2e', '@bryntum'] }, async ({ page }) => {
    const pom = new TalosCommandCenterPage(page);
    await pom.goto();

    await pom.act3Btn.click();
    await expect(pom.telemetryCard).toContainText('Scenario C (Act 3): SLA Breach');
    await expect(pom.bryntumScarlettBadge).toContainText('PAYPAL_VOIDED');
    await expect(pom.bryntumDownstreamPhase).toContainText('LOCKED IN CRIMSON');
    await expect(page.getByTestId('bryntum-ag-sync-pill')).toContainText('esc-903-scarlett=VOIDED');

    await pom.stepUpCoSignBtn.click();
    await expect(pom.stepUpStatusBadge).toContainText('CO-SIGNED: PAYPAL_AUTHORIZED');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'act3-bryntum-void-and-stepup.png'),
      animations: 'disabled',
    });
  });

  test(
    'Act 4: AG Studio AI Financial Copilot filters Fraud View & renders Saved vs Settled Chart',
    { tag: ['@e2e', '@ag-studio'] },
    async ({ page }) => {
      const pom = new TalosCommandCenterPage(page);
      await pom.goto();

      await pom.presetFraudBtn.click();
      await expect(page.getByTestId('ag-studio-copilot-status')).toContainText('Grouped by firewall_verdict');

      await pom.presetChartBtn.click();
      await expect(page.getByTestId('ag-studio-integrated-chart-summary')).toBeVisible();

      await pom.copilotInput.fill('Group by merchant risk and chart saved fraud vs settled PayPal volume');
      await pom.copilotRunBtn.click();
      await expect(page.getByTestId('ag-studio-integrated-chart-summary')).toContainText('Saved Fraud Volume');

      await expect(page.getByTestId('blotter-group-summary')).toBeVisible();
      await expect(page.getByTestId('blotter-saved-fraud-kpi')).toBeVisible();
      await expect(page.getByTestId('blotter-quick-filter')).toBeVisible();
      await expect(page.getByTestId('blotter-csv-export-btn')).toBeVisible();
      await page.getByTestId('blotter-status-tab-BLOCKED').click();
      await expect(page.getByTestId('blotter-row-esc-901-trap')).toBeVisible();
      await page.getByTestId('blotter-status-tab-ALL').click();

      // Verify theme toggle (default light -> dark -> light)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await page.getByTestId('theme-toggle-btn').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.getByTestId('theme-toggle-btn').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

      // Verify dedicated chapter routes & bottom story dock cross-route navigation
      await page.goto('/mandates');
      await expect(page.getByTestId('chapter-route-mandates')).toBeVisible();
      await expect(page.getByTestId('mandate-studio')).toBeVisible();
      await page.getByTestId('dock-chapter-chapter_2_arena').click();
      await expect(page.getByTestId('chapter-route-simulator')).toBeVisible();
      await expect(page.getByTestId('poisoned-store-sim')).toBeVisible();

      await page.goto('/blotter');
      await expect(page.getByTestId('chapter-route-blotter')).toBeVisible();
      await expect(page.getByTestId('ag-studio-blotter')).toBeVisible();

      await page.goto('/sla');
      await expect(page.getByTestId('chapter-route-sla')).toBeVisible();
      await expect(page.getByTestId('bryntum-sla-board')).toBeVisible();

      await page.goto('/step-up');
      await expect(page.getByTestId('chapter-route-step-up')).toBeVisible();
      await expect(page.getByTestId('paypal-step-up-modal')).toBeVisible();
    }
  );

  test(
    'Act 5: Pure Landing Page (/) Storyline & Multi-Page Button Navigation',
    { tag: ['@critical', '@e2e', '@showcase'] },
    async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('talos-landing-page')).toBeVisible();

      const hero = page.getByTestId('startup-landing-hero');
      await expect(hero).toBeVisible();
      await expect(hero).toContainText('Stop AI Shopping Agents From Being Hijacked or Overcharged');
      await expect(page.getByTestId('talos-pillar-1')).toBeVisible();
      await expect(page.getByTestId('talos-pillar-4')).toBeVisible();

      // Verify Landing Page (/) has zero numbers in visible text and no unrelated modules
      await expect(page.getByTestId('kpi-header-bar')).toHaveCount(0);
      await expect(page.getByTestId('ag-studio-blotter')).toHaveCount(0);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toMatch(/\d/);

      // Clicking Explore Full Storyline opens /story
      await page.getByTestId('cta-story-walkthrough-btn').click();
      await expect(page).toHaveURL(/\/story$/);
      await expect(page.getByTestId('chapter-route-story')).toBeVisible();
      await expect(page.getByTestId('storytelling-walkthrough-5part')).toBeVisible();

      // Clicking Back to Landing returns to /
      await page.getByTestId('story-back-home-btn').click();
      await expect(page).toHaveURL(/\/$/);

      // Clicking Launch Interactive Simulator opens /simulator
      await page.getByTestId('landing-try-demo-cta').click();
      await expect(page).toHaveURL(/\/simulator$/);
      await expect(page.getByTestId('chapter-route-simulator')).toBeVisible();
      await expect(page.getByTestId('side-by-side-agent-comparison')).toBeVisible();

      // Trigger Act 3 on /simulator, then click Jump to Ledger (/sla) and verify cross-page state persistence
      await page.getByTestId('btn-scenario-act3').click();
      await page.getByTestId('btn-jump-to-ledger').click();
      await expect(page).toHaveURL(/\/sla$/);
      await expect(page.getByTestId('bryntum-badge-esc-903-scarlett')).toContainText('PAYPAL_VOIDED');
      await expect(page.getByTestId('downstream-phase-esc-903-scarlett')).toContainText('LOCKED IN CRIMSON');
    }
  );
});
