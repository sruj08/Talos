# Project: TALOS Investor-Grade Landing Page, 4-Stage Interactive Storyline & War-Room Implementation Plan

## Architecture

### 1. System Overview & Narrative Flow
TALOS (`g:\PAYPAL\web`, Next.js 15 / React 19 / TypeScript) transforms its first-screen experience from a 21-button multi-route operator directory into a unified, `https://www.fragment.im/`-inspired **4-Stage Investor Storyline & Live 60-Second Simulation** reviewed by `/war-room-council`:

```
[Minimal Storyline Header: Brand + 4 Stage Anchors + "View Technical Proof" Toggle + Theme/FX Controls]
        │
        ▼
[Stage 0: Above-the-Fold 5-Second Hook (Zero Jargon)]
  - Headline: "Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed."
  - Business Pitch Strip: Problem -> Live Demo -> How Much Money It Saves ($231/tx) -> How PayPal Makes Money
  - Interactive 3D / Spatial Fragment Shield & Escrow Vault Visual (FragmentSpatialHero3D.tsx + edge-masked plates)
  - Single Primary CTA: "Watch Live 60-Second Simulation ->" (triggers guided auto-play or jumps to Scene 1)
        │
        ▼
[Interactive Scene 1: "Set the Rules" (Plain English)]
  - Heading: "Step 1: Give Your AI a Spending Allowance ($300 Max)"
  - Plain-English Spending Controls ($300 Max Cap, Fair-Price Guard, 48h Delivery Guarantee)
  - 1-Click Allowance Lock -> Generates cryptographic seal tucked inside "View Technical Proof" Drawer
        │
        ▼
[Interactive Scene 2: "Watch the AI Shop (3 Real-World Scenarios)"]
  - Synchronized Dual-Branch Motion Trajectory (/animate-motion-transfer):
    Left: Normal AI Agent (Unprotected) vs. Right: TALOS + PayPal Agent (Protected)
  - Scenario 1: The Scam Store ($480 Trap) -> Normal AI loses $480 vs. TALOS blocks hidden trick & saves $231 (buys for $249)
  - Scenario 2: The Honest Store ($249 Verified) -> PayPal holds $249 safely until FedEx delivers (26h/48h), then pays seller
  - Scenario 3: The Late Delivery & Big Order ($450) -> PayPal auto-refunds late $219 shipment in 0 seconds + pauses $450 item for human "Approve with PayPal" (PayPalStepUpModal.tsx)
        │
        ▼
[Interactive Scene 3: "The CFO Dashboard (Where the Money Lives)"]
  - "How PayPal Makes Money" Unit Economics Strip (Escrow Float + Verified Agentic Take-Rate + $0 Dispute Ops)
  - Live Transaction Table (AgStudioBlotter.tsx) + Delivery Timeline (BryntumSlaBoard.tsx) reacting via TALOS_ESCROW_EVENT
  - On-Demand "View Technical Proof" Drawer (TechnicalProofDrawer.tsx / ForensicDetailPanel.tsx):
    Encapsulates 128-hex Ed25519 signatures, RFC 9421 headers, 9277 bps, and lol_html + DeBERTa-v3 ONNX DOM diffs
```

### 2. Colour Psychology & Design System (`fragment.im` + `/apple-design` + `/ui-ux-pro-max` + `/heroui-react` + `/unslop` + `/hallmark`)
- **Colour Psychology Rationale**:
  - **Obsidian Vault Precision (`#07080D` canvas, `#0F1420` elevated surface, `#151C2C` card, `#FFFFFF`/`#FAF8F5` light-mode institutional parchment)**: Inspired by `https://www.fragment.im/`, dark obsidian and crisp daylight parchment project institutional permanence, zero visual noise, and high-contrast legibility.
  - **PayPal Fiduciary Blue (`#003087` deep / `#0070E0` primary / `oklch(0.56 0.19 255)`)**: Communicates bank-grade authority, non-custodial escrow protection, and primary interactive guidance (`< 5%` viewport area).
  - **Verified Value Emerald (`#0A7A3D` / `#10B981` / `oklch(0.69 0.17 162)`)**: Signals verified fair pricing (`$249`), released FedEx escrow (`PAYPAL_CAPTURED`), and net capital saved (`+$231`).
  - **Escrow Hold & Human Vigilance Gold/Amber (`#FFB600` / `#F59E0B` / `#FFC439` PayPal Gold)**: Signals active 29-day/48h escrow hold (`PAYPAL_AUTHORIZED`) and human-in-the-loop **Approve with PayPal** step-up (`$450 > $300` allowance).
  - **Threat Interception Crimson (`#D9360B` / `#EF4444` / `oklch(0.63 0.21 25)`)**: Signals blocked `$480` scam store traps, stripped prompt injections, and `0-second` automatic SLA breach refunds (`PAYPAL_VOIDED`).
