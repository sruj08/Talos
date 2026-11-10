# Dispatch — teamwork_spec_miner_showcase_1

## Identity & Paths
- **Your Identity**: `teamwork_spec_miner_showcase_1` (`teamwork_spec_miner`)
- **Your Working Directory**: `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1`
- **Original Request**: `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Parent Conversation ID**: `49f6a062-fba5-4229-aa89-1d33d2111cce`

## Objective
Perform a read-only specification and skill requirements survey for the TALOS Frontend Capability Showcase (`web/`).

## Tasks
1. Read `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`, `d:\Hackathons\PayPal\Talos\CLAUDE.md`, `d:\Hackathons\PayPal\Talos\MAP.md`, `d:\Hackathons\PayPal\Talos\PROJECT.md` (if present), and `d:\Hackathons\PayPal\Talos\.planning\graphs\GRAPH_REPORT.md` (if present).
2. Read the 5 reference skills specified in `ORIGINAL_REQUEST.md`:
   - `C:\Users\Harshad\.gemini\config\skills\gsd-plan-phase\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\ralph-loop\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\agent-browser\SKILL.md`
3. Extract a complete, unambiguous feature inventory and design/quality specification covering R1, R2, R3, R4, all acceptance criteria, `unslop` design rules (avoiding AI-slop tells, typography, color, spacing, layout), `shadcn` usage, `ralph-loop` / `gsd-plan-phase` artifacts, and `agent-browser` verification requirements.
4. Write your detailed findings to `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\analysis.md` and a complete handoff report to `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\handoff.md`, then notify parent `49f6a062-fba5-4229-aa89-1d33d2111cce` via `send_message`.


## 2026-11-09T14:45:48Z
You are `teamwork_spec_miner_showcase_1` (`teamwork_spec_miner`).
Your working directory is `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1`.
Your parent conversation ID is `49f6a062-fba5-4229-aa89-1d33d2111cce`.

MANDATORY FIRST STEP:
Read `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md` and `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\DISPATCH.md` before starting work.

## Objective
Perform a read-only specification and skill requirements survey for the TALOS Frontend Capability Showcase (`web/`). Do NOT modify any code or files outside your working directory `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1`.

## Tasks
1. Read `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`, `d:\Hackathons\PayPal\Talos\CLAUDE.md`, `d:\Hackathons\PayPal\Talos\MAP.md`, `d:\Hackathons\PayPal\Talos\PROJECT.md` (if present), and `d:\Hackathons\PayPal\Talos\.planning\graphs\GRAPH_REPORT.md` (if present).
2. Read the 5 reference skills specified in `ORIGINAL_REQUEST.md`:
   - `C:\Users\Harshad\.gemini\config\skills\gsd-plan-phase\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\ralph-loop\SKILL.md`
   - `C:\Users\Harshad\.gemini\config\skills\agent-browser\SKILL.md`
3. Extract a complete, unambiguous feature inventory and design/quality specification covering:
   - R1: Startup Landing Page & 5-Part Storytelling Walkthrough (stages 1-5 in plain language, what TALOS does, the problem, why it matters, how it works: KYA Mandate, <4ms DOM Firewall X-ray, Channel3 Fair-Price Oracle, PayPal Escrow Hold `AUTHORIZE` -> Tracking -> `CAPTURE`/`VOID`, CTA transitions)
   - R2: Interactive Product Demonstration & Side-by-Side "Unprotected AI vs. TALOS-Protected AI" Manipulation Simulator (hidden prompt injection, price gouging, fake stores, real-time internal processing observation, side-by-side comparison)
   - R3: Live Backend Pipeline Integration (`API-01`..`API-16`, `MandateStudio.tsx`, `AgStudioBlotter.tsx`, `BryntumSlaBoard.tsx`, `PayPalStepUpModal.tsx`, `useEscrowStream.ts`) and strict zero-backend-change constraint
   - R4: Property-based test suite, browser verification, and exact requirements from the 5 reference skills (`gsd-plan-phase`, `shadcn`, `unslop`, `ralph-loop`, `agent-browser`).
4. Maintain `progress.md` in your working directory, write your detailed findings to `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\analysis.md` and a complete handoff report to `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_spec_miner_showcase_1\handoff.md`, then notify parent `49f6a062-fba5-4229-aa89-1d33d2111cce` via `send_message`.
