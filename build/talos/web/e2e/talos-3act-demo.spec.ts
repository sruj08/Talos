// Playwright E2E Verification Suite for TALOS 3-Act Demo (TASK-14)
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
    await this.page.goto('/');
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

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'act4-ag-studio-copilot-chart.png'),
        animations: 'disabled',
      });
    }
  );
});