- **Gradient & Surface Tokens**:
  - Subtle architectural surface gradients (`--gradient-obsidian-stage`, `--gradient-paypal-vault`, `--gradient-specular-border`) tokenized in `globals.css` `:root` — zero neon purple/indigo AI-slop gradients.
- **Typography, Spacing & Anti-Slop Discipline**:
  - Optical sizing (`font-optical-sizing: auto`), tight display tracking (`-0.03em`), `font-variant-numeric: tabular-nums` on 100% of currency/latency/SLA figures, sentence-case UI labels, `>= 12px` (`text-xs`) minimum font size floor, `4px` spatial grid, concentric border radii, and GPU-accelerated spring transitions (`cubic-bezier(0.22, 1, 0.36, 1)`).

---

## Feature Inventory

Every feature from the Phase 0 Survey (`teamwork_explorer_survey_1`, `teamwork_spec_miner_survey_2`, `teamwork_explorer_survey_3`) appears below with its assigned milestone. Zero features are left unassigned.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F-01 | Eliminate 21 Competing Buttons on Screen 1 | Replace the 8 top-bar tabs (`SovereignStoryDock.tsx`) and 13+ hero/mode/card buttons (`StartupProductHero.tsx`) on `/` with a quiet guided header and a single primary CTA (`"Watch Live 60-Second Simulation ->"`), while keeping sub-routes (`/story`, `/mandates`, `/simulator`, `/blotter`, `/sla`, `/step-up`, `/command-center`) intact. | M1 | survey (R1.1) |
| F-02 | Business Language Reframing | Frame Screen 1 and storyline copy around *"Problem -> Live Demo -> How Much Money It Saves -> How PayPal Makes Money"* instead of leading with raw architecture jargon (*"Sovereign Clearinghouse"*, *"Cryptographic Agent Mandate"*, *"Red-Team Interception Arena"*, *"Market Fair-Price Oracle"*, *"SLA Forensics"*). | M1 | survey (R1.2) |
| F-03 | Surface Side-by-Side Comparison in Main Flow | Integrate `SideBySideAgentComparison.tsx` (Normal AI gets tricked and loses `$480` vs. TALOS blocks the trick and buys it for `$249`, saving `$231`) directly into Scene 2 of the landing page `/` storyline instead of hiding it behind `/simulator`. | M1 | survey (R1.3) |
| F-04 | On-Demand `"View Technical Proof"` Drawer | Encapsulate `128-hex Ed25519 signatures`, `RFC 9421 headers`, `9277 bps`, and `lol_html + DeBERTa-v3 ONNX` inside a clean `"View Technical Proof"` drawer (`TechnicalProofDrawer.tsx` + collapsible proof sections in `MandateStudio.tsx`, `PoisonedStoreSim.tsx`, `ForensicDetailPanel.tsx`) closed at second 0 (`sealExpanded = false` by default) while remaining mounted in SSR DOM for tests. | M1 | survey (R1.4) |
| F-05 | War-Room Council Storyline Discussion & Implementation Plan | Deliver a comprehensive implementation plan (`docs/08-project/WAR_ROOM_COUNCIL_STORYLINE_AND_IMPLEMENTATION_PLAN.md`) informed by `/war-room-council` (Jobs, Ive, Karp, Thiel, Buffett, Munger, Patrick Jane, Karpathy, Specter, R.S. Sharma, Paul Graham) covering the investor storyline flow, component architecture, colour psychology, 3D/motion/visual pipeline, and execution steps across all 9 referenced skills. | M1 | survey (R1) |
| F-06 | Stage 0: Above-the-Fold 5-Second Hook | Render headline *"Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed."* and single primary CTA button **"Watch Live 60-Second Simulation ->"** (`data-testid="landing-try-demo-cta"`) with zero competing mode-switcher grids. | M1 | survey (R2.1) |
| F-07 | Interactive Scene 1: `"Set the Rules"` (Plain English) | Present *"Step 1: Give Your AI a Spending Allowance ($300 Max)"* as the primary scene title/copy on `MandateStudio.tsx` with plain-English controls (`$300` max budget, fair-price check, `48h` delivery rule) and 1-click allowance lock. | M1 | survey (R2.2) |
| F-08 | Interactive Scene 2, Scenario 1: `"The Scam Store ($480 Trap)"` | Clickable Scenario 1 showing Normal AI losing `$480` to hidden prompt injection vs. TALOS blocking the trick in `2.84ms` and buying for `$249` (saving `$231`), broadcasting live to the CFO Dashboard. | M1 | survey (R2.3) |
| F-09 | Interactive Scene 2, Scenario 2: `"The Honest Store ($249 Verified)"` | Clickable Scenario 2 showing PayPal holding `$249` safely in escrow (`PAYPAL_AUTHORIZED`) until FedEx (`#794892104852`) delivers the box (`26h <= 48h`), then releasing payment (`PAYPAL_CAPTURED`) to the seller. | M1 | survey (R2.3) |
| F-10 | Interactive Scene 2, Scenario 3: `"The Late Delivery & Big Order ($450)"` | Clickable Scenario 3 showing PayPal automatically refunding a late shipment (`$219` at `56h > 48h` SLA) in `0 seconds` (`PAYPAL_VOIDED`), and pausing a `$450` order (`+$150` over `$300` allowance) so a human can click **Approve with PayPal** (`PayPalStepUpModal.tsx`). | M1 | survey (R2.3) |
| F-11 | Interactive Scene 3: `"The CFO Dashboard (Where the Money Lives)"` | Present the Live Transaction Table (`AgStudioBlotter.tsx`), Delivery Timeline (`BryntumSlaBoard.tsx`), *"How PayPal Makes Money"* unit economics bar, and on-demand `"View Technical Proof"` drawer as the live result of Scene 1 & 2 clicks. | M1 | survey (R2.4) |
| F-12 | Colour Psychology, Gradient Tokens & Design System | Tokenize the documented institutional colour psychology palette, gradient tokens, typography scale, spacing system, and iconography (`/heroui-react`, `/apple-design`, `/ui-ux-pro-max`, `/generative_ui`, `/unslop`, `/hallmark`) in `web/src/app/globals.css`, `web/tailwind.config.ts`, and `docs/02-design/DESIGN_SYSTEM.md`. | M1 | survey (R3) |
| F-13 | Typography, Tabular Numerals & Anti-Slop Compliance | Enforce `tabular-nums` on all financial/latency numbers, sentence-case badges, `>= 12px` font floor in storyline components, concentric border radii, and `< 250` lines per source file in `web/src/`. | M1 | survey (R3) |
| F-14 | HeroUI v3 & Apple Spatial Consistency | Tactile press feedback (`scale(0.97)`), `>= 44px` hit targets, spatially consistent slide-over/collapsible `"View Technical Proof"` drawer and `PayPalStepUpModal`, and two-channel status pills (Lucide icon + text label + semantic tone). | M1 | survey (R3) |
| F-15 | `fragment.im`-Inspired 3D Elements & Motion Choreography | Create `FragmentSpatialHero3D.tsx` (`<= 250` lines) with interactive 3D perspective/spatial fragment shield & escrow vault choreography, `/animate-motion-transfer` synchronized dual-branch pipeline motion in `SideBySideAgentComparison.tsx`, and a 60-second cue-driven simulation controller (`prefers-reduced-motion` aware). | M1 | survey (R4) |
| F-16 | `/ai-video-studio` Visual Media Assets & E2E Test Suite | Integrate edge-masked high-contrast visual plates (`/assets/talos-hero-visual.png`, `/assets/talos-escrow-visual.png`, `/assets/talos-clearing-artifact.png`) and bespoke SVG/Canvas 3D visual plates (`public/assets/talos-fragment-shield-3d.svg`), and validate 100% of `F-01`–`F-16` with 4-tier requirement-driven unit/SSR/E2E tests (`TEST_INFRA.md`, `TEST_READY.md`, `investor-storyline-r1-r4.test.tsx`). | M1 & E2E | survey (R4) |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | War-Room Council Plan, Design System, 3D/Motion Pipeline & 4-Stage Investor Storyline (`web`) | All features `F-01`–`F-16`: War-Room Council Implementation Plan (`docs/08-project/WAR_ROOM_COUNCIL_STORYLINE_AND_IMPLEMENTATION_PLAN.md`), colour psychology & gradient design tokens (`globals.css`), 3D spatial hero & 60s simulation player (`FragmentSpatialHero3D.tsx`), on-demand `"View Technical Proof"` drawer (`TechnicalProofDrawer.tsx`), refactored Screen 1 & 4-stage storyline on `/` (`page.tsx`, `StartupProductHero.tsx`, `SovereignHeaderAndDock.tsx`, `SovereignStoryDock.tsx`, `MandateStudio.tsx`, `PoisonedStoreSim.tsx`, `SideBySideAgentComparison.tsx`, `AgStudioBlotter.tsx`, `ForensicDetailPanel.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`), and updated quality gates. | none | DONE |
| E2E | Requirement-Driven 4-Tier Verification & Adversarial Hardening | `TEST_INFRA.md`, `TEST_READY.md`, 4-tier test suite (`web/src/__tests__/investor-storyline-r1-r4.test.tsx` + `anti-slop-20-gate.test.ts` + `console-f01-f12.test.tsx` + `showcase-rendering.test.ts`), and full build/type/test verification across Tiers 1–5 (`11/11` files, `101/101` tests, `14/14` Next.js 15 routes). | M1 | DONE |

