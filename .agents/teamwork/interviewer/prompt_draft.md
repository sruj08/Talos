Build a capability showcase for the TALOS frontend (`web/`): wrap the existing operator interface in a startup-grade product landing page, a 5-part visual storytelling walkthrough, a side-by-side "Unprotected AI vs. TALOS-Protected AI" interactive manipulation simulator connected to the live backend pipeline, and a property-based plus browser/component test implementation, strictly without changing any existing backend logic.

Working directory: d:\Hackathons\PayPal\Talos
Integrity mode: development

Reference skills to use:
- `agent-browser`: `C:\Users\Harshad\.gemini\config\skills\agent-browser\SKILL.md`
- `ralph-loop`: `C:\Users\Harshad\.gemini\config\skills\ralph-loop\SKILL.md`
- `unslop`: `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md`
- `shadcn`: `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md`
- `gsd-plan-phase`: `C:\Users\Harshad\.gemini\config\skills\gsd-plan-phase\SKILL.md`

## Requirements

### R1. Startup Landing Page and 5-Part Storytelling Walkthrough
Build a professional startup/product landing page as the primary entry view in `web/src/app/page.tsx`, with smooth switching into the interactive simulator and existing operator dashboard views. It must include a clear explanation of what TALOS does, the problem it solves (autonomous AI shopping agents with wallet access exposed to hidden prompt-injection webpage traps, price gouging/fake stores, and irreversible payment capture), why the problem matters, how TALOS works (KYA Mandate permission slip, <4ms DOM Firewall webpage X-ray, Channel3 Fair-Price Oracle, and reversible PayPal Escrow Hold `AUTHORIZE` -> Tracking -> `CAPTURE`/`VOID`), key features and benefits, and a prominent Try Demo / Experience the Product button. Present the concept through a 5-part real-world storytelling scenario understandable to non-technical users: (1) what is happening in the real world, (2) what problem the user faces, (3) how the problem can be exploited, (4) how TALOS identifies or prevents it, and (5) what happens after TALOS intervenes.

### R2. Interactive Product Demonstration & AI-Agent Manipulation Simulator
Build an interactive, scenario-based product demonstration and side-by-side "Unprotected AI vs. TALOS-Protected AI" simulator (enhancing `PoisonedStoreSim.tsx`) where users perform actions, observe internal processing in real time, understand consequences, and see how the system responds. Visually and interactively demonstrate how an AI agent normally makes decisions, introduce scenarios with malicious or misleading inputs (hidden website prompt injection, price gouging, fake stores), show how an unprotected AI agent gets tricked into unauthorized or overpriced irreversible payments, show how TALOS detects and handles each scenario, and compare the normal/unprotected and TALOS-protected outcomes side by side.

### R3. Live Backend Pipeline Integration & Strict Zero-Backend-Change Constraint
Connect the frontend interactive simulator and live visualizations to the existing backend functionality and frontend pipeline components (`API-01`..`API-16`, `MandateStudio.tsx`, `AgStudioBlotter.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `useEscrowStream.ts`), adding frontend-side simulations and visualizations where needed. Strictly do not modify any backend logic, APIs, business logic, or architecture in `firewall-rs` (Rust) or `orchestrator-go` (Go); the existing backend must remain completely unchanged.

### R4. Property Test Suite, Browser Verification, and Requested Skills
Create and properly implement a property-based test suite alongside component/integration and browser tests covering the frontend simulator scenarios, state transitions, and UI flows. Use all five requested skills in executing the work: `gsd-plan-phase` for phase planning, `shadcn` for UI components, `unslop` to ensure a designed startup interface free of AI-generated UI tells, `ralph-loop` for disciplined iterative implementation with test gates, and `agent-browser` for end-to-end interactive browser verification.

## Verification Resources

Use the existing tests, scripts, and project setup in `d:\Hackathons\PayPal\Talos` and `d:\Hackathons\PayPal\Talos\web`.

## Acceptance Criteria

### Landing Page & Storytelling Experience
- [ ] `web/src/app/page.tsx` opens into a startup-grade landing page presenting what TALOS does, the problem, why it matters, how the solution works, key features/benefits, and a prominent CTA button that transitions smoothly into the interactive simulator and operator dashboard views.
- [ ] The 5-part real-world storytelling walkthrough visually walks through all five stages ((1) real-world context, (2) user problem, (3) exploitation mechanism, (4) TALOS detection/prevention, and (5) post-intervention outcome) in plain, non-technical language.

### Interactive AI-Agent Manipulation Simulator & Live Pipeline
- [ ] The interactive demonstration (`PoisonedStoreSim.tsx` and connected views) lets users trigger realistic scenarios (hidden prompt injection, price gouging/fake stores, irreversible vs. escrow-protected checkout) and compares the unprotected AI outcome against the TALOS-protected outcome side by side.
- [ ] Simulator and operator interactions connect to the existing backend pipeline and components (`API-01`..`API-16`, `MandateStudio.tsx`, `AgStudioBlotter.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `useEscrowStream.ts`) and display live visual feedback as scenarios execute.

### Property Tests, Build, and Browser Verification
- [ ] The property-based test suite and frontend unit/component tests execute and pass with zero failures.
- [ ] The frontend production build and typecheck in `web/` succeed with zero errors.
- [ ] Interactive verification via `agent-browser` confirms the landing page, 5-part storytelling flow, side-by-side manipulation simulator, and operator dashboard switch and operate cleanly without runtime or console errors.

### Strict Backend Immutability
- [ ] `git status` and `git diff` confirm zero modifications to any backend files (`firewall-rs/`, `orchestrator-go/`, or backend API definitions).
