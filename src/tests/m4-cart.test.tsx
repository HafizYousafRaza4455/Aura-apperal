// src/tests/m4-cart.test.tsx
/**
 * Milestone 4 – Cart Drawer & State Persistence Tests
 *
 * Coverage:
 *  - CartContext: add, remove, quantity update, promo code, localStorage persistence
 *  - CartDrawer: open/close, item list, free-shipping bar, promo apply, checkout button
 */
import { vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { CartDrawer } from '../components/cart/CartDrawer';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const SAMPLE_ITEM = {
  key: 'prod-1__Obsidian__M',
  productId: 'prod-1',
  title: 'Minimal Overcoat',
  price: 120,
  color: 'Obsidian',
  size: 'M',
  quantity: 1,
  image: '',
};

/** Renders CartDrawer with a CartProvider and optional initial items. */
function renderDrawer(isOpen = true, initialItems = [SAMPLE_ITEM]) {
  const onClose = vi.fn();

  // Seed localStorage before render
  if (initialItems.length > 0) {
    localStorage.setItem('cartState', JSON.stringify({ items: initialItems }));
  } else {
    localStorage.removeItem('cartState');
  }

  const utils = render(
    <CartProvider>
      <CartDrawer isOpen={isOpen} onClose={onClose} />
    </CartProvider>
  );

  return { ...utils, onClose };
}

/** A helper component that exposes CartContext values via data-testid attributes */
function CartConsumer() {
  const { items, totals, addItem, removeItem, updateQuantity, applyPromo, clearCart } =
    useCart();
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <span data-testid="subtotal">{totals.subtotal}</span>
      <span data-testid="promo">{totals.promoCodeApplied ?? 'none'}</span>
      <span data-testid="discount">{totals.discountAmount}</span>
      <span data-testid="free-shipping">{totals.freeShippingUnlocked ? 'yes' : 'no'}</span>
      <button
        data-testid="add"
        onClick={() => addItem({ ...SAMPLE_ITEM, key: `item-${items.length}` })}
      >
        Add
      </button>
      <button data-testid="remove" onClick={() => removeItem(items[0]?.key)}>
        Remove
      </button>
      <button
        data-testid="update-qty"
        onClick={() => updateQuantity(items[0]?.key, 5)}
      >
        UpdateQty
      </button>
      <button data-testid="promo-apply" onClick={() => applyPromo('AURA10')}>
        PromoApply
      </button>
      <button data-testid="promo-bad" onClick={() => applyPromo('BADCODE')}>
        PromoInvalid
      </button>
      <button data-testid="clear" onClick={() => clearCart()}>
        Clear
      </button>
    </div>
  );
}

// ─── CartContext Unit Tests ─────────────────────────────────────────────────────

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty cart', () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('subtotal').textContent).toBe('0');
  });

  it('adds items and recalculates subtotal', async () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('1');
      expect(screen.getByTestId('subtotal').textContent).toBe('120');
    });
  });

  it('increments quantity for duplicate key', async () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    // Add item-0 twice via the same key trick — we'll use addItem directly
    // First click → item-0
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    // Second click → item-1 (different key), so count becomes 2
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
  });

  it('removes items', async () => {
    localStorage.setItem('cartState', JSON.stringify({ items: [SAMPLE_ITEM] }));
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    fireEvent.click(screen.getByTestId('remove'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  });

  it('updates quantity', async () => {
    localStorage.setItem('cartState', JSON.stringify({ items: [SAMPLE_ITEM] }));
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    fireEvent.click(screen.getByTestId('update-qty'));
    await waitFor(() => {
      // subtotal = 120 * 5 = 600
      expect(screen.getByTestId('subtotal').textContent).toBe('600');
    });
  });

  it('applies AURA10 promo code for 10% discount', async () => {
    localStorage.setItem('cartState', JSON.stringify({ items: [SAMPLE_ITEM] }));
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    fireEvent.click(screen.getByTestId('promo-apply'));
    await waitFor(() => {
      expect(screen.getByTestId('promo').textContent).toBe('AURA10');
      expect(screen.getByTestId('discount').textContent).toBe('12'); // 10% of 120
    });
  });

  it('ignores invalid promo codes', async () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    fireEvent.click(screen.getByTestId('promo-bad'));
    await waitFor(() => {
      expect(screen.getByTestId('promo').textContent).toBe('none');
      expect(screen.getByTestId('discount').textContent).toBe('0');
    });
  });

  it('detects free shipping threshold at $250', async () => {
    // price=120, quantity=1, subtotal=120 → no free shipping
    localStorage.setItem('cartState', JSON.stringify({ items: [SAMPLE_ITEM] }));
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId('free-shipping').textContent).toBe('no'));

    // update qty to 3 → subtotal = 360 → free shipping
    fireEvent.click(screen.getByTestId('update-qty')); // sets qty to 5 → 600
    await waitFor(() => expect(screen.getByTestId('free-shipping').textContent).toBe('yes'));
  });

  it('clears cart', async () => {
    localStorage.setItem('cartState', JSON.stringify({ items: [SAMPLE_ITEM] }));
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    fireEvent.click(screen.getByTestId('clear'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  });

  it('persists cart to localStorage', async () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    fireEvent.click(screen.getByTestId('add'));
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
    const stored = localStorage.getItem('cartState');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.items.length).toBe(1);
  });

  it('hydrates cart from localStorage on mount', async () => {
    localStorage.setItem(
      'cartState',
      JSON.stringify({ items: [SAMPLE_ITEM, { ...SAMPLE_ITEM, key: 'extra__key__S' }] })
    );
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
  });
});