---

## Interface Contracts

### 1. `StartupProductHero.tsx` ↔ `FragmentSpatialHero3D.tsx` & Storyline Stages
- `StartupProductHeroProps`:
  - Renders Stage 0 Above-the-Fold 5-Second Hook (`data-testid="startup-landing-hero"`):
    - Headline: `"Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed."`
    - Business Value Framing Strip (`data-testid="investor-business-pitch-strip"`): *Problem -> Live Demo -> How Much Money It Saves ($231/tx) -> How PayPal Makes Money*
    - Primary CTA (`data-testid="landing-try-demo-cta"`): `"Watch Live 60-Second Simulation ->"` (starts guided 60-second simulation across Scene 1 -> Scene 2 -> Scene 3 or scrolls smoothly into Scene 1).
    - Mounts `<FragmentSpatialHero3D />` (`data-testid="fragment-spatial-hero-3d"`).

### 2. `TechnicalProofDrawer.tsx` ↔ `MandateStudio.tsx`, `PoisonedStoreSim.tsx`, `ForensicDetailPanel.tsx`
- `TechnicalProofDrawerProps`:
  - `title?: string; buttonLabel?: string; defaultOpen?: boolean; testId?: string; children: React.ReactNode`
  - Uses CSS Grid transition (`grid-rows-[0fr] opacity-0` when closed -> `grid-rows-[1fr] opacity-100` when open, with `overflow-hidden`) so children remain mounted in SSR markup (`renderToStaticMarkup`) while hidden from the zero-second visual view until the user clicks **"View Technical Proof"**.
  - Encapsulates:
    1. `128-hex Ed25519 signatures` & `RFC 9421 headers` (`data-testid="mandate-crypto-proof"`, `mandate-pubkey-hex`, `mandate-signature-hex`, `mandate-signature-hash`, `mandate-rfc9421-header`, `forensic-ed25519-sig`). Note: `sealExpanded` in `useMandateStudio.ts` defaults to `false` on initial load and expands to `true` when the user clicks `"View Technical Proof"` or submits the signature form.
    2. `9277 bps` & `lol_html + DeBERTa-v3 ONNX` DOM diffs (`data-testid="scenario-dom-diff"`, `forensic-detail-panel`, `forensic-card-dom-diff`, `forensic-card-channel3`, `forensic-card-paypal-actions`).

