import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MANDATE_VALUES,
  DEFAULT_SIGNED_MANDATE,
  computeDeterministicSignatureHex,
} from '../hooks/useMandateStudio';
import {
  computePriceSpreadBps,
  evaluateAgentComparisonScenario,
} from '../lib/agent-comparison-scenarios';

const SRC_DIR = path.resolve(__dirname, '..');

function walkSourceFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      results.push(...walkSourceFiles(fullPath, extensions));
    } else if (
      extensions.some((ext) => entry.name.endsWith(ext)) &&
      !entry.name.endsWith('.spec.tsx') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.test.ts')
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('TALOS Investor Storyline — Tier 2 Boundary & Corner Cases (BVA)', () => {
  it.each([
    { askUsd: 249, capUsd: 300, expectedStepUp: false, expectedState: 'PAYPAL_AUTHORIZED' },
    { askUsd: 300, capUsd: 300, expectedStepUp: false, expectedState: 'PAYPAL_AUTHORIZED' },
    { askUsd: 301, capUsd: 300, expectedStepUp: true, expectedState: 'STEP_UP_REQUIRED' },
    { askUsd: 450, capUsd: 300, expectedStepUp: true, expectedState: 'STEP_UP_REQUIRED' },
  ])(
    'BVA on $300 Spending Allowance Cap: ask=$$askUsd vs cap=$$capUsd -> stepUpRequired=$expectedStepUp ($expectedState)',
    ({ askUsd, capUsd, expectedStepUp, expectedState }) => {
      const result = evaluateAgentComparisonScenario({
        act: 'ACT_3',
        injectHiddenPrompt: false,
        merchantAskUsd: askUsd,
        fairMarketMedianUsd: askUsd,
        mandateCapUsd: capUsd,
        maxSpreadBps: 1500,
        carrierHoursElapsed: 26,
        slaDeadlineHours: 48,
      });

      expect(result.talosProtected.stepUpRequired).toBe(expectedStepUp);
      expect(result.talosProtected.escrowState).toBe(expectedState);
    }
  );

  it.each([
    { askUsd: 245, medianUsd: 249, expectedBps: 0, expectedGougeBlocked: false },
    { askUsd: 249, medianUsd: 249, expectedBps: 0, expectedGougeBlocked: false },
    { askUsd: 286.35, medianUsd: 249, expectedBps: 1500, expectedGougeBlocked: false },
    { askUsd: 286.6, medianUsd: 249, expectedBps: 1510, expectedGougeBlocked: true },
    { askUsd: 480, medianUsd: 249, expectedBps: 9277, expectedGougeBlocked: true },
  ])(
    'BVA on Price Spread Basis Points (1500 bps cap): ask=$$askUsd vs median=$$medianUsd -> $expectedBps bps (blocked=$expectedGougeBlocked)',
    ({ askUsd, medianUsd, expectedBps, expectedGougeBlocked }) => {
      const bps = computePriceSpreadBps(askUsd, medianUsd);
      const evaluation = evaluateAgentComparisonScenario({
        act: 'ACT_1',
        injectHiddenPrompt: false,
        merchantAskUsd: askUsd,
        fairMarketMedianUsd: medianUsd,
        mandateCapUsd: 300,
        maxSpreadBps: 1500,
        carrierHoursElapsed: 26,
        slaDeadlineHours: 48,
      });

      expect(bps).toBe(expectedBps);
      expect(evaluation.talosProtected.spreadBps).toBe(expectedBps);
      expect(evaluation.talosProtected.priceGougeBlocked).toBe(expectedGougeBlocked);
      if (expectedGougeBlocked) {
        expect(evaluation.talosProtected.escrowState).toBe('BLOCKED_DOM_INJECTION');
        expect(evaluation.talosProtected.protectedSpendUsd).toBe(medianUsd);
      }
    }
  );

  it.each([
    { elapsedHours: 0, deadlineHours: 48, expectedVoided: false, expectedState: 'PAYPAL_AUTHORIZED' },
    { elapsedHours: 26, deadlineHours: 48, expectedVoided: false, expectedState: 'PAYPAL_AUTHORIZED' },
    { elapsedHours: 48, deadlineHours: 48, expectedVoided: false, expectedState: 'PAYPAL_AUTHORIZED' },
    { elapsedHours: 49, deadlineHours: 48, expectedVoided: true, expectedState: 'PAYPAL_VOIDED' },
    { elapsedHours: 56, deadlineHours: 48, expectedVoided: true, expectedState: 'PAYPAL_VOIDED' },
  ])(
    'BVA on 48h Carrier SLA Deadline: elapsed=${elapsedHours}h vs deadline=${deadlineHours}h -> slaAutoVoided=$expectedVoided ($expectedState)',
    ({ elapsedHours, deadlineHours, expectedVoided, expectedState }) => {
      const result = evaluateAgentComparisonScenario({
        act: 'ACT_1',
        injectHiddenPrompt: false,
        merchantAskUsd: 219,
        fairMarketMedianUsd: 219,
        mandateCapUsd: 300,
        maxSpreadBps: 1500,
        carrierHoursElapsed: elapsedHours,
        slaDeadlineHours: deadlineHours,
      });

      expect(result.talosProtected.slaAutoVoided).toBe(expectedVoided);
      expect(result.talosProtected.escrowState).toBe(expectedState);
    }
  );

  it('BVA on 128-hex Ed25519 signature length, subhead word count (<= 12 words), and source file line count (<= 250 lines)', () => {
    const sigDefault = computeDeterministicSignatureHex(DEFAULT_MANDATE_VALUES);
    const sigCustom = computeDeterministicSignatureHex({
      ...DEFAULT_MANDATE_VALUES,
      maxAmountCents: 100,
      allowedCategories: ['A'],
    });
    expect(sigDefault).toMatch(/^[0-9a-f]{128}$/);
    expect(sigCustom).toMatch(/^[0-9a-f]{128}$/);
    expect(sigDefault).not.toBe(sigCustom);
    expect(DEFAULT_SIGNED_MANDATE.ed25519_pubkey_hex).toMatch(/^[0-9a-f]{64}$/);

    const tsxFiles = walkSourceFiles(SRC_DIR, ['.tsx']);
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const m of content.matchAll(/<p[^>]*data-subhead="true"[^>]*>([\s\S]*?)<\/p>/g)) {
        const text = m[1].replace(/<[^>]+>/g, '').trim();
        const words = text.split(/\s+/).filter(Boolean);
        expect(words.length).toBeLessThanOrEqual(12);
      }
    }

    const allSourceFiles = walkSourceFiles(SRC_DIR, ['.ts', '.tsx', '.css']);
    expect(allSourceFiles.length).toBeGreaterThan(20);
    for (const file of allSourceFiles) {
      const lineCount = fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
      expect(lineCount).toBeLessThanOrEqual(250);
    }
  });
});
