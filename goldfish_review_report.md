Status: resolved

# Goldfish Annotated Review Report

**Target:** `docs/02-design/UI_SPEC.md` (`full file: L1-L187`) & Frontend Implementation (`web/src/`)

## Prioritized Findings & AI Suggestions

### [Issue 1] [`design_critic-1-1` / `zoom_out-1-1` / `comprehension-1-1`] - Severity: Blocker
*   **Affected Scope:** [Lines 7-65](docs/02-design/UI_SPEC.md#L7-L65) (`Section 1 & Section 2`), [page.tsx](web/src/app/page.tsx#L28-L185), [StartupProductHero.tsx](web/src/components/StartupProductHero.tsx#L55-L240)
*   **Discrepancy Description:** `UI_SPEC.md` jumps straight into an enterprise operator console without specifying a visual-first landing page architecture, icon scale hierarchy, or anti-clutter card nesting rules. Meanwhile, `page.tsx` stacks four redundant prose walkthrough systems on top of each other, places Step `02` (`PoisonedStoreSim`) on the left before Step `01` (`MandateStudio`) on the right, and buries `SovereignTopTelemetryBar` halfway down the page.
*   **Rationale:** Reading left-to-right on desktop encounters Step `02` before Step `01`, and first-time visitors see 35+ nested grey rectangles of `11px` text repeating the same narrative instead of a spacious, minimalist landing page with big icons and visual illustrations.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Completely valid. We must update `UI_SPEC.md` to specify the Visual-First Minimalist Landing Page + Command Center architecture, fix the causal grid order in `page.tsx` so Module `01` (`MandateStudio`) sits before Module `02` (`PoisonedStoreSim`), and eliminate redundant mid-page hero banners.
*   ***Proposed Edit:***
    *   Location: `docs/02-design/UI_SPEC.md` (Section 1 & Section 2) and `web/src/app/page.tsx`
    *   Change: Define the Visual Hero (`talos-hero-visual.png`), 4 Big-Icon Architectural Pillars (`56px` icon medallions), 5-Stage Visual Stepper (`talos-escrow-visual.png`), and restore causal order (`01 Mandate Studio` left -> `02 Red-Team Arena` right).

### [Issue 2] [`design_critic-1-2` / `zoom_out-1-3`] - Severity: Blocker
*   **Affected Scope:** [Lines 40-97](docs/02-design/UI_SPEC.md#L40-L97), [StartupProductHero.tsx](web/src/components/StartupProductHero.tsx#L58-L239), [PoisonedStoreSim.tsx](web/src/components/PoisonedStoreSim.tsx#L43-L220), [SideBySideAgentComparison.tsx](web/src/components/SideBySideAgentComparison.tsx#L64-L221)
*   **Discrepancy Description:** Russian-doll nested box clutter (4 to 5 levels of container borders per section: `sovereign-card` -> `sovereign-subcard` -> `sovereign-well` -> `tone-*` -> `sovereign-subcard`). Every small fragment of text is trapped inside its own dark bordered box.
*   **Rationale:** When every element is a bordered rectangle inside another bordered rectangle, visual hierarchy collapses and the entire website looks like "only a box and text, nothing else."
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Valid blocker. We must enforce a strict maximum 2-level container hierarchy across both `UI_SPEC.md` and all React components in `web/src/components/`, using open canvas background space (`py-10` / `gap-8`), subtle hairlines (`border-t border-hairline`), and visual icon medallions instead of nested boxes.
*   ***Proposed Edit:***
    *   Location: `docs/02-design/UI_SPEC.md` and `web/src/components/*.tsx`
    *   Change: Unbox `StartupProductHero` and `StoryWalkthroughFivePart` onto spacious open-canvas sections, flatten inner wells into clean borderless/tonal rows, and cap container depth at 2 levels.

### [Issue 3] [`comprehension-1-2` / `comprehension-1-3` / `design_critic-1-4` / `zoom_out-1-5`] - Severity: Blocker
*   **Affected Scope:** [Lines 35-152](docs/02-design/UI_SPEC.md#L35-L152), [StartupProductHero.tsx](web/src/components/StartupProductHero.tsx#L92-L239), [StoryWalkthroughFivePart.tsx](web/src/components/StoryWalkthroughFivePart.tsx#L95-L189), [PoisonedStoreSim.tsx](web/src/components/PoisonedStoreSim.tsx#L193-L219)
*   **Discrepancy Description:** Microscopic iconography (`14px`–`16px` icons and `6px` dots) and zero visual assets or diagrams. The Hero "Interactive Preview" merely swaps one `11px` paragraph for another; the 4 Architectural Pillars have zero icons; `StoryWalkthroughFivePart` duplicates the active stage's text verbatim across 8 boxes without illustrations; and `PoisonedStoreSim` lacks the visual Merchant Storefront Product Card (`Shure SM7B` visual + price tag + X-ray badge) mandated in `UI_SPEC.md`.
*   **Rationale:** Visitors understand products through visual imagery, big semantic icons (`48px`–`56px` medallions), and visual flow diagrams—not walls of `10px`–`12px` prose.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Valid blocker. We generated two custom 3D minimalist hardware/glass visual assets (`talos-hero-visual.png` and `talos-escrow-visual.png`) and will embed them alongside `48px`–`56px` (`w-12 h-12` / `w-14 h-14`) icon medallions across all pillars, story stages, KPI cards, and modules, plus a visual Shure SM7B Storefront Preview card in `PoisonedStoreSim.tsx`.
*   ***Proposed Edit:***
    *   Location: `StartupProductHero.tsx`, `StoryWalkthroughFivePart.tsx`, `PoisonedStoreSim.tsx`, `SideBySideAgentComparison.tsx`, `SovereignHeaderAndDock.tsx`, `GuidedDemoBanner.tsx`
    *   Change: Add hero visual artwork (`talos-hero-visual.png`), escrow pipeline artwork (`talos-escrow-visual.png`), large `48px`–`56px` duotone icon medallions (`icon-medallion-*`), visual SVG flow connectors, and a visual Storefront Product Card.

### [Issue 4] [`comprehension-1-4` / `design_critic-1-3`] - Severity: Blocker
*   **Affected Scope:** [StoryWalkthroughFivePart.tsx](web/src/components/StoryWalkthroughFivePart.tsx#L95-L189), [storytelling-parts.ts](web/src/lib/storytelling-parts.ts#L42-L170)
*   **Discrepancy Description:** `StoryWalkthroughFivePart.tsx` renders 5 multi-sentence cards in a 5-column grid and then repeats the active stage's `questionAnswered`, `title`, `plainNarrative`, and `financialConsequence` word-for-word in a 4-box panel below it.
*   **Rationale:** Showing 8 text-heavy boxes in a single section with word-for-word duplication overwhelms the reader.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Valid blocker. We will transform the top 5-stage selector into a clean, minimalist **Visual Icon Stepper** (large `48px` stage icon medallion + stage badge + crisp title + compact metric pill) and make the active stage showcase a spacious visual card featuring the `talos-escrow-visual.png` pipeline graphic and 3 icon-led visual insight columns.
*   ***Proposed Edit:***
    *   Location: `web/src/components/StoryWalkthroughFivePart.tsx` and `web/src/lib/storytelling-parts.ts`
    *   Change: Convert the 5-stage tabs into an icon-first visual stepper and streamline copy to eliminate verbatim duplication.

### [Issue 5] [`zoom_out-1-4` / `design_critic-1-5`] - Severity: Major
*   **Affected Scope:** [SovereignHeaderAndDock.tsx](web/src/components/SovereignHeaderAndDock.tsx#L84-L231), [GuidedDemoBanner.tsx](web/src/components/GuidedDemoBanner.tsx#L65-L239)
*   **Discrepancy Description:** `SovereignTopTelemetryBar` renders a second full-width Hero Banner card halfway down the page (repeating the title and description of TALOS) above 4 text-heavy KPI cards and `GuidedDemoBanner`'s 7 nested boxes.
*   **Rationale:** Two hero banners on one page splits the visual hierarchy in half and adds 12 unnecessary nested boxes in the middle of the workspace.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Valid major finding. We will streamline `SovereignTopTelemetryBar` into a sleek, compact Operator Command Header bar with the 3-State PayPal 2PC Pipeline visual indicator, upgrade the 4 KPI cards with `48px` (`w-12 h-12`) icon medallions and generous whitespace, and simplify `GuidedDemoBanner` into a clean, visual 4-step interactive strip.
*   ***Proposed Edit:***
    *   Location: `web/src/components/SovereignHeaderAndDock.tsx` and `web/src/components/GuidedDemoBanner.tsx`
    *   Change: Collapse the duplicate mid-page hero card into a sleek operator section header + visual 2PC pipeline bar, add large icon medallions to the 4 KPI cards, and flatten `GuidedDemoBanner`.

### [Issue 6] [`design_critic-1-6` / `comprehension-1-5` / `comprehension-1-6`] - Severity: Major
*   **Affected Scope:** [Lines 1-187](docs/02-design/UI_SPEC.md#L1-L187) (`Full File`)
*   **Discrepancy Description:** `UI_SPEC.md` is missing mandatory `feature-spec-standard.md` sections (`Alternatives Considered` and `Risks, Viewport Budgets & Anti-Clutter Guardrails`), fails to define domain acronyms on first use (`KYA = Know Your Agent`, `2PC = Two-Phase Commit`, `Channel3`, `KERNEL`), and uses 26 unlinked reference codes (`F-01`..`F-12`, `E-01`..`E-10`, `API-01`..`API-16`).
*   **Rationale:** Without explicit anti-clutter guardrails, alternatives analysis, and linked canonical definitions in `UI_SPEC.md`, the spec fails both `feature-spec-standard.md` and `heilmeier-standard.md`.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Valid major finding. We will update `docs/02-design/UI_SPEC.md` to add inline definitions for `KYA`, `2PC`, `Channel3`, and `KERNEL`, link canonical IDs to `PROJECT_BRIEF.md` / `PRD.md` / `DATA_MODEL.md` / `API_SPEC.md`, and add Section 7 (`Alternatives Considered`) and Section 8 (`Risks, Viewport Budgets & Anti-Clutter Guardrails`).
*   ***Proposed Edit:***
    *   Location: `docs/02-design/UI_SPEC.md`
    *   Change: Add linked canonical glossary table, visual landing architecture specification, `Alternatives Considered`, and `Risks, Viewport Budgets & Anti-Clutter Guardrails`.

### [Issue 7] [`design_critic-1-7` / `comprehension-1-7` / `zoom_out-1-6`] - Severity: Nit
*   **Affected Scope:** [MandateStudio.tsx](web/src/components/MandateStudio.tsx#L84-L231), [storytelling-parts.ts](web/src/lib/storytelling-parts.ts#L79-L166)
*   **Discrepancy Description:** Form controls in `MandateStudio.tsx` and introductory copy in `storytelling-parts.ts` mix verbose helper text and raw cryptographic hex strings without clean visual grouping.
*   **Rationale:** Concise labels and large visual icons improve scan speed.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Worth fixing as part of our visual overhaul to ensure `MandateStudio.tsx` and `storytelling-parts.ts` read cleanly at a glance.
*   ***Proposed Edit:***
    *   Location: `web/src/components/MandateStudio.tsx` and `web/src/lib/storytelling-parts.ts`
    *   Change: Add large `48px` section/field iconography, tighten microcopy, and visually style the Ed25519 Hardware KYA Seal.
