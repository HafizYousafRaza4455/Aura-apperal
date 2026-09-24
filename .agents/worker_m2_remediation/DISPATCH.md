# Dispatch Assignment: Worker M2 Remediation

## Context
Project: Aura Apparel luxury minimalist web storefront.
Milestone: M2 - Product Catalog & Category Filtering (Remediation).
Workspace: C:\Users\YC\teamwork_projects\aura_apparel
Your working directory: C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m2_remediation
Authoritative user request: C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md
Scope document: C:\Users\YC\teamwork_projects\aura_apparel\.agents\orchestrator_1\PROJECT.md

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Remediation Objectives
Challenger M2.1 identified 2 defects:
1. React 19 Console Error when `src=""` is passed to `ImageWithFallback`:
   In `src/components/common/ImageWithFallback.tsx`: If `!src || src.trim() === ''`, treat as immediate error/fallback and render the luxury SVG placeholder directly without rendering `<img src="" />` to the DOM.
2. Keyboard Event Bleed in `ProductCard.tsx`:
   - In `handleKeyDown` on `<article role="button">`, add:
     ```tsx
     if (e.target !== e.currentTarget) return;
     ```
   - On the child swatch buttons and Quick Buy button, add `onKeyDown={(e) => e.stopPropagation()}` to prevent keyboard events (`Enter`, `Space`) from triggering `onSelectProduct`.
   - In fallback colorway in `ProductCard.tsx`, ensure `image` is handled cleanly.
3. Verification:
   - Run `npx vitest run src/tests/challenger-m2-empirical.test.tsx`
   - Run `npx vitest run src/tests/challenger-m2-2.test.tsx` (all 25 tests must pass with 0 failures and 0 console errors!)
   - Run `npm test` (all test suites across the project must pass 100%)
   - Run `npm run build` (must succeed with 0 errors)
4. Deliver report in `changes.md` and `handoff.md`.

## 2026-09-03T11:43:12Z
You are Worker M2 Remediation for the Aura Apparel project.
Your working directory is: C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m2_remediation
Authoritative user request: C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md
Scope document: C:\Users\YC\teamwork_projects\aura_apparel\.agents\orchestrator_1\PROJECT.md
Your dispatch instructions are at: C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m2_remediation\DISPATCH.md

Tasks:
1. Fix empty src in src/components/common/ImageWithFallback.tsx: if !src or src.trim() === '', render SVG fallback directly (do not render <img src="" />).
2. Fix keyboard event bleed in src/components/catalog/ProductCard.tsx: guard handleKeyDown with if (e.target !== e.currentTarget) return; and add onKeyDown={(e) => e.stopPropagation()} on child buttons (swatches and quick buy).
3. Run npx vitest run src/tests/challenger-m2-2.test.tsx and ensure all 25 tests pass.
4. Run npm test across all test suites and npm run build. Ensure 100% pass and 0 errors.
Write changes.md and deliver a self-contained handoff.md in your working directory.
When finished, send a message to parent with verification results and path to handoff.md.

