Design a comprehensive implementation plan and investor-grade landing page and interactive storyline experience for TALOS (`web`), reviewed with `/war-room-council` and inspired by `https://www.fragment.im/`, so that anyone pitching, testing, or simulating the product experiences a sleek, jargon-free flow with fluid animations, 3D elements, and generated visuals.

Working directory: g:\PAYPAL
Integrity mode: demo
The team must NOT: copy code from existing open-source projects for core logic; run external scripts or delegate execution to other tools.

Reference material:
- Visual & motion inspiration: https://www.fragment.im/
- Referenced skills:
  - `/war-room-council` (`C:\Users\satav\.gemini\config\skills\war-room-council\SKILL.md`)
  - `/animate-motion-transfer` (`C:\Users\satav\.gemini\config\skills\animate-motion-transfer\SKILL.md`)
  - `/apple-design` (`C:\Users\satav\.gemini\config\skills\apple-design\SKILL.md`)
  - `/heroui-react` (`C:\Users\satav\.gemini\config\skills\heroui-react\SKILL.md`)
  - `/ui-ux-pro-max` (`C:\Users\satav\.gemini\config\skills\ui-ux-pro-max\SKILL.md`)
  - `/generative_ui` (`C:\Users\satav\.gemini\antigravity\builtin\skills\generative_ui\SKILL.md`)
  - `/ai-video-studio` (`C:\Users\satav\.gemini\config\skills\ai-video-studio\SKILL.md`)
  - `/unslop` (`C:\Users\satav\.gemini\config\skills\unslop\SKILL.md`)
  - `/hallmark` (`C:\Users\satav\.gemini\config\skills\hallmark\SKILL.md`)
- Existing workspace environment (`g:\PAYPAL`):
  - Next.js 15 Web Console (`web`) on `http://localhost:3000`
  - Go 2PC Orchestrator (`services/orchestrator-go`) on `http://127.0.0.1:8080`
  - Rust Firewall (`services/firewall-rs`) on `http://127.0.0.1:8081`
  - PostgreSQL 16 (`localhost:5432`) and Valkey 7.2 (`localhost:6379`)

## Requirements

### R1. War-Room Council Storyline Discussion & Implementation Plan
Discuss the investor-pitch storyline flow with `/war-room-council` to determine what to build and produce a comprehensive implementation plan so that anyone can easily try, test, and simulate TALOS. The design and plan must directly resolve the 4 investor-pitch issues on the current first screen:
1. **Eliminate Decision Overload (21 Buttons on Screen 1)**: Replace the competing 8 top-bar tabs (`SovereignStoryDock.tsx`) and 13 mode/hero/card buttons (`StartupProductHero.tsx`) with a clear, guided entry point.
2. **Business Language Instead of Engineer Jargon**: Frame the first-screen pitch around *"Problem -> Live Demo -> How Much Money It Saves -> How PayPal Makes Money"* rather than leading with raw architecture terms (*"Sovereign Clearinghouse"*, *"Cryptographic Agent Mandate"*, *"Red-Team Interception Arena"*, *"Market Fair-Price Oracle"*, *"SLA Forensics"*).
3. **Surface the "Aha!" Moment Directly in the Main Flow**: Bring the Side-by-Side Comparison (`SideBySideAgentComparison.tsx` — left side: Normal AI gets tricked and loses $480; right side: TALOS blocks the trick and buys it for $249) directly into the landing page storyline instead of hiding it behind `/simulator`.
4. **Move Raw Technical Guts Behind On-Demand Proof**: Place raw technical telemetry (`128-hex Ed25519 signatures`, `RFC 9421 headers`, `9277 bps`, and `lol_html + DeBERTa-v3 ONNX`) inside a clean *"View Technical Proof"* drawer rather than displaying them alongside consumer story copy at second 0.

### R2. Four-Stage Investor Storyline Flow & Interactive Scenarios
Structure the landing page and interactive simulation around the 4-stage investor storyline:
1. **Above the Fold — The 5-Second Hook (Zero Jargon)**:
   - Headline: *"Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed."*
   - One primary CTA button: **"Watch Live 60-Second Simulation ->"**
2. **Interactive Scene 1 — "Set the Rules" (Plain English)**:
   - Present *"Step 1: Give Your AI a Spending Allowance ($300 Max)"* instead of *"Mandate Clearing Studio (`Ed25519`)"*.
