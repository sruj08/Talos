# SAP Analysis Adaptation for TALOS

> Source: user-supplied SAP Analysis design language (alpha)  
> Applied into TALOS as enterprise-frame discipline on top of the locked PayPal Design System (`anti-slop-20-gate.test.ts`).

## What we keep from SAP Analysis

- Quiet application chrome (60px-class nav height → TALOS `h-16`)
- Full-width flat bands for section punctuation (`.enterprise-band-chrome`, `.enterprise-band-blue`, `.enterprise-band-footer`)
- One acting blue for controls and active tabs (PayPal `#003087` / `#0070E0`, mapped beside SAP `#0057d2`)
- Tight control radius (`8px` / `--radius-md`) and media radius (`16px` / `--radius-lg`)
- Product tab rail under the global bar (`.enterprise-product-tab-rail` + `WorkspaceTabRail`)
- Depth from band/surface steps, not decorative shadows on chrome

## What PayPal / TALOS gates override

- Fonts stay **PayPal Pro / PayPal Open / SFMono-Regular** (Gate 3)
- Pills stay allowed via `--radius-pill: 9999px` (Gate 16) for commerce CTAs
- Dark mode uses Obsidian Vault (`#07080D` / `#0F1420` / `#151C2C`) from the fragment.im investor storyline
- Light mode keeps Institutional Parchment (`#FAF8F5`) and PayPal hex tokens required by Gate 7

## Implementation surfaces

- Tokens & bands: `web/src/app/enterprise-shell.css`
- PayPal base system: `web/src/app/globals.css`
- Workspace rail: `web/src/components/WorkspaceTabRail.tsx`
- Auth onboarding: `web/src/components/PayPalAuthPortal.tsx`, `/login`, `/signup`
