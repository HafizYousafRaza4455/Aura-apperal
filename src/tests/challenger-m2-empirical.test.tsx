import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import {
  PRODUCTS,
  getProductsByCategory,
  sortProducts,
  formatPrice,
  filterAndSortProducts,
} from '../data/products';
import { CategoryFilter, CATEGORY_TABS } from '../components/catalog/CategoryFilter';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { Product, SortOption } from '../types/product';

describe('Challenger M2: Empirical Stress, Boundary & Verification Suite', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  /* ========================================================================== */
  /* AREA 1: Zero Console Errors Verification                                   */
  /* ========================================================================== */
  describe('Area 1: Zero Console Errors & Clean Runtimes', () => {
    it('mounts and performs multi-tab, multi-sort interactions with zero console.error calls', () => {
      render(<App />);

      // Iterate through every category tab
      const tabKeys: ('all' | 'outerwear' | 'essentials' | 'summer-drop')[] = [
        'outerwear',
        'essentials',
        'summer-drop',
        'all',
      ];
      for (const tabKey of tabKeys) {
        fireEvent.click(screen.getByTestId(`category-tab-${tabKey}`));
      }

      // Iterate through every sort option
      const sortSelect = screen.getByTestId('sort-select');
      const sortValues: SortOption[] = ['price-asc', 'price-desc', 'newest', 'featured'];
      for (const sortVal of sortValues) {
        fireEvent.change(sortSelect, { target: { value: sortVal } });
      }

      // Trigger swatches and quick buy
      const firstCard = screen.getAllByTestId(/product-card-/)[0];
      fireEvent.click(firstCard);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('renders empty state with zero console errors or warnings', () => {
      render(
        <ProductGrid
          products={[]}
          activeCategoryName="outerwear"
          onResetFilter={() => {}}
        />
      );

      expect(screen.getByTestId('product-grid-empty')).toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  /* ========================================================================== */
  /* AREA 2: Category Filtering Across All Tabs & Item Counts                   */
  /* ========================================================================== */
  describe('Area 2: Category Filtering Across All Tabs & Exact Item Counts', () => {
    it('verifies dataset partition: sum of movement items exactly equals 12', () => {
      const outerwear = PRODUCTS.filter((p) => p.category === 'outerwear');
      const essentials = PRODUCTS.filter((p) => p.category === 'essentials');
      const summerDrop = PRODUCTS.filter((p) => p.category === 'summer-drop');

      expect(outerwear).toHaveLength(4);
      expect(essentials).toHaveLength(4);
      expect(summerDrop).toHaveLength(4);
      expect(outerwear.length + essentials.length + summerDrop.length).toBe(PRODUCTS.length);
      expect(PRODUCTS).toHaveLength(12);

      // Verify no ID collisions
      const idSet = new Set(PRODUCTS.map((p) => p.id));
      expect(idSet.size).toBe(12);
    });

    it('verifies exact returned product IDs and counts for all 4 category tabs', () => {
      // 1. ALL Tab
      const allResult = getProductsByCategory('all');
      expect(allResult).toHaveLength(12);

      // 2. Outerwear Tab
      const outResult = getProductsByCategory('outerwear');
      expect(outResult).toHaveLength(4);
      expect(outResult.map((p) => p.id)).toEqual(['out-001', 'out-002', 'out-003', 'out-004']);
      outResult.forEach((p) => expect(p.category).toBe('outerwear'));

      // 3. Essentials Tab
      const essResult = getProductsByCategory('essentials');
      expect(essResult).toHaveLength(4);
      expect(essResult.map((p) => p.id)).toEqual(['ess-001', 'ess-002', 'ess-003', 'ess-004']);
      essResult.forEach((p) => expect(p.category).toBe('essentials'));

      // 4. Summer Drop Tab
      const sumResult = getProductsByCategory('summer-drop');
      expect(sumResult).toHaveLength(4);
      expect(sumResult.map((p) => p.id)).toEqual(['sum-001', 'sum-002', 'sum-003', 'sum-004']);
      sumResult.forEach((p) => expect(p.category).toBe('summer-drop'));
    });

    it('empirically verifies DOM rendering of category counts and tab accessibility attributes', () => {
      const onSelectMock = vi.fn();
      render(
        <CategoryFilter
          activeCategory="outerwear"
          onSelectCategory={onSelectMock}
          currentSort="featured"
          onSortChange={() => {}}
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

      // Verify all 4 tabs exist
      for (const tab of CATEGORY_TABS) {
        const tabEl = screen.getByTestId(`category-tab-${tab.id}`);
        expect(tabEl).toBeInTheDocument();
        expect(tabEl).toHaveAttribute('role', 'tab');
        expect(tabEl).toHaveAttribute('aria-controls', 'catalog-product-grid');

        if (tab.id === 'outerwear') {
          expect(tabEl).toHaveAttribute('aria-selected', 'true');
          expect(tabEl).toHaveAttribute('tabIndex', '0');
        } else {
          expect(tabEl).toHaveAttribute('aria-selected', 'false');
          expect(tabEl).toHaveAttribute('tabIndex', '-1');
        }
      }

      // Verify readout
      expect(screen.getByTestId('item-count-readout')).toHaveTextContent('SHOWING 4 OF 12 EDITIONS');
    });

    it('verifies keyboard navigation wrapping (ArrowRight, ArrowLeft, Home, End)', () => {
      const onSelectMock = vi.fn();
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={onSelectMock}
          currentSort="featured"
          onSortChange={() => {}}
          filteredCount={12}
          totalCount={12}
        />
      );

      const allTab = screen.getByTestId('category-tab-all');
      const summerTab = screen.getByTestId('category-tab-summer-drop');

      // ArrowRight from first tab goes to second (outerwear)
      fireEvent.keyDown(allTab, { key: 'ArrowRight' });
      expect(onSelectMock).toHaveBeenLastCalledWith('outerwear');

      // ArrowLeft from first tab wraps around to last (summer-drop)
      fireEvent.keyDown(allTab, { key: 'ArrowLeft' });
      expect(onSelectMock).toHaveBeenLastCalledWith('summer-drop');

      // End key goes to last tab (summer-drop)
      fireEvent.keyDown(allTab, { key: 'End' });
      expect(onSelectMock).toHaveBeenLastCalledWith('summer-drop');

      // Home key goes to first tab (all)
      fireEvent.keyDown(summerTab, { key: 'Home' });
      expect(onSelectMock).toHaveBeenLastCalledWith('all');
    });

    it('verifies cross-component category synchronization (Navbar, Showcase, Footer to Catalog)', () => {
      render(<App />);

      // 1. Click Essentials in Navbar
      const navEssentials = screen.getByTestId('nav-link-essentials');
      fireEvent.click(navEssentials);

      expect(screen.getByTestId('category-tab-essentials')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('item-count-readout')).toHaveTextContent('SHOWING 4 OF 12 EDITIONS');
      expect(screen.getByTestId('product-card-ess-001')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card-out-001')).not.toBeInTheDocument();

      // 2. Click Summer Drop in Showcase
      const showcaseSummer = screen.getByTestId('collection-card-summer-drop');
      fireEvent.click(showcaseSummer);

      expect(screen.getByTestId('category-tab-summer-drop')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('product-card-sum-001')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card-ess-001')).not.toBeInTheDocument();

      // 3. Click Outerwear in Footer
      const footerOuterwear = screen.getByTestId('footer-link-outerwear');
      fireEvent.click(footerOuterwear);

      expect(screen.getByTestId('category-tab-outerwear')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('product-card-out-001')).toBeInTheDocument();
      expect(screen.queryByTestId('product-card-sum-001')).not.toBeInTheDocument();

      // 4. Click Collections in Navbar to return to 'all'
      const navCollections = screen.getByTestId('nav-link-collections');
      fireEvent.click(navCollections);

      expect(screen.getByTestId('category-tab-all')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('item-count-readout')).toHaveTextContent('SHOWING 12 OF 12 EDITIONS');
    });
  });

  /* ========================================================================== */
  /* AREA 3: Sorting Algorithms (asc / desc / newest / featured)                */
  /* ========================================================================== */
  describe('Area 3: Sorting Algorithms Empirical Mathematical Verification', () => {
    it('empirically verifies price ascending sort monotonicity across all 12 items', () => {
      const sorted = sortProducts(PRODUCTS, 'price-asc');
      expect(sorted).toHaveLength(12);

      // Strict monotonicity test: price[i] <= price[i+1]
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
      }

      // Exact price array
      const prices = sorted.map((p) => p.price);
      expect(prices).toEqual([95, 185, 210, 240, 260, 280, 310, 320, 490, 580, 640, 780]);
      expect(sorted[0].id).toBe('ess-003'); // $95 Heavyweight Cotton Tee
      expect(sorted[sorted.length - 1].id).toBe('out-004'); // $780 Shearling Aviator
    });

    it('empirically verifies price descending sort monotonicity across all 12 items', () => {
      const sorted = sortProducts(PRODUCTS, 'price-desc');
      expect(sorted).toHaveLength(12);

      // Strict monotonicity test: price[i] >= price[i+1]
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i + 1].price);
      }

      // Exact price array
      const prices = sorted.map((p) => p.price);
      expect(prices).toEqual([780, 640, 580, 490, 320, 310, 280, 260, 240, 210, 185, 95]);
      expect(sorted[0].id).toBe('out-004'); // $780 Shearling Aviator
      expect(sorted[sorted.length - 1].id).toBe('ess-003'); // $95 Heavyweight Cotton Tee
    });

    it('empirically verifies newest sort prioritizes NEW ARRIVAL and SUMMER DROP badges', () => {
      const sorted = sortProducts(PRODUCTS, 'newest');
      expect(sorted).toHaveLength(12);

      // Partition check: all newest badge items must come before items without newest badge
      const isNewestBadge = (badge?: string) => badge === 'NEW ARRIVAL' || badge === 'SUMMER DROP';

      const firstPartition = sorted.slice(0, 6);
      const secondPartition = sorted.slice(6);

      firstPartition.forEach((p) => {
        expect(isNewestBadge(p.badge)).toBe(true);
      });

      secondPartition.forEach((p) => {
        expect(isNewestBadge(p.badge)).toBe(false);
      });
    });

    it('empirically verifies featured sort places all featured items first', () => {
      const sorted = sortProducts(PRODUCTS, 'featured');
      expect(sorted).toHaveLength(12);

      const featuredItems = PRODUCTS.filter((p) => p.featured === true);
      const nonFeaturedItems = PRODUCTS.filter((p) => !p.featured);

      expect(featuredItems).toHaveLength(6);
      expect(nonFeaturedItems).toHaveLength(6);

      // First 6 must be featured
      for (let i = 0; i < 6; i++) {
        expect(sorted[i].featured).toBe(true);
      }
      // Next 6 must NOT be featured
      for (let i = 6; i < 12; i++) {
        expect(sorted[i].featured).toBeFalsy();
      }
    });

    it('verifies sort ordering within filtered category subsets', () => {
      // Outerwear sorted price-asc
      const outAsc = filterAndSortProducts(PRODUCTS, 'outerwear', 'price-asc');
      expect(outAsc.map((p) => p.price)).toEqual([490, 580, 640, 780]);

      // Essentials sorted price-desc
      const essDesc = filterAndSortProducts(PRODUCTS, 'essentials', 'price-desc');
      expect(essDesc.map((p) => p.price)).toEqual([320, 240, 185, 95]);

      // Summer drop sorted newest
      const sumNew = filterAndSortProducts(PRODUCTS, 'summer-drop', 'newest');
      expect(sumNew).toHaveLength(4);
      // sum-001, sum-002, sum-004 have SUMMER DROP badge
      expect(sumNew.slice(0, 3).every((p) => p.badge === 'SUMMER DROP')).toBe(true);
      expect(sumNew[3].badge).toBe('EXCLUSIVE'); // sum-003
    });

    it('verifies sort dropdown in App updates DOM card rendering order and persists across category transitions', () => {
      render(<App />);

      const sortSelect = screen.getByTestId('sort-select');

      // 1. Select Price Low to High
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
      let renderedCards = screen.getAllByTestId(/product-card-/);
      expect(renderedCards[0]).toHaveAttribute('data-testid', 'product-card-ess-003'); // $95

      // 2. Filter to Outerwear while keeping Price Low to High
      fireEvent.click(screen.getByTestId('category-tab-outerwear'));
      renderedCards = screen.getAllByTestId(/product-card-/);
      expect(renderedCards).toHaveLength(4);
      expect(renderedCards[0]).toHaveAttribute('data-testid', 'product-card-out-003'); // $490
      expect(renderedCards[3]).toHaveAttribute('data-testid', 'product-card-out-004'); // $780

      // 3. Switch to Price High to Low
      fireEvent.change(sortSelect, { target: { value: 'price-desc' } });
      renderedCards = screen.getAllByTestId(/product-card-/);
      expect(renderedCards[0]).toHaveAttribute('data-testid', 'product-card-out-004'); // $780
      expect(renderedCards[3]).toHaveAttribute('data-testid', 'product-card-out-003'); // $490

      // 4. Switch to Essentials: sort persists as price-desc
      fireEvent.click(screen.getByTestId('category-tab-essentials'));
      renderedCards = screen.getAllByTestId(/product-card-/);
      expect(renderedCards[0]).toHaveAttribute('data-testid', 'product-card-ess-002'); // $320
      expect(renderedCards[3]).toHaveAttribute('data-testid', 'product-card-ess-003'); // $95
    });
  });

  /* ========================================================================== */
  /* AREA 4: Empty State & Edge Case Handling                                   */
  /* ========================================================================== */
  describe('Area 4: Empty State Handling & Defensive Edge Cases', () => {
    it('renders empty state UI when product list is empty and calls onResetFilter', () => {
      const onResetMock = vi.fn();
      render(
        <ProductGrid
          products={[]}
          onResetFilter={onResetMock}
          activeCategoryName="Outerwear"
        />
      );

      expect(screen.getByTestId('product-grid-empty')).toBeInTheDocument();
      expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /no archival pieces found/i })).toBeInTheDocument();
      expect(screen.getByText(/outerwear/i)).toBeInTheDocument();

      const resetBtn = screen.getByTestId('empty-state-reset-btn');
      fireEvent.click(resetBtn);
      expect(onResetMock).toHaveBeenCalledTimes(1);
    });

    it('renders empty state fallback text when activeCategoryName is undefined', () => {
      render(<ProductGrid products={[]} />);

      expect(screen.getByText(/the selected criteria/i)).toBeInTheDocument();
      expect(screen.queryByTestId('empty-state-reset-btn')).not.toBeInTheDocument();
    });

    it('defensively handles invalid category and sort inputs without throwing', () => {
      // Unknown category should filter out everything or fallback gracefully
      // @ts-expect-error - testing adversarial input
      const invalidCat = filterAndSortProducts(PRODUCTS, 'non-existent-category', 'featured');
      expect(invalidCat).toHaveLength(0);

      // Unknown sort should fallback to default (featured)
      // @ts-expect-error - testing adversarial input
      const invalidSort = filterAndSortProducts(PRODUCTS, 'all', 'invalid-sort-order');
      expect(invalidSort).toHaveLength(12);
      expect(invalidSort[0].featured).toBe(true);

      // Empty products array passed to sortProducts
      const emptySort = sortProducts([], 'price-asc');
      expect(emptySort).toEqual([]);

      // Single item array
      const single = [PRODUCTS[0]];
      const singleSort = sortProducts(single, 'price-desc');
      expect(singleSort).toEqual(single);
    });

    it('defensively handles products with minimal single colorway without console error', () => {
      const bareProduct: Product = {
        id: 'bare-001',
        title: 'Minimalist Blank',
        subtitle: 'Test Item',
        price: 150,
        category: 'essentials',
        description: 'Test',
        details: ['Detail 1'],
        sizes: ['M'],
        colors: [
          {
            name: 'Classic Obsidian',
            hex: '#0D0D0D',
            image: 'https://images.unsplash.com/photo-1544441893-675973e31985',
            secondaryImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
          },
        ],
        stock: 10,
      };

      const { container } = render(<ProductCard product={bareProduct} />);
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('product-title-bare-001')).toHaveTextContent('Minimalist Blank');
      expect(screen.getByTestId('product-price-bare-001')).toHaveTextContent('$150');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles formatPrice with edge cases (zero, high values, unsupported currency)', () => {
      expect(formatPrice(0, 'USD')).toBe('$0');
      expect(formatPrice(10000, 'USD')).toBe('$10000');
      expect(formatPrice(100, 'JPY')).toBe('¥15,500');

      // @ts-expect-error testing unsupported currency fallback
      const fallbackPrice = formatPrice(100, 'CAD');
      expect(fallbackPrice).toBe('$100');
    });

    it('CategoryFilter gracefully handles missing categoryCounts dictionary', () => {
      render(
        <CategoryFilter
          activeCategory="all"
          onSelectCategory={() => {}}
          currentSort="featured"
          onSortChange={() => {}}
          filteredCount={12}
          totalCount={12}
          // categoryCounts undefined
        />
      );

      // Verify tabs render without throwing
      expect(screen.getByTestId('category-tab-all')).toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  /* ========================================================================== */
  /* AREA 5: Multi-Currency Dynamic Price Conversion Across Grid                */
  /* ========================================================================== */
  describe('Area 5: Multi-Currency Dynamic Price Conversion Across Catalog Grid', () => {
    it('converts prices on all 12 cards dynamically when currency prop changes', () => {
      const { rerender } = render(<ProductGrid products={PRODUCTS} currentCurrency="USD" />);
      expect(screen.getByTestId('product-price-ess-003')).toHaveTextContent('$95');
      expect(screen.getByTestId('product-price-out-004')).toHaveTextContent('$780');

      rerender(<ProductGrid products={PRODUCTS} currentCurrency="EUR" />);
      expect(screen.getByTestId('product-price-ess-003')).toHaveTextContent('€87'); // 95 * 0.92 = 87.4 -> 87
      expect(screen.getByTestId('product-price-out-004')).toHaveTextContent('€718'); // 780 * 0.92 = 717.6 -> 718

      rerender(<ProductGrid products={PRODUCTS} currentCurrency="GBP" />);
      expect(screen.getByTestId('product-price-ess-003')).toHaveTextContent('£75'); // 95 * 0.79 = 75.05 -> 75
      expect(screen.getByTestId('product-price-out-004')).toHaveTextContent('£616'); // 780 * 0.79 = 616.2 -> 616

      rerender(<ProductGrid products={PRODUCTS} currentCurrency="JPY" />);
      expect(screen.getByTestId('product-price-ess-003')).toHaveTextContent('¥14,725'); // 95 * 155 = 14725
      expect(screen.getByTestId('product-price-out-004')).toHaveTextContent('¥120,900'); // 780 * 155 = 120900
    });
  });
});