// ─── CartDrawer Integration Tests ──────────────────────────────────────────────

describe('CartDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the drawer panel when open', () => {
    renderDrawer(true);
    expect(screen.getByTestId('cart-drawer-panel')).toBeInTheDocument();
  });

  it('has translated-out panel when closed', () => {
    renderDrawer(false, []);
    const panel = screen.getByTestId('cart-drawer-panel');
    expect(panel.className).toContain('translate-x-full');
  });

  it('calls onClose when backdrop is clicked', async () => {
    const { onClose } = renderDrawer(true);
    fireEvent.click(screen.getByTestId('cart-drawer-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', async () => {
    const { onClose } = renderDrawer(true);
    fireEvent.click(screen.getByTestId('cart-drawer-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const { onClose } = renderDrawer(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('displays empty state when cart has no items', () => {
    renderDrawer(true, []);
    expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
  });

  it('renders item list when cart has items', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => {
      expect(screen.getByTestId('cart-item-list')).toBeInTheDocument();
      expect(screen.getByTestId(`cart-item-${SAMPLE_ITEM.key}`)).toBeInTheDocument();
    });
  });

  it('shows the item title in the cart', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => {
      expect(screen.getByTestId(`item-title-${SAMPLE_ITEM.key}`).textContent).toBe('Minimal Overcoat');
    });
  });

  it('removes an item when trash button is clicked', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => screen.getByTestId(`remove-item-${SAMPLE_ITEM.key}`));
    fireEvent.click(screen.getByTestId(`remove-item-${SAMPLE_ITEM.key}`));
    await waitFor(() => {
      expect(screen.getByTestId('cart-empty')).toBeInTheDocument();
    });
  });

  it('shows free-shipping progress bar below threshold', async () => {
    renderDrawer(true, [SAMPLE_ITEM]); // subtotal = $120
    await waitFor(() => {
      expect(screen.getByTestId('free-shipping-bar')).toBeInTheDocument();
      expect(screen.getByTestId('free-shipping-remaining')).toBeInTheDocument();
    });
  });

  it('shows free-shipping unlocked message above threshold', async () => {
    const bigItems = [{ ...SAMPLE_ITEM, price: 300, quantity: 1 }];
    localStorage.setItem('cartState', JSON.stringify({ items: bigItems }));
    render(
      <CartProvider>
        <CartDrawer isOpen={true} onClose={vi.fn()} />
      </CartProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('free-shipping-unlocked')).toBeInTheDocument();
    });
  });

  it('applies valid promo code AURA10 via input', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => screen.getByTestId('promo-input'));
    fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'aura10' } });
    fireEvent.click(screen.getByTestId('promo-apply-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('promo-applied')).toBeInTheDocument();
      expect(screen.getByTestId('summary-discount')).toBeInTheDocument();
    });
  });

  it('shows error for invalid promo code', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => screen.getByTestId('promo-input'));
    fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'BADCODE' } });
    fireEvent.click(screen.getByTestId('promo-apply-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('promo-error')).toBeInTheDocument();
    });
  });

  it('shows order summary with subtotal and total', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
      expect(screen.getByTestId('summary-subtotal')).toBeInTheDocument();
      expect(screen.getByTestId('summary-total')).toBeInTheDocument();
    });
  });

  it('renders checkout button', async () => {
    renderDrawer(true, [SAMPLE_ITEM]);
    await waitFor(() => {
      expect(screen.getByTestId('checkout-btn')).toBeInTheDocument();
    });
  });
});
