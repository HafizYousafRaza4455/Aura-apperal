# Dispatch: Milestone 4 (Slide‑out Cart Drawer & State Persistence)

## Tasks

- **Implement Cart Context**: `src/context/CartContext.tsx` – React context managing cart items, quantities, subtotal, free‑shipping progress, and promo‑code logic.
- **Create Cart Drawer UI**: `src/components/cart/CartDrawer.tsx` – slide‑out drawer component displaying cart contents, allowing item removal, quantity changes, and showing free‑shipping meter and promo‑code input.
- **Integrate with Product Modal**: Wire `onAddToCart` from `ProductModal.tsx` to the CartContext `addItem` method.
- **Persist State**: Sync cart state to `localStorage` on every change and hydrate on app start; listen for `storage` events to keep multiple tabs in sync.
- **Free‑Shipping Meter**: Visual progress bar that fills as cart total approaches `$250`. Show message `Free shipping on orders over $250!` when threshold reached.
- **Promo Code Handling**: Input field in the drawer; apply discount code `AURA10` for 10 % off the total.
- **Testing**:
  - Unit tests for `CartContext` (add, remove, quantity update, persistence, promo code).
  - Integration tests for drawer opening/closing, UI updates, free‑shipping bar, and promo‑code application.
- **Documentation**: Update `README.md` with usage instructions for the Cart system.

## Acceptance Criteria
- Cart drawer slides in/out smoothly on button click.
- Cart state persists across page reloads and browser tabs.
- Free‑shipping progress updates in real time.
- Promo code applies correct discount and is validated.
- All existing tests continue to pass (no regressions).
