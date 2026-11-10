// Playwright E2E: public landing (/) -> split-screen Live Agent Simulator -> cross-route run persistence
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../.agent/screenshots');

test.describe('TALOS landing showcase and Live Agent Simulator', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test(
    'Act 5: Public landing (/) routes into the split-screen simulator and the run persists into /sla and /step-up',
    { tag: ['@critical', '@e2e', '@showcase'] },
    async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('talos-landing-page')).toBeVisible();

      const hero = page.getByTestId('startup-landing-hero');
      await expect(hero).toBeVisible();
      await expect(hero).toContainText('Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.');
      await expect(page.getByTestId('hero-agent-preview')).toBeVisible();
      await expect(page.getByTestId('landing-scenario-preview')).toBeVisible();
      await expect(page.getByTestId('landing-integrations')).toContainText('PAYPAL_CLIENT_ID');
      await expect(page.getByTestId('investor-business-pitch-strip')).toBeVisible();

      // Landing is a showcase: no back-office widgets, no horizontal overflow
      await expect(page.getByTestId('ag-studio-blotter')).toHaveCount(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);

      // Scenario tabs switch the comparison lanes in place
      await page.getByTestId('landing-scenario-tab-late_big').click();
      await expect(page.getByTestId('landing-lane-protected')).toContainText('$219 refunded');

      // Primary CTA is a real route, not a scroll
      await expect(page.getByTestId('landing-try-demo-cta')).toContainText('Launch live demo');
      await page.getByTestId('landing-try-demo-cta').click();
      await expect(page).toHaveURL(/\/simulator$/);
      await expect(page.getByTestId('live-agent-simulator')).toBeVisible();

      // Run the late-delivery + big-order scenario with TALOS on, then follow it into other workspaces
      await page.getByTestId('sim-mode-protected').click();
      await page.getByTestId('sim-scenario-late_big').click();
      await page.getByTestId('sim-play-btn').click();
      await expect(page.getByTestId('agent-cursor')).toBeVisible();
      await page.getByTestId('sim-skip-btn').click();
      const outcome = page.getByTestId('sim-run-outcome');
      await expect(outcome).toHaveAttribute('data-outcome-kind', 'REFUNDED');
      await expect(page.getByTestId('xray-layer-escrow_vault')).toHaveAttribute('data-status', 'refunded');

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live-agent-simulator.png'), animations: 'disabled' });

      await page.getByTestId('sim-follow-sla').click();
      await expect(page).toHaveURL(/\/sla$/);
      await expect(page.getByTestId('last-run-banner')).toHaveAttribute('data-has-run', 'true');
      await expect(page.getByTestId('bryntum-badge-esc-903-scarlett')).toContainText('PAYPAL_VOIDED');
      await expect(page.getByTestId('downstream-phase-esc-903-scarlett')).toContainText('LOCKED IN CRIMSON');

      await page.getByTestId('app-nav-step-up').click();
      await expect(page).toHaveURL(/\/step-up$/);
      await expect(page.getByTestId('last-run-banner')).toContainText('$450');
    }
  );
});
