import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const SRC_DIR = path.resolve(__dirname, '..');

function walkFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      results.push(...walkFiles(fullPath, extensions));
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

const tsxFiles = walkFiles(SRC_DIR, ['.tsx']);
const cssFiles = walkFiles(SRC_DIR, ['.css']);
const allSourceFiles = walkFiles(SRC_DIR, ['.tsx', '.ts', '.css']);
const allUiSourceFiles = [...tsxFiles, ...cssFiles];

function readAllTsx(): Array<{ file: string; rel: string; content: string }> {
  return tsxFiles.map((file) => ({
    file,
    rel: path.relative(SRC_DIR, file),
    content: fs.readFileSync(file, 'utf8'),
  }));
}

const globalsCssPath = path.join(SRC_DIR, 'app', 'globals.css');
const globalsCss = fs.existsSync(globalsCssPath) ? fs.readFileSync(globalsCssPath, 'utf8') : '';

describe('PayPal Design System (paypal.design.md) & Multi-Page Architecture — 20 Quality Gates', () => {
  it('1. Bans rounded-full status pills and enforces 6px semantic status dots (w-1.5 h-1.5 rounded-xs)', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found banned rounded-full in ${rel}`).not.toMatch(/\brounded-full\b/);
    }
    expect(readAllTsx().map((f) => f.content).join('\n')).toContain('w-1.5 h-1.5 rounded-xs');
  });

  it('2. Bans excessive italics (<em>, italic class, and font-style: italic)', () => {
    for (const file of allUiSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Found <em> tag in ${rel}`).not.toMatch(/<em[\s>]/i);
      expect(content, `Found italic class in ${rel}`).not.toMatch(/\bitalic\b/);
      expect(content, `Found font-style: italic in ${rel}`).not.toMatch(/font-style:\s*italic/i);
    }
  });

  it('3. Bans serif fonts (Instrument Serif, Fraunces) and enforces PayPal Pro, PayPal Open, and SFMono-Regular', () => {
    for (const file of allSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Found banned Instrument Serif in ${rel}`).not.toMatch(/Instrument\s*Serif/i);
      expect(content, `Found banned Fraunces serif in ${rel}`).not.toMatch(/Fraunces/i);
    }
    for (const font of ['PayPal Pro', 'PayPal Open', 'SFMono-Regular']) {
      expect(globalsCss).toContain(font);
    }
  });

  it('4. Enforces PayPal Pro negative display tracking (-0.045em, -0.04em, -0.035em) and legal tracking (0.01em)', () => {
    for (const file of allUiSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      expect(fs.readFileSync(file, 'utf8'), `Found tracking-tighter in ${rel}`).not.toMatch(/\btracking-tighter\b/);
    }
    for (const tok of ['-0.045em', '-0.04em', '-0.035em', '0.01em']) {
      expect(globalsCss).toContain(tok);
    }
  });

  it('5. Enforces multi-page routes (/story, /mandates, /simulator, /blotter, /sla, /step-up, /command-center) and bans scrollIntoView', () => {
    const combinedTsx = readAllTsx().map((f) => f.content).join('\n');
    expect(combinedTsx + globalsCss).toMatch(/0fr|1fr/);
    for (const file of allSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      expect(fs.readFileSync(file, 'utf8'), `Found banned scrollIntoView in ${rel}`).not.toContain('scrollIntoView');
    }
    expect(fs.existsSync(path.join(SRC_DIR, 'context', 'TalosClearingContext.tsx'))).toBe(true);
    for (const r of ['story', 'mandates', 'simulator', 'blotter', 'sla', 'step-up', 'command-center']) {
      expect(fs.existsSync(path.join(SRC_DIR, 'app', r, 'page.tsx'))).toBe(true);
    }
  });

  it('6. Bans overusing dividers (<hr>, divide-y, border-b) in favor of spatial rhythm and tonal elevation', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found <hr> in ${rel}`).not.toMatch(/<hr[\s/>]/i);
      expect(content, `Found divide-y in ${rel}`).not.toMatch(/\bdivide-y\b/);
      expect(content, `Found border-b in ${rel}`).not.toMatch(/\bborder-b\b/);
    }
  });

  it('7. Bans arbitrary Tailwind color opacity modifiers and enforces PayPal Design System hex tokens', () => {
    const slashOpacityRegex = /\b(?:bg|text|border|ring|from|to|via)-(?:slate|sky|blue|emerald|rose|amber|indigo|purple|cyan|red|green|yellow)-\d+\/\d+\b/;
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found arbitrary color opacity modifier in ${rel}`).not.toMatch(slashOpacityRegex);
      expect(content, `Found hardcoded dark-only text-slate-* class in ${rel}`).not.toMatch(/\btext-slate-\d+\b/);
    }
    for (const hex of ['#003087', '#0070E0', '#001435', '#FAF8F5', '#DADDE1', '#FFC439']) {
      expect(globalsCss).toContain(hex);
    }
  });

  it('8. Enforces PayPal 1px hairline borders (#DADDE1, #B7BDC2) and checkout module elevation', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found border-slate-800 in ${rel}`).not.toMatch(/\bborder-slate-800\b/);
      expect(content, `Found border-slate-700 in ${rel}`).not.toMatch(/\bborder-slate-700\b/);
    }
    expect(globalsCss).toContain('--field-border-width: 1px');
    expect(globalsCss).toContain('0 2px 12px rgba(0, 20, 53, 0.12)');
  });

  it('9. Enforces clean 3-State PayPal 2PC Clearing Pipeline indicator', () => {
    const combinedTsx = readAllTsx().map((f) => f.content).join('\n');
    for (const st of ['AUTHORIZED', 'SLA VERIFIED', 'CAPTURED / VOIDED']) {
      expect(combinedTsx).toContain(st);
    }
  });

  it('10. Enforces concise institutional microcopy on section subheads (<= 12 words)', () => {
    for (const { rel, content } of readAllTsx()) {
      for (const match of content.matchAll(/<p[^>]*data-subhead="true"[^>]*>([\s\S]*?)<\/p>/g)) {
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        const words = text.split(/\s+/).filter(Boolean);
        expect(words.length, `Subhead in ${rel} exceeds 12 words: "${text}"`).toBeLessThanOrEqual(12);
      }
    }
  });

  it('11. Bans code breadcrumbs ((F-01), ($10,000 Sponsor Pool)) and uses institutional financial titles', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found code breadcrumb (F-XX) in ${rel}`).not.toMatch(/\(F-\d{2}\)/);
      expect(content, `Found Sponsor Pool breadcrumb in ${rel}`).not.toMatch(/Sponsor Pool/i);
    }
    const combinedTsx = readAllTsx().map((f) => f.content).join('\n');
    for (const title of ['Mandate Clearing Studio', 'Red-Team Interception Arena', 'Escrow Settlement Ledger', 'Delivery SLA Timeline']) {
      expect(combinedTsx).toContain(title);
    }
  });

  it('12. Bans numbered section headings (1. , 2. , 3. , 4. , 5. )', () => {
    for (const { rel, content } of readAllTsx()) {
      for (const h of content.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)) {
        const text = h[1].replace(/<[^>]+>/g, '').trim();
        expect(text, `Found numbered heading "${text}" in ${rel}`).not.toMatch(/^\d+\.\s+/);
      }
    }
  });

  it('13. Bans stacked eyebrow badges above headings (TALOS v1.0.0, KERNEL Sandbox: CONNECTED, ACTIVE — ZERO-TRUST ENFORCED)', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found TALOS v1.0.0 eyebrow in ${rel}`).not.toContain('TALOS v1.0.0');
      expect(content, `Found KERNEL Sandbox: CONNECTED eyebrow in ${rel}`).not.toMatch(/KERNEL\s+Sandbox:\s*CONNECTED/i);
      expect(content, `Found visible ACTIVE — ZERO-TRUST ENFORCED eyebrow in ${rel}`).not.toMatch(/>ACTIVE — ZERO-TRUST ENFORCED</);
      expect(content, `Found visible SANDBOX_MODE: LIVE pill in ${rel}`).not.toMatch(/>SANDBOX_MODE:\s*LIVE</);
    }
  });

  it('14. Bans SVG feTurbulence dithering/noise and glassmorphism blur in favor of solid PayPal surfaces', () => {
    for (const file of allUiSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Found feTurbulence in ${rel}`).not.toMatch(/feTurbulence/i);
      expect(content, `Found glassmorphism backdrop-filter in ${rel}`).not.toMatch(/backdrop-filter:\s*blur/i);
    }
    expect(globalsCss).toContain('.paypal-nav-shell');
    expect(globalsCss).toContain('.paypal-hero-band');
  });

  it('15. Bans ASCII art / box-drawing characters and enforces lucide-react vector icons', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found box-drawing ASCII art in ${rel}`).not.toMatch(/[┌─┐│└┘├┤┬┴┼]/);
    }
    expect(readAllTsx().map((f) => f.content).join('\n')).toContain('lucide-react');
  });

  it('16. Enforces PayPal Design System radius scale (4px, 8px, 16px, 28px, 9999px pill)', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found rounded-3xl in ${rel}`).not.toMatch(/\brounded-3xl\b/);
      expect(content, `Found rounded-[32px] in ${rel}`).not.toContain('rounded-[32px]');
    }
    for (const r of ['--radius-sm: 4px', '--radius-md: 8px', '--radius-lg: 16px', '--radius-xl: 28px', '--radius-pill: 9999px']) {
      expect(globalsCss).toContain(r);
    }
  });

  it('17. Restricts font-mono to cryptographic hashes, RFC 9421 headers, and DOM diffs; enforces tabular-nums', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found font-mono on button or heading in ${rel}`).not.toMatch(/<(?:button|h1|h2|h3)[^>]*className="[^"]*\bfont-mono\b/);
    }
    expect(globalsCss).toContain('font-variant-numeric: tabular-nums');
  });

  it('18. Bans ALL CAPS subtitles (uppercase, tracking-wider, tracking-widest)', () => {
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found uppercase class in ${rel}`).not.toMatch(/\buppercase\b/);
      expect(content, `Found tracking-wider/widest in ${rel}`).not.toMatch(/\btracking-wide(?:r|st)\b/);
    }
  });

  it('19. Bans AI-slop gradient utility classes (bg-gradient-to-*, bg-clip-text) across all UI source files', () => {
    for (const file of allUiSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Found bg-gradient-to in ${rel}`).not.toMatch(/\bbg-gradient-to-[a-z]+\b/);
      expect(content, `Found bg-clip-text in ${rel}`).not.toMatch(/\bbg-clip-text\b/);
    }
    for (const { rel, content } of readAllTsx()) {
      expect(content, `Found inline linear/radial-gradient in ${rel}`).not.toMatch(/(?:linear|radial)-gradient\s*\(/i);
    }
  });

  it('20. Bans trailing periods in section headings (except canonical R2.1 hook headline), enforces <250 line modular limit, and preserves Part 5 data-testids', () => {
    for (const { rel, content } of readAllTsx()) {
      for (const h of content.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)) {
        const text = h[1].replace(/<[^>]+>/g, '').trim();
        if (text === 'Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed.') continue;
        expect(text.endsWith('.'), `Heading "${text}" in ${rel} ends with a period`).toBe(false);
      }
    }
    for (const file of allSourceFiles) {
      const rel = path.relative(SRC_DIR, file);
      const lineCount = fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
      expect(lineCount, `Source file ${rel} exceeds 250-line CLAUDE.md limit (${lineCount} lines)`).toBeLessThanOrEqual(250);
    }
    const combinedTsx = readAllTsx().map((f) => f.content).join('\n');
    const requiredIds = [
      'kya-mandate-form', 'mandate-budget-input', 'mandate-spread-input', 'mandate-sla-input',
      'sign-mandate-btn', 'mandate-signature-hash', 'mandate-rfc9421-header', 'judge-scenario-toolbar',
      'trigger-act1-btn', 'trigger-act2-btn', 'trigger-act3-btn', 'scenario-active-banner', 'scenario-dom-diff',
      'ag-studio-blotter', 'blotter-group-summary', 'blotter-saved-fraud-kpi', 'blotter-quick-filter',
      'blotter-csv-export-btn', 'blotter-status-tab-', 'blotter-row-', 'bryntum-sla-timeline',
      'sla-breach-badge-', 'sla-void-status-', 'forensic-detail-panel', 'forensic-ed25519-sig',
      'forensic-channel3-chart', 'forensic-hitl-approve-btn', 'copilot-action-wiring',
      'copilot-toggle-btn', 'copilot-drawer', 'copilot-hitl-card', 'copilot-confirm-stepup-btn',
    ];
    for (const id of requiredIds) {
      expect(combinedTsx, `Missing required Part 5 data-testid "${id}"`).toContain(id);
    }
  });
});
