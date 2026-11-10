# Dispatch — teamwork_reviewer_showcase_2

## Identity & Paths
- **Your Identity**: `teamwork_reviewer_showcase_2` (`teamwork_reviewer`)
- **Your Working Directory**: `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2`
- **Original Request**: `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Scope & Worker Handoff**:
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\orchestrator_main_1\SCOPE.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1\changes.md`
  - `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1\handoff.md`
  - `d:\Hackathons\PayPal\Talos\TEST_READY.md`
- **Parent Conversation ID**: `49f6a062-fba5-4229-aa89-1d33d2111cce`

## Objective
Independently review UI/UX quality (`unslop` & `shadcn` guidelines), 20-gate anti-slop compliance, property-based test coverage, E2E test coverage, and backend immutability for the TALOS Frontend Capability Showcase (`web/`). Do NOT modify any project files outside your working directory `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2`.

## Tasks
1. Read `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`, `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md`, `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md`, and `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1\handoff.md`.
2. Audit all new and modified files in `web/src/` and `web/e2e/` for:
   - Complete compliance with `unslop` (zero AI-slop tells, `<= 250` lines per file, proper typography/color/spacing tokens) and `shadcn` composition patterns.
   - Quality and depth of the `fast-check` property-based test suite (`web/src/__tests__/showcase-properties.test.ts`) and Playwright E2E suite (`web/e2e/talos-3act-demo.spec.ts`).
   - Run `npx tsc --noEmit` and `npm test` in `d:\Hackathons\PayPal\Talos\web` (do not kill the running `:3000`, `:8081`, `:8082` processes so E2E/browser checks can run cleanly).
   - Check `git status --porcelain services/ sdk/ api/ postman/ tests/` and `git diff --stat services/ sdk/ api/ postman/ tests/` to confirm zero backend modifications.
3. Write your detailed review and explicit verdict (`APPROVE` or `REQUEST_CHANGES`) in `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2\handoff.md`, then notify parent `49f6a062-fba5-4229-aa89-1d33d2111cce` via `send_message`.


## 2026-11-09T15:42:07Z
You are `teamwork_reviewer_showcase_2` (`teamwork_reviewer`).
Your working directory is `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2`.
Your parent conversation ID is `49f6a062-fba5-4229-aa89-1d33d2111cce`.

MANDATORY FIRST STEP:
Read `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md` and `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2\DISPATCH.md` before starting work.

## Objective
Independently review UI/UX quality (`unslop` & `shadcn` guidelines), 20-gate anti-slop compliance, property-based test coverage, E2E test coverage, and backend immutability for the TALOS Frontend Capability Showcase (`web/`). Do NOT modify any project files outside your working directory `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2`.

## Tasks
1. Read `d:\Hackathons\PayPal\Talos\.agents\teamwork\ORIGINAL_REQUEST.md`, `C:\Users\Harshad\.gemini\config\skills\unslop\SKILL.md`, `C:\Users\Harshad\.gemini\config\skills\shadcn\SKILL.md`, and `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_worker_showcase_1\handoff.md`.
2. Audit all new and modified files in `web/src/` and `web/e2e/` for:
   - Complete compliance with `unslop` (zero AI-slop tells, `<= 250` lines per file, proper typography/color/spacing tokens) and `shadcn` composition patterns.
   - Quality and depth of the `fast-check` property-based test suite (`web/src/__tests__/showcase-properties.test.ts`) and Playwright E2E suite (`web/e2e/talos-3act-demo.spec.ts`).
   - Run `npx tsc --noEmit` and `npm test` in `d:\Hackathons\PayPal\Talos\web` (do not kill the running `:3000`, `:8081`, `:8082` processes so E2E/browser checks can run cleanly).
   - Check `git status --porcelain services/ sdk/ api/ postman/ tests/` and `git diff --stat services/ sdk/ api/ postman/ tests/` to confirm zero backend modifications.
3. Maintain `progress.md` in your working directory, write your detailed review and explicit verdict (`APPROVE` or `REQUEST_CHANGES`) in `d:\Hackathons\PayPal\Talos\.agents\teamwork\teamwork_reviewer_showcase_2\handoff.md`, then notify parent `49f6a062-fba5-4229-aa89-1d33d2111cce` via `send_message`.
