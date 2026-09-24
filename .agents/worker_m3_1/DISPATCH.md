## 2026-09-03T13:20:49Z

You are Worker M3.1 for Aura Apparel.

Your working directory is:
C:\Users\YC\teamwork_projects\aura_apparel\.agents\worker_m3_1

Authoritative files to read before writing code:
- C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md
- C:\Users\YC\teamwork_projects\aura_apparel\.agents\orchestrator_2\PROJECT.md
- C:\Users\YC\teamwork_projects\aura_apparel\.agents\orchestrator_2\TEST_INFRA.md
- C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m3_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File ownership:
You own:
- src/components/modal/ProductModal.tsx
- src/App.tsx
- src/tests/m3-modal.test.tsx

Tasks:
1. Implement `src/components/modal/ProductModal.tsx` following the comprehensive blueprint in explorer_m3_1/analysis.md:
   - WAI-ARIA 1.2 dialog semantics (role="dialog", aria-modal="true", aria-labelledby, aria-describedby, rendered via createPortal into document.body).
   - Multi-angle gallery with sharp 0px thumbnail buttons.
   - Size selector matrix (XS, S, M, L, XL) with sharp 0px geometry.
   - Color swatches with Pale Gold active ring indicator.
   - Quantity stepper clamped between 1 and 10 (and stock).
   - Missing size validation alert (role="alert", aria-live="assertive").
   - Add to Bag CTA with temporary "Added to Bag" confirmation state.
   - Bidirectional focus trap (useFocusTrap) with Tab/Shift+Tab wrapping, Escape key dismissal, and focus restoration to the trigger element on close.
   - Layout-shift-free body scroll lock (useBodyScrollLock) with scrollbar width compensation.
   - Multi-channel dismissal (Escape, close button with Lucide X, drag-safe backdrop dismissal with mousedown origin tracking).
   - Responsive split layout: Desktop 960px 2-column card vs Mobile slide-up sheet with sticky Add to Bag action bar.
2. Integrate into `src/App.tsx`:
   - Add state for `modalProduct` and `modalColor`.
   - Update `handleOpenProductModal` to set modal state so clicking a product card opens the modal.
   - Wire `onAddToCart` to update cart count.
   - Render `<ProductModal ... />` at the root.
3. Create `src/tests/m3-modal.test.tsx` testing dialog semantics, accessibility, focus trapping, escape dismissal, backdrop dismissal, drag-safe dismissal, size selection, size validation alert, quantity stepper, color swatches, add to bag payload, and scroll locking.
4. Run `npm run build` and `npx vitest run`. Ensure all test suites (M1, M2, and M3) pass with 0 errors.
5. Write `handoff.md` in your working directory (.agents/worker_m3_1/handoff.md) with full verification details and test counts.
6. Send a message to orchestrator_2 when done.
