# E2E Test Infra: Aura Apparel Storefront

## Test Philosophy
- Opaque-box, requirement-driven. Derived from `ORIGINAL_REQUEST.md` and user-facing specifications.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Scenarios.
- Zero-external-dependency headless execution via Vitest 4 + `@testing-library/react` + `jsdom` with `pool: 'threads'` for Windows host reliability.

## Test Architecture
- Test runner: Vitest (`npm test` / `npx vitest run`)
- Setup file: `src/tests/setup.ts` (jest-dom matchers, localStorage mock, window.matchMedia mock, scroll mock)
- Test directory: `src/tests/`
  - `m1-shell.test.tsx` (Milestone 1 shell & home)
  - `m2-catalog.test.tsx` (Milestone 2 catalog & filtering)
  - `m3-modal.test.tsx` (Milestone 3 modal & quick buy)
  - `m4-cart.test.tsx` (Milestone 4 cart drawer & sync)
  - `tier1-features.test.tsx` (Feature Coverage)
  - `tier2-boundary.test.tsx` (Boundary & Corner Cases)
  - `tier3-combinations.test.tsx` (Cross-Feature Combinations)
  - `tier4-scenarios.test.tsx` (Real-World Application Scenarios)
  - `tier5-adversarial.test.tsx` (Adversarial Coverage Hardening)

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: >= 20 test cases covering navigation, hero, collection cards, category filtering, product cards, product modal, cart drawer, story, footer.
- **Tier 2 (Boundary & Corner Cases)**: >= 20 test cases covering empty cart, quantity boundaries (min 1, max 10), decrement removal, size validation requirement, invalid promo codes, corrupted localStorage recovery, mobile vs desktop responsive triggers.
- **Tier 3 (Cross-Feature Combinations)**: >= 15 test cases covering filter -> modal -> cart add -> remove -> persist across reload; quick-buy -> filter change -> cart drawer sync; promo code application + item quantity changes.
- **Tier 4 (Real-World Application Scenarios)**: >= 8 end-to-end multi-step user scenarios (e.g., Luxury Wardrobe Shopper, Summer Capsule Curation, Cart Free Shipping Threshold Chase, Mobile Quick-Shopper).
- **Tier 5 (Adversarial Coverage Hardening)**: White-box coverage expansion, stress testing debouncing, rapid clicks, edge cases.

## Target Test Suite Ready Signal
- When the Test Writer completes creation and verification of Tiers 1-4, `TEST_READY.md` is published.
