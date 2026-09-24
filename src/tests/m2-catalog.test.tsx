import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import {
  PRODUCTS,
  getProductsByCategory,
  getFeaturedProducts,
  getProductById,
  sortProducts,
  formatPrice,
  filterAndSortProducts,
  CURRENCY_RATES,
  CURRENCY_SYMBOLS,
  CATEGORY_METADATA,
} from '../data/products';
import { LuxuryBadge } from '../components/common/LuxuryBadge';
import { CategoryFilter } from '../components/catalog/CategoryFilter';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Product } from '../types/product';

const MOCK_PRODUCT: Product = {
  id: 'out-001',
  title: 'The Oversized Wool Trench',
  subtitle: 'Virgin Italian Wool',
  price: 580,
  category: 'outerwear',
  description: 'A monument to understated tailoring.',
  details: ['100% Virgin Wool', 'Made in Italy'],
  badge: 'EXCLUSIVE',
  stock: 12,
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
  ],
  featured: true,
};

describe('Milestone 2: Product Catalog & Category Filtering Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. Curated Dataset & Domain Helper Functions                               */
  /* -------------------------------------------------------------------------- */
  describe('Dataset Integrity & Query Helpers', () => {
    it('contains exactly 12 curated luxury products', () => {
      expect(PRODUCTS).toHaveLength(12);
    });

    it('allocates exactly 4 items per category movement', () => {
      const outerwear = PRODUCTS.filter((p) => p.category === 'outerwear');
      const essentials = PRODUCTS.filter((p) => p.category === 'essentials');
      const summerDrop = PRODUCTS.filter((p) => p.category === 'summer-drop');

      expect(outerwear).toHaveLength(4);
      expect(essentials).toHaveLength(4);
      expect(summerDrop).toHaveLength(4);
    });

    it('ensures every product has valid properties, pricing, colors, and imagery', () => {
      PRODUCTS.forEach((product) => {
        expect(product.id).toBeTruthy();
        expect(product.title).toBeTruthy();
        expect(product.subtitle).toBeTruthy();
        expect(product.price).toBeGreaterThan(0);
        expect(product.description).toBeTruthy();
        expect(product.details.length).toBeGreaterThanOrEqual(3);
        expect(product.sizes.length).toBeGreaterThanOrEqual(1);
        expect(product.colors.length).toBeGreaterThanOrEqual(1);

        product.colors.forEach((color) => {
          expect(color.name).toBeTruthy();
          expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(color.image).toBeTruthy();
          expect(color.secondaryImage).toBeTruthy();
        });
      });
    });

    it('getProductsByCategory returns correct filtered arrays', () => {
      expect(getProductsByCategory('all')).toHaveLength(12);
      expect(getProductsByCategory('outerwear')).toHaveLength(4);
      expect(getProductsByCategory('essentials')).toHaveLength(4);
      expect(getProductsByCategory('summer-drop')).toHaveLength(4);
    });

    it('getFeaturedProducts returns only items with featured flag', () => {
      const featured = getFeaturedProducts();
      expect(featured.length).toBeGreaterThan(0);
      featured.forEach((p) => expect(p.featured).toBe(true));
    });

    it('getProductById retrieves existing product and handles missing IDs', () => {
      const found = getProductById('out-001');
      expect(found).toBeDefined();
      expect(found?.title).toBe('The Oversized Wool Trench');

      const missing = getProductById('non-existent-id');
      expect(missing).toBeUndefined();
    });

    it('sortProducts sorts correctly by price and newest', () => {
      const priceAsc = sortProducts(PRODUCTS, 'price-asc');
      expect(priceAsc[0].price).toBeLessThanOrEqual(priceAsc[1].price);
      expect(priceAsc[priceAsc.length - 1].price).toBeGreaterThanOrEqual(
        priceAsc[priceAsc.length - 2].price
      );

      const priceDesc = sortProducts(PRODUCTS, 'price-desc');
      expect(priceDesc[0].price).toBeGreaterThanOrEqual(priceDesc[1].price);

      const newest = sortProducts(PRODUCTS, 'newest');
      const hasNewArrivals = newest.some((p) => p.badge === 'NEW ARRIVAL');
      expect(hasNewArrivals).toBe(true);
    });

    it('formatPrice formats across USD, EUR, GBP, and JPY currencies', () => {
      expect(CURRENCY_SYMBOLS.USD).toBe('$');
      expect(CURRENCY_SYMBOLS.EUR).toBe('€');
      expect(CURRENCY_SYMBOLS.GBP).toBe('£');
      expect(CURRENCY_SYMBOLS.JPY).toBe('¥');

      expect(CURRENCY_RATES.USD).toBe(1.0);
      expect(CURRENCY_RATES.EUR).toBe(0.92);

      expect(formatPrice(100, 'USD')).toBe('$100');
      expect(formatPrice(100, 'EUR')).toBe('€92');
      expect(formatPrice(100, 'GBP')).toBe('£79');
      expect(formatPrice(100, 'JPY')).toBe('¥15,500');
    });

    it('filterAndSortProducts correctly filters by category and sorts', () => {
      const sortedOuterwear = filterAndSortProducts(PRODUCTS, 'outerwear', 'price-asc');
      expect(sortedOuterwear).toHaveLength(4);
      sortedOuterwear.forEach((p) => expect(p.category).toBe('outerwear'));
      expect(sortedOuterwear[0].price).toBeLessThanOrEqual(sortedOuterwear[1].price);
    });

    it('contains metadata for all three movements', () => {
      expect(CATEGORY_METADATA.outerwear.title).toBe('Outerwear');
      expect(CATEGORY_METADATA.essentials.title).toBe('Essentials');
      expect(CATEGORY_METADATA['summer-drop'].title).toBe('Summer Drop');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. LuxuryBadge Component                                                   */
  /* -------------------------------------------------------------------------- */
  describe('LuxuryBadge Component', () => {
    it('renders null when badge is not provided', () => {
      const { container } = render(<LuxuryBadge badge={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders EXCLUSIVE badge with sharp 0px styling', () => {
      render(<LuxuryBadge badge="EXCLUSIVE" />);
      const badge = screen.getByTestId('badge-exclusive');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('EXCLUSIVE');
      expect(badge.className).toContain('rounded-none');
      expect(badge.className).toContain('text-[#D4AF37]');
    });

    it('renders NEW ARRIVAL badge', () => {
      render(<LuxuryBadge badge="NEW ARRIVAL" />);
      const badge = screen.getByTestId('badge-new-arrival');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('NEW ARRIVAL');
    });

    it('renders BESTSELLER badge', () => {
      render(<LuxuryBadge badge="BESTSELLER" />);
      const badge = screen.getByTestId('badge-bestseller');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('BESTSELLER');
    });

    it('renders SUMMER DROP badge with gold background', () => {
      render(<LuxuryBadge badge="SUMMER DROP" />);
      const badge = screen.getByTestId('badge-summer-drop');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('SUMMER DROP');
      expect(badge.className).toContain('bg-[#D4AF37]');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. CategoryFilter Component                                                */
  /* -------------------------------------------------------------------------- */
  describe('CategoryFilter Component', () => {
    it('renders all four category tabs with WAI-ARIA tab semantics', () => {
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={vi.fn()}
          currentSort="featured"
          onSortChange={vi.fn()}
          filteredCount={12}
          totalCount={12}
        />
      );

      const tablist = screen.getByRole('tablist', { name: /filter product catalog by category/i });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      const allTab = screen.getByTestId('category-tab-all');
      expect(allTab).toHaveAttribute('aria-selected', 'true');
      expect(allTab).toHaveAttribute('tabIndex', '0');

      const outerwearTab = screen.getByTestId('category-tab-outerwear');
      expect(outerwearTab).toHaveAttribute('aria-selected', 'false');
      expect(outerwearTab).toHaveAttribute('tabIndex', '-1');

      expect(screen.getByTestId('active-tab-indicator')).toBeInTheDocument();
    });

    it('triggers onSelectCategory when a tab is clicked', () => {
      const onSelectCategoryMock = vi.fn();
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={onSelectCategoryMock}
          currentSort="featured"
          onSortChange={vi.fn()}
          filteredCount={12}
          totalCount={12}
        />
      );

      fireEvent.click(screen.getByTestId('category-tab-outerwear'));
      expect(onSelectCategoryMock).toHaveBeenCalledWith('outerwear');
    });

    it('supports keyboard navigation across tabs (ArrowRight, ArrowLeft, Home, End)', () => {
      const onSelectCategoryMock = vi.fn();
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={onSelectCategoryMock}
          currentSort="featured"
          onSortChange={onSelectCategoryMock}
          filteredCount={12}
          totalCount={12}
        />
      );

      const allTab = screen.getByTestId('category-tab-all');

      // ArrowRight moves from all to outerwear
      fireEvent.keyDown(allTab, { key: 'ArrowRight' });
      expect(onSelectCategoryMock).toHaveBeenCalledWith('outerwear');

      // ArrowLeft moves back
      fireEvent.keyDown(allTab, { key: 'ArrowLeft' });
      expect(onSelectCategoryMock).toHaveBeenCalledWith('summer-drop');

      // End moves to summer-drop
      fireEvent.keyDown(allTab, { key: 'End' });
      expect(onSelectCategoryMock).toHaveBeenCalledWith('summer-drop');

      // Home moves to all
      fireEvent.keyDown(allTab, { key: 'Home' });
      expect(onSelectCategoryMock).toHaveBeenCalledWith('all');
    });

    it('renders edition count readout with live status announcement', () => {
      render(
        <CategoryFilter
          activeCategory="outerwear"
          onSelectCategory={vi.fn()}
          currentSort="featured"
          onSortChange={vi.fn()}
          filteredCount={4}
          totalCount={12}
        />
      );

      const readout = screen.getByTestId('item-count-readout');
      expect(readout).toHaveTextContent(/SHOWING 4 OF 12 EDITIONS/i);
      expect(readout).toHaveAttribute('role', 'status');
    });

    it('renders sort selector and fires onSortChange', () => {
      const onSortChangeMock = vi.fn();
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={vi.fn()}
          currentSort="featured"
          onSortChange={onSortChangeMock}
          filteredCount={12}
          totalCount={12}
        />
      );

      const select = screen.getByTestId('sort-select');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('featured');

      fireEvent.change(select, { target: { value: 'price-asc' } });
      expect(onSortChangeMock).toHaveBeenCalledWith('price-asc');
    });

    it('displays category counts inside tabs when categoryCounts is supplied', () => {
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={vi.fn()}
          currentSort="featured"
          onSortChange={vi.fn()}
          filteredCount={4}
          totalCount={12}
          categoryCounts={{
            all: 12,
            outerwear: 4,
            essentials: 4,
            'summer-drop': 4,
          }}
        />
      );

      expect(screen.getByTestId('category-tab-outerwear')).toHaveTextContent('(4)');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. ProductCard Component                                                   */
  /* -------------------------------------------------------------------------- */
  describe('ProductCard Component', () => {
    it('renders product information with Bodoni Moda typography and luxury badge', () => {
      render(<ProductCard product={MOCK_PRODUCT} />);

      const title = screen.getByTestId(`product-title-${MOCK_PRODUCT.id}`);
      expect(title).toHaveTextContent('The Oversized Wool Trench');
      expect(title.className).toContain('font-serif');

      const price = screen.getByTestId(`product-price-${MOCK_PRODUCT.id}`);
      expect(price).toHaveTextContent('$580');

      expect(screen.getByTestId('badge-exclusive')).toBeInTheDocument();
      expect(screen.getByText(/virgin italian wool/i)).toBeInTheDocument();
    });

    it('allows switching color swatches without triggering card click', () => {
      const onSelectProductMock = vi.fn();
      render(
        <ProductCard
          product={MOCK_PRODUCT}
          onSelectProduct={onSelectProductMock}
        />
      );

      const swatch0 = screen.getByTestId(`swatch-${MOCK_PRODUCT.id}-0`);
      const swatch1 = screen.getByTestId(`swatch-${MOCK_PRODUCT.id}-1`);

      expect(swatch0).toHaveAttribute('aria-checked', 'true');
      expect(swatch1).toHaveAttribute('aria-checked', 'false');

      // Click second swatch
      fireEvent.click(swatch1);

      // Card click must NOT have been called due to stopPropagation
      expect(onSelectProductMock).not.toHaveBeenCalled();
      expect(swatch1).toHaveAttribute('aria-checked', 'true');
    });

    it('triggers quick buy action and shows added feedback state', () => {
      vi.useFakeTimers();
      const onQuickBuyMock = vi.fn();
      const onSelectProductMock = vi.fn();

      render(
        <ProductCard
          product={MOCK_PRODUCT}
          onQuickBuy={onQuickBuyMock}
          onSelectProduct={onSelectProductMock}
        />
      );

      const quickBuyBtn = screen.getByTestId(`quick-buy-btn-${MOCK_PRODUCT.id}`);
      expect(quickBuyBtn).toHaveTextContent(/quick add/i);

      // Click Quick Buy
      fireEvent.click(quickBuyBtn);

      expect(onQuickBuyMock).toHaveBeenCalledWith(
        MOCK_PRODUCT,
        MOCK_PRODUCT.colors[0],
        'XS'
      );
      // Event propagation isolated
      expect(onSelectProductMock).not.toHaveBeenCalled();

      // Button enters feedback state
      expect(quickBuyBtn).toHaveTextContent(/added to bag/i);

      // Fast-forward 1200ms
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(quickBuyBtn).toHaveTextContent(/quick add/i);
      vi.useRealTimers();
    });

    it('triggers onSelectProduct when card is clicked or activated via keyboard', () => {
      const onSelectProductMock = vi.fn();
      render(
        <ProductCard
          product={MOCK_PRODUCT}
          onSelectProduct={onSelectProductMock}
        />
      );

      const card = screen.getByTestId(`product-card-${MOCK_PRODUCT.id}`);
      fireEvent.click(card);
      expect(onSelectProductMock).toHaveBeenCalledWith(MOCK_PRODUCT, MOCK_PRODUCT.colors[0]);

      // Keyboard Enter
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onSelectProductMock).toHaveBeenCalledTimes(2);

      // Keyboard Space
      fireEvent.keyDown(card, { key: ' ' });
      expect(onSelectProductMock).toHaveBeenCalledTimes(3);
    });

    it('formats price in alternative currencies (EUR, GBP, JPY)', () => {
      const { rerender } = render(
        <ProductCard product={MOCK_PRODUCT} currentCurrency="EUR" />
      );
      expect(screen.getByTestId(`product-price-${MOCK_PRODUCT.id}`)).toHaveTextContent('€534');

      rerender(<ProductCard product={MOCK_PRODUCT} currentCurrency="GBP" />);
      expect(screen.getByTestId(`product-price-${MOCK_PRODUCT.id}`)).toHaveTextContent('£458');

      rerender(<ProductCard product={MOCK_PRODUCT} currentCurrency="JPY" />);
      expect(screen.getByTestId(`product-price-${MOCK_PRODUCT.id}`)).toHaveTextContent('¥89,900');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. ProductGrid Component                                                   */
  /* -------------------------------------------------------------------------- */
  describe('ProductGrid Component', () => {
    it('renders a responsive 4-column grid for products', () => {
      render(<ProductGrid products={PRODUCTS} />);

      const grid = screen.getByTestId('product-grid');
      expect(grid).toBeInTheDocument();
      expect(grid.className).toContain('grid-cols-1');
      expect(grid.className).toContain('sm:grid-cols-2');
      expect(grid.className).toContain('lg:grid-cols-4');

      // 12 products rendered
      PRODUCTS.forEach((p) => {
        expect(screen.getByTestId(`product-card-${p.id}`)).toBeInTheDocument();
      });
    });

    it('renders empty state with reset button when products list is empty', () => {
      const onResetFilterMock = vi.fn();
      render(
        <ProductGrid
          products={[]}
          onResetFilter={onResetFilterMock}
          activeCategoryName="Outerwear"
        />
      );

      const emptyContainer = screen.getByTestId('product-grid-empty');
      expect(emptyContainer).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /no archival pieces found/i })).toBeInTheDocument();
      expect(screen.getByText(/outerwear/i)).toBeInTheDocument();

      const resetBtn = screen.getByTestId('empty-state-reset-btn');
      expect(resetBtn).toBeInTheDocument();

      fireEvent.click(resetBtn);
      expect(onResetFilterMock).toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. End-to-End App Integration                                              */
  /* -------------------------------------------------------------------------- */
  describe('App Storefront Catalog Integration', () => {
    it('mounts the complete catalog with all 12 items initially', () => {
      render(<App />);

      expect(screen.getByTestId('category-filter-container')).toBeInTheDocument();
      expect(screen.getByTestId('product-grid')).toBeInTheDocument();
      expect(screen.getByTestId('item-count-readout')).toHaveTextContent(/SHOWING 12 OF 12 EDITIONS/i);
    });

    it('dynamically filters products when category tabs are clicked', () => {
      render(<App />);

      // Click Outerwear tab
      fireEvent.click(screen.getByTestId('category-tab-outerwear'));

      // Check readout updates
      expect(screen.getByTestId('item-count-readout')).toHaveTextContent(/SHOWING 4 OF 12 EDITIONS/i);

      // Verify outerwear products are in the DOM, but essentials are not
      expect(screen.getByTestId('product-card-out-001')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card-ess-001')).not.toBeInTheDocument();

      // Click Summer Drop tab
      fireEvent.click(screen.getByTestId('category-tab-summer-drop'));
      expect(screen.getByTestId('item-count-readout')).toHaveTextContent(/SHOWING 4 OF 12 EDITIONS/i);
      expect(screen.getByTestId('product-card-sum-001')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card-out-001')).not.toBeInTheDocument();
    });

    it('synchronizes category selection from CollectionsShowcase cards', () => {
      render(<App />);

      // Click Essentials card in CollectionsShowcase
      const essentialsCard = screen.getByTestId('collection-card-essentials');
      fireEvent.click(essentialsCard);

      // Active tab in filter is now Essentials
      const essentialsTab = screen.getByTestId('category-tab-essentials');
      expect(essentialsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('product-card-ess-001')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card-out-001')).not.toBeInTheDocument();
    });

    it('reorders catalog items when sort option is changed', () => {
      render(<App />);

      const sortSelect = screen.getByTestId('sort-select');

      // Change to Price: Low to High
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

      const cards = screen.getAllByTestId(/product-card-/);
      // The first card should be the lowest price item ($95 - ess-003)
      expect(cards[0]).toHaveAttribute('data-testid', 'product-card-ess-003');

      // Change to Price: High to Low
      fireEvent.change(sortSelect, { target: { value: 'price-desc' } });
      const cardsDesc = screen.getAllByTestId(/product-card-/);
      // The first card should be the highest price item ($780 - out-004)
      expect(cardsDesc[0]).toHaveAttribute('data-testid', 'product-card-out-004');
    });

    it('increments navbar cart indicator when quick buy is clicked on any product card', () => {
      render(<App />);

      // Initially no cart badge
      expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();

      // Click Quick Buy on first product
      const quickBuyBtn = screen.getByTestId('quick-buy-btn-out-001');
      fireEvent.click(quickBuyBtn);

      // Badge now appears with count 1
      const badge = screen.getByTestId('cart-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('1');
      expect(screen.getByTestId('cart-gold-dot')).toBeInTheDocument();

      // Click Quick Buy on second product
      const quickBuyBtn2 = screen.getByTestId('quick-buy-btn-out-002');
      fireEvent.click(quickBuyBtn2);

      expect(screen.getByTestId('cart-badge')).toHaveTextContent('2');
    });
  });
});