### 3. `web/src/app/page.tsx` (Unified 4-Stage Investor Storyline Flow)
- Renders the complete 4-Stage Investor Storyline on `/` (`data-testid="talos-landing-page"`):
  - Quiet `<SovereignTopNavBar />` (simplified on `/` to eliminate competing 8-tab clutter while preserving stage navigation and `/command-center` operator switch).
  - **Stage 0 (Above the Fold)**: `<StartupProductHero />`
  - **Interactive Scene 1 (`data-testid="storyline-scene-1-rules"`)**: *"Step 1: Give Your AI a Spending Allowance ($300 Max)"* mounting `<MandateStudio />`.
  - **Interactive Scene 2 (`data-testid="storyline-scene-2-shop"`)**: *"Watch the AI Shop (3 Real-World Scenarios)"* mounting `<PoisonedStoreSim />` (which includes `<SideBySideAgentComparison />` at the top of the scene) + `<PayPalStepUpModal />` for Scenario 3's `$450` **Approve with PayPal** human step-up.
  - **Interactive Scene 3 (`data-testid="storyline-scene-3-cfo"`)**: *"The CFO Dashboard (Where the Money Lives)"* with *"How PayPal Makes Money"* revenue card + `<AgStudioBlotter />` + `<BryntumSlaBoard />` + on-demand `"View Technical Proof"` drawer.

