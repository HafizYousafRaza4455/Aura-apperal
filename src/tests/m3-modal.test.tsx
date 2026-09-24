import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductModal } from '../components/modal/ProductModal';
import { Product } from '../types/product';
import App from '../App';
import { PRODUCTS } from '../data/products';

const MOCK_PRODUCT: Product = {
  id: 'test-item-001',
  title: 'Architectural Cashmere Overcoat',
  subtitle: 'Hand-tailored double-faced cashmere with horn buttons',
  price: 650,
  category: 'outerwear',
  description: 'A monument to modern minimalist silhouette and tailoring.',
  details: [
    '100% Mongolian Cashmere',
    'Unlacquered buffalo horn buttons',
    'Full cupro lining',
  ],
  badge: 'EXCLUSIVE',
  stock: 4, // Intentionally low to test low-stock indicator and clamping
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  colors: [
    {
      name: 'Obsidian Black',
      hex: '#0D0D0D',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985',
      secondaryImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
    },
    {
      name: 'Camel Tan',
      hex: '#B89778',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    },
    {
      name: 'Chalk White',
      hex: '#F5F5F0',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      secondaryImage: '',
    },
  ],
  featured: true,
};

describe('Milestone 3: Product Detail Quick View Modal Suite', () => {
  let onCloseMock: any;
  let onAddToCartMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    onCloseMock = vi.fn();
    onAddToCartMock = vi.fn();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  /* ========================================================================== */
  /* 1. WAI-ARIA 1.2 Dialog Semantics & Portal Architecture                     */
  /* ========================================================================== */
  describe('Dialog Semantics & Accessibility Tree', () => {
    it('does not render when isOpen is false', () => {
      render(
        <ProductModal
          isOpen={false}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
    });

    it('does not render when product is null', () => {
      render(
        <ProductModal
          isOpen={true}
          product={null}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog via portal with role="dialog" and aria-modal="true"', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-product-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-product-subtitle');

      // Check that portal mounted in document.body
      expect(document.body.contains(dialog)).toBe(true);
    });

    it('associates aria-labelledby and aria-describedby with matching heading and description elements', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const titleEl = document.getElementById('modal-product-title');
      expect(titleEl).toBeInTheDocument();
      expect(titleEl).toHaveTextContent(MOCK_PRODUCT.title);

      const subtitleEl = document.getElementById('modal-product-subtitle');
      expect(subtitleEl).toBeInTheDocument();
      expect(subtitleEl).toHaveTextContent(MOCK_PRODUCT.subtitle);
    });

    it('renders close button with explicit aria-label and sharp 0px geometry', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /close modal/i });
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('data-testid', 'modal-close-button');
      expect(closeBtn.className).toContain('rounded-none');
    });

    it('renders luxury status badge when product has a badge', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(screen.getByTestId('badge-exclusive')).toBeInTheDocument();
      expect(screen.getByText('EXCLUSIVE')).toBeInTheDocument();
    });
  });

  /* ========================================================================== */
  /* 2. Multi-Channel Dismissal Engine                                          */
  /* ========================================================================== */
  describe('Multi-Channel Dismissal Engine', () => {
    it('dismisses modal when close button is clicked', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const closeBtn = screen.getByTestId('modal-close-button');
      fireEvent.click(closeBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('dismisses modal when Escape key is pressed on window', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('dismisses modal on direct backdrop click', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      // Simulate genuine click lifecycle: mousedown on backdrop, then click
      fireEvent.mouseDown(backdrop);
      fireEvent.click(backdrop);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('prevents accidental dismissal on drag-safe selection from inside modal to backdrop', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const backdrop = screen.getByTestId('modal-backdrop');
      const dialog = screen.getByRole('dialog');

      // User mousedowns inside dialog (e.g. selecting description text)
      fireEvent.mouseDown(dialog);
      // Mouse releases on backdrop
      fireEvent.click(backdrop);

      // Dismissal should NOT trigger!
      expect(onCloseMock).not.toHaveBeenCalled();
    });

    it('does not dismiss when clicking directly inside dialog content', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  /* ========================================================================== */
  /* 3. Bidirectional Focus Trapping & Restoration                              */
  /* ========================================================================== */
  describe('Bidirectional Focus Trapping & Restoration', () => {
    it('places initial focus on close button after mount', async () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const closeBtn = screen.getByTestId('modal-close-button');
      await waitFor(
        () => {
          expect(document.activeElement).toBe(closeBtn);
        },
        { timeout: 300 }
      );
    });

    it('wraps focus from last interactive element to first interactive element on Tab', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const closeBtn = screen.getByTestId('modal-close-button');
      const addToBagBtn = screen.getByTestId('modal-add-to-bag-btn');

      // Focus last element
      addToBagBtn.focus();
      expect(document.activeElement).toBe(addToBagBtn);

      // Press Tab
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: false });

      // Focus should wrap back to first element (close button)
      expect(document.activeElement).toBe(closeBtn);
    });

    it('wraps focus from first interactive element to last interactive element on Shift+Tab', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const closeBtn = screen.getByTestId('modal-close-button');
      const addToBagBtn = screen.getByTestId('modal-add-to-bag-btn');

      // Focus first element
      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);

      // Press Shift+Tab
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });

      // Focus should wrap to last element
      expect(document.activeElement).toBe(addToBagBtn);
    });

    it('restores focus to trigger element when modal unmounts', () => {
      // Create external trigger button
      const trigger = document.createElement('button');
      trigger.setAttribute('id', 'external-trigger');
      document.body.appendChild(trigger);
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      const { unmount } = render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      // Unmount modal
      unmount();

      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });
  });

  /* ========================================================================== */
  /* 4. Layout-Shift-Free Body Scroll Locking                                   */
  /* ========================================================================== */
  describe('Body Scroll Locking', () => {
    it('sets document.body overflow to hidden when open', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores document.body overflow when closed or unmounted', () => {
      const { rerender } = render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <ProductModal
          isOpen={false}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('compensates for desktop scrollbar width by adding padding-right', () => {
      // Mock window.innerWidth and clientWidth to simulate 16px scrollbar
      const originalInnerWidth = window.innerWidth;
      const originalClientWidth = document.documentElement.clientWidth;

      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      Object.defineProperty(document.documentElement, 'clientWidth', { value: 1008, configurable: true });

      const { unmount } = render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(document.body.style.paddingRight).toBe('16px');

      unmount();

      expect(document.body.style.paddingRight).toBe('');

      // Restore
      Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
      Object.defineProperty(document.documentElement, 'clientWidth', { value: originalClientWidth, configurable: true });
    });
  });

  /* ========================================================================== */
  /* 5. Color Swatches & Gallery Multi-Angle Inspection                         */
  /* ========================================================================== */
  describe('Color Swatches & Gallery Multi-Angle Inspection', () => {
    it('renders all color swatches with Pale Gold ring on active swatch', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const color0 = screen.getByTestId('modal-color-0');
      const color1 = screen.getByTestId('modal-color-1');
      const color2 = screen.getByTestId('modal-color-2');

      expect(color0).toHaveAttribute('aria-checked', 'true');
      expect(color0.className).toContain('ring-[#D4AF37]');

      expect(color1).toHaveAttribute('aria-checked', 'false');
      expect(color1.className).not.toContain('ring-[#D4AF37]');

      expect(color2).toHaveAttribute('aria-checked', 'false');
    });

    it('respects initialColor prop when opening modal', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          initialColor={MOCK_PRODUCT.colors[1]} // Camel Tan
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const color1 = screen.getByTestId('modal-color-1');
      expect(color1).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText('Camel Tan')).toBeInTheDocument();
    });

    it('switches colorway upon swatch click and resets thumbnail view to primary angle', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      // Initially Obsidian Black
      expect(screen.getByText('Obsidian Black')).toBeInTheDocument();

      // Click second angle thumbnail
      const thumb1 = screen.getByTestId('modal-thumbnail-1');
      fireEvent.click(thumb1);
      expect(thumb1).toHaveAttribute('aria-checked', 'true');

      // Click Camel Tan swatch
      const swatchCamel = screen.getByTestId('modal-color-1');
      fireEvent.click(swatchCamel);

      // Now Camel Tan is active and thumbnail resets to angle 0
      expect(screen.getByText('Camel Tan')).toBeInTheDocument();
      expect(screen.getByTestId('modal-thumbnail-0')).toHaveAttribute('aria-checked', 'true');
    });

    it('renders multiple angle thumbnails and updates display image on thumbnail click', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const thumb0 = screen.getByTestId('modal-thumbnail-0');
      const thumb1 = screen.getByTestId('modal-thumbnail-1');

      expect(thumb0).toHaveAttribute('aria-checked', 'true');
      expect(thumb1).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(thumb1);
      expect(thumb1).toHaveAttribute('aria-checked', 'true');
      expect(thumb0).toHaveAttribute('aria-checked', 'false');
    });
  });

  /* ========================================================================== */
  /* 6. Size Selector Matrix & Validation Alert                                 */
  /* ========================================================================== */
  describe('Size Selector Matrix & Validation Alert', () => {
    it('renders all 5 size chips with sharp 0px geometry', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      for (const sz of sizes) {
        const btn = screen.getByTestId(`modal-size-${sz}`);
        expect(btn).toBeInTheDocument();
        expect(btn.className).toContain('rounded-none');
        expect(btn).toHaveAttribute('aria-checked', 'false');
      }
    });

    it('shows missing size validation alert when attempting to Add to Bag without selecting a size', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const addToBagBtn = screen.getByTestId('modal-add-to-bag-btn');
      fireEvent.click(addToBagBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('data-testid', 'modal-validation-error');
      expect(alert).toHaveTextContent(/please select a size to proceed/i);

      // onAddToCart should NOT be called
      expect(onAddToCartMock).not.toHaveBeenCalled();
    });

    it('clears validation alert once a size is clicked', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      // Trigger error first
      fireEvent.click(screen.getByTestId('modal-add-to-bag-btn'));
      expect(screen.getByTestId('modal-validation-error')).toBeInTheDocument();

      // Click size M
      const sizeM = screen.getByTestId('modal-size-M');
      fireEvent.click(sizeM);

      expect(sizeM).toHaveAttribute('aria-checked', 'true');
      expect(screen.queryByTestId('modal-validation-error')).not.toBeInTheDocument();
    });
  });

  /* ========================================================================== */
  /* 7. Quantity Stepper & Clamping                                             */
  /* ========================================================================== */
  describe('Quantity Stepper & Clamping', () => {
    it('initializes at quantity 1 with decrement disabled', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(screen.getByTestId('stepper-value')).toHaveTextContent('1');
      expect(screen.getByTestId('stepper-decrement')).toBeDisabled();
      expect(screen.getByTestId('stepper-increment')).not.toBeDisabled();
    });

    it('increments quantity and updates Add to Bag total price readout', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          currentCurrency="USD"
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const incBtn = screen.getByTestId('stepper-increment');
      fireEvent.click(incBtn); // 2
      expect(screen.getByTestId('stepper-value')).toHaveTextContent('2');
      expect(screen.getByTestId('modal-add-to-bag-btn')).toHaveTextContent('$1,300');

      fireEvent.click(incBtn); // 3
      expect(screen.getByTestId('stepper-value')).toHaveTextContent('3');
      expect(screen.getByTestId('modal-add-to-bag-btn')).toHaveTextContent('$1,950');

      const decBtn = screen.getByTestId('stepper-decrement');
      fireEvent.click(decBtn); // back to 2
      expect(screen.getByTestId('stepper-value')).toHaveTextContent('2');
      expect(screen.getByTestId('modal-add-to-bag-btn')).toHaveTextContent('$1,300');
    });

    it('clamps quantity to available stock (4 units for MOCK_PRODUCT)', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT} // stock: 4
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      const incBtn = screen.getByTestId('stepper-increment');
      fireEvent.click(incBtn); // 2
      fireEvent.click(incBtn); // 3
      fireEvent.click(incBtn); // 4

      expect(screen.getByTestId('stepper-value')).toHaveTextContent('4');
      expect(incBtn).toBeDisabled();

      // Further click does not increment
      fireEvent.click(incBtn);
      expect(screen.getByTestId('stepper-value')).toHaveTextContent('4');
    });

    it('displays "Only X Remaining" badge when stock <= 5', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT} // stock: 4
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(screen.getByText(/only 4 remaining/i)).toBeInTheDocument();
    });

    it('displays "In Stock" when stock > 5', () => {
      const highStockProduct = { ...MOCK_PRODUCT, stock: 25 };
      render(
        <ProductModal
          isOpen={true}
          product={highStockProduct}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      expect(screen.getByText(/in stock/i)).toBeInTheDocument();
    });
  });

  /* ========================================================================== */
  /* 8. Add to Bag Action & Temporary Confirmation State                        */
  /* ========================================================================== */
  describe('Add to Bag Action & Feedback State', () => {
    it('dispatches onAddToCart with full genuine payload when size is selected', () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      // Select size L
      fireEvent.click(screen.getByTestId('modal-size-L'));

      // Increment quantity to 2
      fireEvent.click(screen.getByTestId('stepper-increment'));

      // Click Add to Bag
      fireEvent.click(screen.getByTestId('modal-add-to-bag-btn'));

      expect(onAddToCartMock).toHaveBeenCalledTimes(1);
      expect(onAddToCartMock).toHaveBeenCalledWith({
        product: MOCK_PRODUCT,
        color: MOCK_PRODUCT.colors[0],
        size: 'L',
        quantity: 2,
      });
    });

    it('temporarily switches to "Added to Bag" confirmation state with Pale Gold styling', async () => {
      render(
        <ProductModal
          isOpen={true}
          product={MOCK_PRODUCT}
          onClose={onCloseMock}
          onAddToCart={onAddToCartMock}
        />
      );

      // Select size M
      fireEvent.click(screen.getByTestId('modal-size-M'));

      const btn = screen.getByTestId('modal-add-to-bag-btn');
      fireEvent.click(btn);

      // Check confirmation text and styling
      expect(screen.getByText('Added to Bag')).toBeInTheDocument();
      expect(btn.className).toContain('bg-[#D4AF37]');
    });
  });

  /* ========================================================================== */
  /* 9. App Storefront Integration & User Flow                                  */
  /* ========================================================================== */
  describe('App Storefront Integration & End-to-End User Flow', () => {
    it('opens product modal when a product card in the catalog is clicked', () => {
      render(<App />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Click first product card
      const firstCard = screen.getAllByTestId(/product-card-/)[0];
      fireEvent.click(firstCard);

      // Modal should now be open
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Heading should match first product
      expect(screen.getByTestId('modal-title')).toHaveTextContent(PRODUCTS[0].title);
    });

    it('allows selecting size, quantity, and adds to cart updating navbar counter', () => {
      render(<App />);

      // Initial cart counter should be 0 or empty
      const initialBadges = screen.queryAllByTestId('cart-count-badge');
      expect(initialBadges.length).toBe(0);

      // Click first product card to open modal
      const firstCard = screen.getAllByTestId(/product-card-/)[0];
      fireEvent.click(firstCard);

      // Select size S
      const sizeS = screen.getByTestId('modal-size-S');
      fireEvent.click(sizeS);

      // Increment quantity to 2
      fireEvent.click(screen.getByTestId('stepper-increment'));

      // Add to bag
      fireEvent.click(screen.getByTestId('modal-add-to-bag-btn'));

      // Cart count badge in navbar should now show 2
      const badges = screen.getAllByTestId('cart-count-badge');
      expect(badges.length).toBeGreaterThan(0);
      expect(badges[0]).toHaveTextContent('2');
    });

    it('closes modal upon clicking close button in App and returns focus cleanly', () => {
      render(<App />);

      // Open modal
      const firstCard = screen.getAllByTestId(/product-card-/)[0];
      fireEvent.click(firstCard);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByTestId('modal-close-button');
      fireEvent.click(closeBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes modal upon Escape keypress in App', () => {
      render(<App />);

      const firstCard = screen.getAllByTestId(/product-card-/)[0];
      fireEvent.click(firstCard);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('updates currency symbol and amount inside modal when currency is changed', () => {
      render(<App />);

      // Open modal
      const firstCard = screen.getAllByTestId(/product-card-/)[0];
      fireEvent.click(firstCard);

      const priceEl = screen.getByTestId('modal-price');
      // In USD
      expect(priceEl.textContent).toContain('$');

      // Close modal
      fireEvent.click(screen.getByTestId('modal-close-button'));

      // Change currency via footer dropdown
      const currencySelect = screen.getByTestId('footer-currency-select');
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });

      // Reopen modal
      fireEvent.click(firstCard);

      const eurPriceEl = screen.getByTestId('modal-price');
      expect(eurPriceEl.textContent).toContain('€');
    });
  });
});
