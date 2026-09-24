import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductCard } from '../components/catalog/ProductCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Product } from '../types/product';
import { PRODUCTS } from '../data/products';

// Representative multi-colorway mock product
const MOCK_MULTI_COLOR_PRODUCT: Product = {
  id: 'test-prod-001',
  title: 'Structured Cashmere Overcoat',
  subtitle: 'Hand-Finished Double-Faced Cashmere',
  price: 890,
  category: 'outerwear',
  description: 'An architectural silhouette crafted from pure Mongolian cashmere.',
  details: ['100% Mongolian Cashmere', 'Horn buttons', 'Made in Italy'],
  badge: 'EXCLUSIVE',
  stock: 8,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [
    {
      name: 'Midnight Obsidian',
      hex: '#0D0D0D',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1000',
      secondaryImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000',
    },
    {
      name: 'Oatmeal Heather',
      hex: '#D1C7BD',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000',
      secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000',
    },
    {
      name: 'Vicuna Camel',
      hex: '#A06E3B',
      image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=1000',
      secondaryImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000',
    },
  ],
  featured: true,
};

describe('Challenger M2.2: Product Card, Swatches, Quick Buy & Fallback Image Empirical Suite', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error');
    consoleWarnSpy = vi.spyOn(console, 'warn');
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 1: COLOR SWATCH SWITCHING & IMAGE SWAP REACTIVITY                     */
  /* -------------------------------------------------------------------------- */
  describe('Area 1: Color Swatch Switching & Image Swap Reactivity', () => {
    it('initializes with first colorway active (swatch 0 checked, matching image and alt)', () => {
      render(<ProductCard product={MOCK_MULTI_COLOR_PRODUCT} />);

      const swatch0 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-0`);
      const swatch1 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`);
      const swatch2 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-2`);

      expect(swatch0).toHaveAttribute('aria-checked', 'true');
      expect(swatch1).toHaveAttribute('aria-checked', 'false');
      expect(swatch2).toHaveAttribute('aria-checked', 'false');

      const img = screen.getByRole('img', {
        name: `${MOCK_MULTI_COLOR_PRODUCT.title} in ${MOCK_MULTI_COLOR_PRODUCT.colors[0].name}`,
      });
      expect(img).toHaveAttribute('src', MOCK_MULTI_COLOR_PRODUCT.colors[0].image);
    });

    it('switches image and aria-checked when clicking different color swatches', () => {
      render(<ProductCard product={MOCK_MULTI_COLOR_PRODUCT} />);

      const swatch0 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-0`);
      const swatch1 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`);
      const swatch2 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-2`);

      // Switch to Oatmeal Heather (index 1)
      fireEvent.click(swatch1);

      expect(swatch0).toHaveAttribute('aria-checked', 'false');
      expect(swatch1).toHaveAttribute('aria-checked', 'true');
      expect(swatch2).toHaveAttribute('aria-checked', 'false');

      const imgOatmeal = screen.getByRole('img', {
        name: `${MOCK_MULTI_COLOR_PRODUCT.title} in Oatmeal Heather`,
      });
      expect(imgOatmeal).toHaveAttribute('src', MOCK_MULTI_COLOR_PRODUCT.colors[1].image);

      // Switch to Vicuna Camel (index 2)
      fireEvent.click(swatch2);

      expect(swatch0).toHaveAttribute('aria-checked', 'false');
      expect(swatch1).toHaveAttribute('aria-checked', 'false');
      expect(swatch2).toHaveAttribute('aria-checked', 'true');

      const imgVicuna = screen.getByRole('img', {
        name: `${MOCK_MULTI_COLOR_PRODUCT.title} in Vicuna Camel`,
      });
      expect(imgVicuna).toHaveAttribute('src', MOCK_MULTI_COLOR_PRODUCT.colors[2].image);
    });

    it('rapidly cycles through swatches repeatedly without state desynchronization', () => {
      render(<ProductCard product={MOCK_MULTI_COLOR_PRODUCT} />);

      const swatch0 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-0`);
      const swatch1 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`);
      const swatch2 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-2`);

      // 10 cycles of rapid switching
      for (let i = 0; i < 10; i++) {
        fireEvent.click(swatch1);
        expect(swatch1).toHaveAttribute('aria-checked', 'true');
        fireEvent.click(swatch2);
        expect(swatch2).toHaveAttribute('aria-checked', 'true');
        fireEvent.click(swatch0);
        expect(swatch0).toHaveAttribute('aria-checked', 'true');
      }

      const finalImg = screen.getByRole('img', {
        name: `${MOCK_MULTI_COLOR_PRODUCT.title} in ${MOCK_MULTI_COLOR_PRODUCT.colors[0].name}`,
      });
      expect(finalImg).toHaveAttribute('src', MOCK_MULTI_COLOR_PRODUCT.colors[0].image);
    });

    it('updates Quick Buy aria-label to reflect active colorway after swatch switch', () => {
      render(<ProductCard product={MOCK_MULTI_COLOR_PRODUCT} />);

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`);
      expect(quickBuyBtn).toHaveAttribute(
        'aria-label',
        `Quick buy ${MOCK_MULTI_COLOR_PRODUCT.title} in ${MOCK_MULTI_COLOR_PRODUCT.colors[0].name} size S`
      );

      // Switch to index 2
      fireEvent.click(screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-2`));

      expect(quickBuyBtn).toHaveAttribute(
        'aria-label',
        `Quick buy ${MOCK_MULTI_COLOR_PRODUCT.title} in ${MOCK_MULTI_COLOR_PRODUCT.colors[2].name} size S`
      );
    });

    it('passes the currently selected colorway to onQuickBuy and onSelectProduct callbacks', () => {
      const onQuickBuyMock = vi.fn();
      const onSelectProductMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onQuickBuy={onQuickBuyMock}
          onSelectProduct={onSelectProductMock}
        />
      );

      // Switch to index 1 (Oatmeal Heather)
      fireEvent.click(screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`));

      // Trigger Quick Buy
      fireEvent.click(screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`));

      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);
      expect(onQuickBuyMock).toHaveBeenCalledWith(
        MOCK_MULTI_COLOR_PRODUCT,
        MOCK_MULTI_COLOR_PRODUCT.colors[1],
        'S'
      );

      // Trigger Card Select
      fireEvent.click(screen.getByTestId(`product-card-${MOCK_MULTI_COLOR_PRODUCT.id}`));

      expect(onSelectProductMock).toHaveBeenCalledTimes(1);
      expect(onSelectProductMock).toHaveBeenCalledWith(
        MOCK_MULTI_COLOR_PRODUCT,
        MOCK_MULTI_COLOR_PRODUCT.colors[1]
      );
    });

    it('renders secondary angle lifestyle image for active swatch', () => {
      const { container } = render(<ProductCard product={MOCK_MULTI_COLOR_PRODUCT} />);

      // Check secondary image container exists
      const secondaryImgs = container.querySelectorAll('img[loading="lazy"]');
      expect(secondaryImgs.length).toBeGreaterThan(0);
      expect(secondaryImgs[0]).toHaveAttribute('src', MOCK_MULTI_COLOR_PRODUCT.colors[0].secondaryImage);

      // Switch swatch
      fireEvent.click(screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`));

      const updatedSecondaryImgs = container.querySelectorAll('img[loading="lazy"]');
      expect(updatedSecondaryImgs[0]).toHaveAttribute('src', MOCK_MULTI_COLOR_PRODUCT.colors[1].secondaryImage);
    });

    it('handles single-colorway products gracefully', () => {
      const singleColorProduct: Product = {
        ...MOCK_MULTI_COLOR_PRODUCT,
        id: 'single-001',
        colors: [MOCK_MULTI_COLOR_PRODUCT.colors[0]],
      };

      render(<ProductCard product={singleColorProduct} />);

      const swatch = screen.getByTestId('swatch-single-001-0');
      expect(swatch).toBeInTheDocument();
      expect(swatch).toHaveAttribute('aria-checked', 'true');
      expect(screen.queryByTestId('swatch-single-001-1')).not.toBeInTheDocument();
    });

    it('handles empty colors array defensively with fallback classic colorway with zero console errors', () => {
      const noColorProduct: Product = {
        ...MOCK_MULTI_COLOR_PRODUCT,
        id: 'nocolor-001',
        colors: [],
      };

      render(<ProductCard product={noColorProduct} />);

      const swatch = screen.getByTestId('swatch-nocolor-001-0');
      expect(swatch).toBeInTheDocument();
      expect(swatch).toHaveAttribute('title', 'Classic');

      const fallback = screen.getByTestId('fallback-image-svg');
      expect(fallback).toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 2: QUICK-BUY BUTTON EVENT ISOLATION (stopPropagation)                */
  /* -------------------------------------------------------------------------- */
  describe('Area 2: Quick-Buy Button Event Isolation (stopPropagation)', () => {
    it('isolates Quick Buy mouse click from card onSelectProduct', () => {
      const onSelectProductMock = vi.fn();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onSelectProduct={onSelectProductMock}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`);
      fireEvent.click(quickBuyBtn);

      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);
      expect(onSelectProductMock).not.toHaveBeenCalled();
    });

    it('isolates click when clicking directly on nested icon or text inside Quick Buy button', () => {
      const onSelectProductMock = vi.fn();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onSelectProduct={onSelectProductMock}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyText = screen.getByText(/quick add • s/i);
      fireEvent.click(quickBuyText);

      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);
      expect(onSelectProductMock).not.toHaveBeenCalled();
    });

    it('isolates color swatch mouse click from card onSelectProduct', () => {
      const onSelectProductMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onSelectProduct={onSelectProductMock}
        />
      );

      const swatch1 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`);
      fireEvent.click(swatch1);

      expect(onSelectProductMock).not.toHaveBeenCalled();
    });

    it('isolates keyboard events on color swatch button (Enter / Space)', () => {
      const onSelectProductMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onSelectProduct={onSelectProductMock}
        />
      );

      const swatch1 = screen.getByTestId(`swatch-${MOCK_MULTI_COLOR_PRODUCT.id}-1`);

      // When focused on swatch button, pressing Enter or Space must NOT trigger onSelectProduct
      fireEvent.keyDown(swatch1, { key: 'Enter' });
      expect(onSelectProductMock).not.toHaveBeenCalled();

      fireEvent.keyDown(swatch1, { key: ' ' });
      expect(onSelectProductMock).not.toHaveBeenCalled();
    });

    it('isolates keyboard events on Quick Buy button (Enter / Space)', () => {
      const onSelectProductMock = vi.fn();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onSelectProduct={onSelectProductMock}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`);

      // When focused on quick buy button, pressing Enter or Space must NOT trigger onSelectProduct
      fireEvent.keyDown(quickBuyBtn, { key: 'Enter' });
      expect(onSelectProductMock).not.toHaveBeenCalled();
      expect(onQuickBuyMock).not.toHaveBeenCalled();

      fireEvent.keyDown(quickBuyBtn, { key: ' ' });
      expect(onSelectProductMock).not.toHaveBeenCalled();
      expect(onQuickBuyMock).not.toHaveBeenCalled();
    });


    it('falls back to default size "M" when product.sizes is empty or undefined', () => {
      const onQuickBuyMock = vi.fn();
      const productNoSizes: Product = {
        ...MOCK_MULTI_COLOR_PRODUCT,
        id: 'nosize-001',
        sizes: [],
      };

      render(
        <ProductCard
          product={productNoSizes}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyBtn = screen.getByTestId('quick-buy-btn-nosize-001');
      expect(quickBuyBtn).toHaveTextContent(/quick add • m/i);

      fireEvent.click(quickBuyBtn);

      expect(onQuickBuyMock).toHaveBeenCalledWith(
        productNoSizes,
        productNoSizes.colors[0],
        'M'
      );
    });

    it('prevents event interference across multiple cards in a ProductGrid', () => {
      const onSelectProductMock = vi.fn();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductGrid
          products={PRODUCTS.slice(0, 4)}
          onSelectProduct={onSelectProductMock}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const firstBtn = screen.getByTestId(`quick-buy-btn-${PRODUCTS[0].id}`);
      fireEvent.click(firstBtn);

      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);
      expect(onQuickBuyMock).toHaveBeenCalledWith(
        PRODUCTS[0],
        PRODUCTS[0].colors[0],
        PRODUCTS[0].sizes[0]
      );
      expect(onSelectProductMock).not.toHaveBeenCalled();

      // Card 2 Quick Buy
      const secondBtn = screen.getByTestId(`quick-buy-btn-${PRODUCTS[1].id}`);
      fireEvent.click(secondBtn);

      expect(onQuickBuyMock).toHaveBeenCalledTimes(2);
      expect(onQuickBuyMock).toHaveBeenCalledWith(
        PRODUCTS[1],
        PRODUCTS[1].colors[0],
        PRODUCTS[1].sizes[0]
      );
      expect(onSelectProductMock).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 3: QUICK-BUY FEEDBACK STATE TRANSITIONS & TIMEOUT RESET              */
  /* -------------------------------------------------------------------------- */
  describe('Area 3: Quick-Buy Feedback State Transitions & Timeout Reset', () => {
    it('executes the full state transition cycle: idle -> added -> idle after 1200ms', () => {
      vi.useFakeTimers();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`);

      // Initial: idle
      expect(quickBuyBtn).toHaveTextContent(/quick add • s/i);
      expect(quickBuyBtn.className).toContain('bg-[#0D0D0D]');

      // Click: transition to added
      fireEvent.click(quickBuyBtn);

      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);
      expect(quickBuyBtn).toHaveTextContent(/added to bag/i);
      expect(quickBuyBtn.className).toContain('bg-[#D4AF37]');

      // Advance 600ms (halfway) - still added
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(quickBuyBtn).toHaveTextContent(/added to bag/i);

      // Advance another 600ms (1200ms total) - resets to idle
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(quickBuyBtn).toHaveTextContent(/quick add • s/i);
      expect(quickBuyBtn.className).toContain('bg-[#0D0D0D]');

      vi.useRealTimers();
    });

    it('blocks duplicate triggers during the 1200ms "added" lockout period', () => {
      vi.useFakeTimers();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`);

      // First click
      fireEvent.click(quickBuyBtn);
      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);

      // Spam clicks during added state
      fireEvent.click(quickBuyBtn);
      fireEvent.click(quickBuyBtn);
      fireEvent.click(quickBuyBtn);
      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);

      // Advance 500ms and click again
      act(() => {
        vi.advanceTimersByTime(500);
      });
      fireEvent.click(quickBuyBtn);
      expect(onQuickBuyMock).toHaveBeenCalledTimes(1);

      // Advance remaining 700ms to reset
      act(() => {
        vi.advanceTimersByTime(700);
      });

      // Now clickable again
      fireEvent.click(quickBuyBtn);
      expect(onQuickBuyMock).toHaveBeenCalledTimes(2);

      act(() => {
        vi.advanceTimersByTime(1200);
      });

      vi.useRealTimers();
    });

    it('survives component unmounting while 1200ms timer is pending without errors', () => {
      vi.useFakeTimers();
      const onQuickBuyMock = vi.fn();

      const { unmount } = render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onQuickBuy={onQuickBuyMock}
        />
      );

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_MULTI_COLOR_PRODUCT.id}`);
      fireEvent.click(quickBuyBtn);

      // Unmount while timer is pending
      unmount();

      // Fire timer after unmount
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1200);
        });
      }).not.toThrow();

      vi.useRealTimers();
    });

    it('independent feedback timers across multiple cards', () => {
      vi.useFakeTimers();
      const onQuickBuyMock = vi.fn();

      render(
        <div>
          <ProductCard product={PRODUCTS[0]} onQuickBuy={onQuickBuyMock} />
          <ProductCard product={PRODUCTS[1]} onQuickBuy={onQuickBuyMock} />
        </div>
      );

      const btn1 = screen.getByTestId(`quick-buy-btn-${PRODUCTS[0].id}`);
      const btn2 = screen.getByTestId(`quick-buy-btn-${PRODUCTS[1].id}`);

      // Click card 1 at t = 0ms
      fireEvent.click(btn1);
      expect(btn1).toHaveTextContent(/added to bag/i);
      expect(btn2).toHaveTextContent(/quick add/i);

      // Advance 600ms, then click card 2 at t = 600ms
      act(() => {
        vi.advanceTimersByTime(600);
      });
      fireEvent.click(btn2);
      expect(btn1).toHaveTextContent(/added to bag/i);
      expect(btn2).toHaveTextContent(/added to bag/i);

      // Advance 600ms (t = 1200ms for card 1, t = 600ms for card 2)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(btn1).toHaveTextContent(/quick add/i);
      expect(btn2).toHaveTextContent(/added to bag/i);

      // Advance another 600ms (card 2 resets)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(btn2).toHaveTextContent(/quick add/i);

      vi.useRealTimers();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 4: FALLBACK IMAGE RESILIENCE                                          */
  /* -------------------------------------------------------------------------- */
  describe('Area 4: Fallback Image Resilience', () => {
    it('renders fallback SVG placeholder on image error with valid data URI and alt text', () => {
      render(
        <ImageWithFallback
          src="https://invalid-domain-does-not-exist.test/broken-image.jpg"
          alt="Luxury Archival Trench"
          fallbackText="OUTERWEAR"
          fallbackSubtext="EDITION 01"
        />
      );

      const img = screen.getByRole('img', { name: 'Luxury Archival Trench' });
      expect(img).toBeInTheDocument();

      // Trigger error
      fireEvent.error(img);

      const fallbackImg = screen.getByTestId('fallback-image-svg');
      expect(fallbackImg).toBeInTheDocument();
      expect(fallbackImg).toHaveAttribute(
        'alt',
        'Luxury Archival Trench (Offline Placeholder)'
      );

      const src = fallbackImg.getAttribute('src');
      expect(src).toMatch(/^data:image\/svg\+xml;utf8,/);
      expect(decodeURIComponent(src!)).toContain('AURA');
      expect(decodeURIComponent(src!)).toContain('OUTERWEAR');
      expect(decodeURIComponent(src!)).toContain('EDITION 01');
    });

    it('recovers from fallback error state when src changes to a valid url', () => {
      const { rerender } = render(
        <ImageWithFallback
          src="https://broken-url-1.test/bad.jpg"
          alt="Test Garment"
        />
      );

      const img = screen.getByRole('img', { name: 'Test Garment' });
      fireEvent.error(img);

      // Now in fallback state
      expect(screen.getByTestId('fallback-image-svg')).toBeInTheDocument();

      // Change src to a new URL
      rerender(
        <ImageWithFallback
          src="https://valid-url.test/new-photo.jpg"
          alt="Test Garment"
        />
      );

      // Fallback is cleared, normal img is back
      expect(screen.queryByTestId('fallback-image-svg')).not.toBeInTheDocument();
      const newImg = screen.getByRole('img', { name: 'Test Garment' });
      expect(newImg).toHaveAttribute('src', 'https://valid-url.test/new-photo.jpg');

      // Successfully loads
      fireEvent.load(newImg);
      expect(newImg.className).toContain('opacity-100');
    });

    it('safely handles special characters and quotes in fallback text without breaking SVG data URI', () => {
      const maliciousOrComplexText = '<script>alert("xss")</script> & "luxury" \'edition\'';
      render(
        <ImageWithFallback
          src="https://broken-url.test/photo.jpg"
          alt="Special Edition"
          fallbackText={maliciousOrComplexText}
          fallbackSubtext="Test & Safety"
        />
      );

      const img = screen.getByRole('img', { name: 'Special Edition' });
      fireEvent.error(img);

      const fallbackImg = screen.getByTestId('fallback-image-svg');
      expect(fallbackImg).toBeInTheDocument();

      const src = fallbackImg.getAttribute('src') || '';
      expect(src.startsWith('data:image/svg+xml;utf8,')).toBe(true);

      // Decoded SVG contains escaped/encoded text
      const decoded = decodeURIComponent(src);
      expect(decoded).toContain('TEST & SAFETY');
    });

    it('ProductCard triggers fallback image seamlessly when swatch has broken image URL', () => {
      const productWithBrokenImage: Product = {
        ...MOCK_MULTI_COLOR_PRODUCT,
        id: 'broken-001',
        colors: [
          {
            name: 'Broken Black',
            hex: '#0D0D0D',
            image: 'https://bad-cdn.test/404.jpg',
            secondaryImage: '',
          },
        ],
      };

      render(<ProductCard product={productWithBrokenImage} />);

      const img = screen.getByRole('img', {
        name: `${productWithBrokenImage.title} in Broken Black`,
      });
      fireEvent.error(img);

      const fallback = screen.getByTestId('fallback-image-svg');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveAttribute(
        'alt',
        `${productWithBrokenImage.title} in Broken Black (Offline Placeholder)`
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 5: KEYBOARD NAVIGATION & ZERO CONSOLE ERRORS STRESS HARNESS          */
  /* -------------------------------------------------------------------------- */
  describe('Area 5: Keyboard Navigation & Zero Console Errors Stress Harness', () => {
    it('supports keyboard card activation with Enter and Space keys', () => {
      const onSelectProductMock = vi.fn();
      render(
        <ProductCard
          product={MOCK_MULTI_COLOR_PRODUCT}
          onSelectProduct={onSelectProductMock}
        />
      );

      const card = screen.getByTestId(`product-card-${MOCK_MULTI_COLOR_PRODUCT.id}`);

      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onSelectProductMock).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(card, { key: ' ' });
      expect(onSelectProductMock).toHaveBeenCalledTimes(2);

      // Irrelevant keys do not trigger
      fireEvent.keyDown(card, { key: 'ArrowDown' });
      fireEvent.keyDown(card, { key: 'Tab' });
      expect(onSelectProductMock).toHaveBeenCalledTimes(2);
    });

    it('executes intensive multi-user interaction sequence across entire catalog with zero errors', () => {
      vi.useFakeTimers();
      const onSelectProductMock = vi.fn();
      const onQuickBuyMock = vi.fn();

      render(
        <ProductGrid
          products={PRODUCTS}
          onSelectProduct={onSelectProductMock}
          onQuickBuy={onQuickBuyMock}
        />
      );

      // Simulate a user rapidly clicking swatches and quick buy across all 12 products
      PRODUCTS.forEach((p) => {
        // Switch swatches
        p.colors.forEach((_, cIdx) => {
          const swatch = screen.getByTestId(`swatch-${p.id}-${cIdx}`);
          fireEvent.click(swatch);
          expect(swatch).toHaveAttribute('aria-checked', 'true');
        });

        // Click Quick Buy
        const qBtn = screen.getByTestId(`quick-buy-btn-${p.id}`);
        fireEvent.click(qBtn);
      });

      expect(onQuickBuyMock).toHaveBeenCalledTimes(12);
      expect(onSelectProductMock).not.toHaveBeenCalled();

      // Advance timers past all feedback transitions
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      // All buttons reset to idle
      PRODUCTS.forEach((p) => {
        const qBtn = screen.getByTestId(`quick-buy-btn-${p.id}`);
        expect(qBtn).toHaveTextContent(/quick add/i);
      });

      vi.useRealTimers();
    });
  });
});