---

## Code Layout

All frontend code lives in `g:\PAYPAL\web` and documentation in `g:\PAYPAL\docs`. Every non-test `.ts`, `.tsx`, and `.css` file in `g:\PAYPAL\web\src\` **MUST strictly remain `<= 250` lines** (`CLAUDE.md` §5 and `anti-slop-20-gate.test.ts` Gate 20).

```
g:\PAYPAL\
├── PROJECT.md
├── TEST_INFRA.md
├── TEST_READY.md
├── docs\
│   ├── 02-design\
│   │   ├── DESIGN_SYSTEM.md
│   │   └── UI_SPEC.md
│   └── 08-project\
│       └── WAR_ROOM_COUNCIL_STORYLINE_AND_IMPLEMENTATION_PLAN.md
└── web\
    ├── public\
    │   └── assets\
    │       ├── talos-hero-visual.png
    │       ├── talos-escrow-visual.png
    │       ├── talos-clearing-artifact.png
    │       └── talos-fragment-shield-3d.svg
    ├── e2e\
    │   └── talos-3act-demo.spec.ts
    └── src\
        ├── app\
        │   ├── globals.css                  (<= 250 lines)
        │   ├── layout.tsx                   (<= 250 lines)
        │   ├── page.tsx                     (<= 250 lines)
        │   └── command-center\page.tsx      (<= 250 lines)
        ├── components\
        │   ├── StartupProductHero.tsx       (<= 250 lines)
        │   ├── FragmentSpatialHero3D.tsx    (<= 250 lines)
        │   ├── TechnicalProofDrawer.tsx     (<= 250 lines)
        │   ├── SovereignHeaderAndDock.tsx   (<= 250 lines)
        │   ├── SovereignStoryDock.tsx       (<= 250 lines)
        │   ├── MandateStudio.tsx            (<= 250 lines)
        │   ├── PoisonedStoreSim.tsx         (<= 250 lines)
        │   ├── SideBySideAgentComparison.tsx(<= 250 lines)
        │   ├── PayPalStepUpModal.tsx        (<= 250 lines)
        │   ├── AgStudioBlotter.tsx          (<= 250 lines)
        │   ├── ForensicDetailPanel.tsx      (<= 250 lines)
        │   └── BryntumSlaBoard.tsx          (<= 250 lines)
        ├── hooks\
        │   ├── useMandateStudio.ts          (<= 250 lines)
        │   ├── usePoisonedStoreSim.ts       (<= 250 lines)
        │   ├── useAgStudioBlotter.ts        (<= 250 lines)
        │   ├── useBryntumTimeline.ts        (<= 250 lines)
        │   ├── usePayPalStepUp.ts           (<= 250 lines)
        │   └── useEscrowStream.ts           (<= 250 lines)
        ├── lib\
        │   ├── agent-comparison-scenarios.ts(<= 250 lines)
        │   ├── storytelling-parts.ts        (<= 250 lines)
        │   ├── guided-demo-steps.ts         (<= 250 lines)
        │   └── phase6-events.ts             (<= 250 lines)
        └── __tests__\
            ├── anti-slop-20-gate.test.ts
            ├── console-f01-f12.test.tsx
            ├── showcase-rendering.test.ts
            ├── showcase-properties.test.ts
            └── investor-storyline-r1-r4.test.tsx
```
