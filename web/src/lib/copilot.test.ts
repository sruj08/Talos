import { describe, expect, it } from 'vitest';
import { intentToFilterModel, parseCopilotPrompt, PRESET_PROMPTS } from './copilot';

describe('parseCopilotPrompt', () => {
  it('compiles the flagship AG Studio prompt into group + exclude + chart', () => {
    const i = parseCopilotPrompt(PRESET_PROMPTS[0]);
    expect(i.groupBy).toEqual(['merchant_risk']);
    expect(i.excludeStates).toEqual(expect.arrayContaining(['BLOCKED_FIREWALL']));
    expect(i.chart).toEqual({ category: 'state', type: 'groupedColumn' });
    expect(i.summary[0]).toBe('group by merchant_risk');
  });

  it('handles "show only ... grouped by merchant"', () => {
    const i = parseCopilotPrompt('Show only blocked attacks grouped by merchant');
    expect(i.groupBy).toEqual(['merchant_name']);
    expect(i.includeStates.sort()).toEqual(['BLOCKED_FIREWALL', 'BLOCKED_PRICE_GOUGING']);
  });

  it('parses amount thresholds and sort direction', () => {
    const i = parseCopilotPrompt('Only captured over $200 sorted by amount');
    expect(i.includeStates).toEqual(['PAYPAL_CAPTURED']);
    expect(i.minAmountUsd).toBe(200);
    expect(i.sort).toEqual({ colId: 'amount', sort: 'desc' });
    expect(parseCopilotPrompt('rank by spread ascending').sort).toEqual({ colId: 'spread_bps', sort: 'asc' });
  });

  it('picks chart type and category', () => {
    expect(parseCopilotPrompt('Pie chart of volume by merchant risk').chart).toEqual({ category: 'merchant_risk', type: 'pie' });
    expect(parseCopilotPrompt('bar chart by merchant').chart).toEqual({ category: 'merchant_name', type: 'bar' });
  });

  it('recognises reset and ignores empty input', () => {
    expect(parseCopilotPrompt('Reset').reset).toBe(true);
    expect(parseCopilotPrompt('   ').summary).toEqual([]);
  });
});

describe('intentToFilterModel', () => {
  it('builds a set filter excluding blocked states', () => {
    const m = intentToFilterModel(parseCopilotPrompt('filter out prompt injection'));
    const values = (m.state as { values: string[] }).values;
    expect(values).not.toContain('BLOCKED_FIREWALL');
    expect(values).toContain('PAYPAL_CAPTURED');
  });

  it('combines min and max amount into an AND number filter', () => {
    const m = intentToFilterModel(parseCopilotPrompt('only authorized over $100, under $400'));
    expect(m.amount).toMatchObject({ operator: 'AND' });
    expect((m.state as { values: string[] }).values).toEqual(['PAYPAL_AUTHORIZED', 'SLA_SCHEDULED', 'TRACKING_VERIFIED']);
  });

  it('returns an empty model when nothing filters', () => {
    expect(intentToFilterModel(parseCopilotPrompt('group by carrier'))).toEqual({});
  });
});