3. **Interactive Scene 2 — "Watch the AI Shop (3 Real-World Scenarios)"**:
   - **Scenario 1: The Scam Store ($480 Trap)** — Watch Normal AI lose $480 vs. TALOS block the hidden trick and save $231 (purchasing for $249).
   - **Scenario 2: The Honest Store ($249 Verified)** — Watch PayPal hold the $249 safely until FedEx delivers the box, then pay the seller.
   - **Scenario 3: The Late Delivery & Big Order ($450)** — Watch PayPal automatically refund a late shipment in 0 seconds, and pause a $450 item so a human can click **Approve with PayPal**.
4. **Interactive Scene 3 — "The CFO Dashboard (Where the Money Lives)"**:
   - Smoothly present the Live Transaction Table (`AgStudioBlotter.tsx`) and Delivery Timeline (`BryntumSlaBoard.tsx`) as the direct result of what the user clicked, with the *"View Technical Proof"* drawer accessible for deep technical inspection.

### R3. UI/UX Engineering, Colour Psychology & Design System
Act as a UI/UX engineer and colour psychologist to decide the colour scheme, gradients, distinctive typography, generous spacing, and iconography using `https://www.fragment.im/` as inspiration and applying `/apple-design`, `/heroui-react`, `/ui-ux-pro-max`, `/generative_ui`, `/unslop`, and `/hallmark` so the interface looks sleek, intentional, and free of generic AI-generated visual clichés.

### R4. Animations, 3D Elements & Visual Media Pipeline
Incorporate fluid animations, 3D visual elements, motion inspired by `https://www.fragment.im/` and `/animate-motion-transfer`, and visual/video assets generated via `/ai-video-studio` so that the landing page and simulation scenarios feel cohesive, interactive, and competition-winning.

## Verification Resources

- Existing repository docs and architecture maps in `g:\PAYPAL`: `CLAUDE.md`, `MAP.md`, `docs/08-project/PHASE_WISE_EXECUTION_AND_SKILL_PLAYBOOK.md`, and `.planning/graphs/GRAPH_REPORT.md`
- Existing web console components in `g:\PAYPAL\web`: `SovereignStoryDock.tsx`, `StartupProductHero.tsx`, `SideBySideAgentComparison.tsx`, `AgStudioBlotter.tsx`, and `BryntumSlaBoard.tsx`
- Visual and motion reference: `https://www.fragment.im/`

## Acceptance Criteria

### Storyline & War-Room Council Strategy
- [ ] Delivers a complete implementation plan informed by `/war-room-council` covering the investor storyline flow, component architecture, visual/animation pipeline, and execution steps across all requested skills.
- [ ] Addresses all 4 investor critique points: (1) replacing the 21 competing buttons/tabs on Screen 1 (`SovereignStoryDock.tsx` + `StartupProductHero.tsx`) with a single guided entry flow, (2) replacing raw backend jargon on the initial view with plain business language, (3) integrating `SideBySideAgentComparison.tsx` directly into the main storyline flow, and (4) encapsulating `128-hex Ed25519 signatures`, `RFC 9421 headers`, `9277 bps`, and `lol_html + DeBERTa-v3 ONNX` inside a *"View Technical Proof"* drawer.
- [ ] Covers all 4 investor storyline stages: the Above-the-Fold 5-Second Hook (*"Your AI Agent Has Your Wallet. TALOS Makes Sure It Never Gets Scammed."* + *"Watch Live 60-Second Simulation ->"*), Scene 1 (*"Step 1: Give Your AI a Spending Allowance ($300 Max)"*), Scene 2 (all 3 scenarios: $480 Scam Store vs. $249 saving $231, $249 Honest Store FedEx escrow release, and 0-second late-delivery refund + $450 **Approve with PayPal** human step-up), and Scene 3 (CFO Dashboard showing `AgStudioBlotter.tsx` and `BryntumSlaBoard.tsx`).

### UI/UX, Colour Psychology, Animations & Visuals
- [ ] Specifies and applies a documented colour psychology rationale, palette, gradient tokens, typography scale, spacing system, iconography (`/heroui-react`, `/apple-design`, `/ui-ux-pro-max`), 3D elements, motion choreography inspired by `https://www.fragment.im/` (`/animate-motion-transfer`), and `/ai-video-studio` visual assets, adhering to `/unslop` and `/hallmark` guidelines.
- [ ] Any new or modified frontend code in `g:\PAYPAL\web` compiles cleanly and passes existing build/type checks so that the storyline and simulation can be tested end-to-end.
