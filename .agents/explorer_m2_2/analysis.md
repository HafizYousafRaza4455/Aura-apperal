# Category Filter & Sort Architecture Analysis (Milestone 2)

**Author**: Explorer M2.2 (`explorer_m2_2`)  
**Project**: Aura Apparel — Luxury Minimalist Web Storefront  
**Working Directory**: `C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_m2_2`  
**Target Component**: `src/components/catalog/CategoryFilter.tsx`  
**Date**: 2026-09-03  
**Status**: Complete Architectural Specification  

---

## 1. Executive Summary

In Milestone 2, Aura Apparel introduces interactive product browsing across its 12 curated luxury editions spanning three core movements: Outerwear, Essentials, and Summer Drop. The central navigation control for this catalog is **`CategoryFilter.tsx`**, anchored at `#catalog`.

This component serves three primary functional responsibilities:
1. **Category Filter Tabs**: Instant filtering between collections—`ALL PIECES` (`'all'`), `OUTERWEAR` (`'outerwear'`), `ESSENTIALS` (`'essentials'`), and `SUMMER DROP` (`'summer-drop'`).
2. **Catalog Sort Selector**: Reordering items by `Featured`, `Price: Low to High`, `Price: High to Low`, and `New Arrivals`.
3. **Edition Readout**: Real-time accessible count readout (e.g. `SHOWING 12 OF 12 EDITIONS` or `SHOWING 4 OF 12 EDITIONS`).

All visual presentations strictly adhere to Aura Apparel's luxury minimalist archetype: Obsidian (`#0D0D0D`) typography, Pale Gold (`#D4AF37`) active indicators, Cloud White (`#FBF9F9`) surfaces, razor-sharp 0px borders (`rounded-none`), and zero drop shadows (`shadow-none`). Furthermore, full WAI-ARIA tablist accessibility with roving tabindex and keyboard navigation ensures 100% compliance.

---

## 2. Existing Baseline & Integration Points

### 2.1 Root State Synchronization (`src/App.tsx`)
Inspection of `src/App.tsx` (lines 10-18, 63-73) reveals:
- `activeCategory` is already managed at the root level using `useState<NavCategory>('all')`.
- `Navbar` and `MobileDrawer` accept `activeCategory` and dispatch `handleSelectCategory`.
- The `#catalog` anchor currently renders an M1 placeholder:
  ```tsx
  <div id="catalog" className="scroll-mt-20">
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 py-12 text-center border-b border-[#E5E5E5]/60">
      <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
        Milestone 1 Core Shell Active
      </span>
      <p className="font-serif text-lg text-[#707070] italic">
        Active Category Filter: <span className="text-[#0D0D0D] uppercase not-italic font-sans font-medium tracking-wider">{activeCategory}</span>
      </p>
    </div>
  </div>
  ```
- In Milestone 2, this placeholder is replaced by the complete catalog section containing `CategoryFilter` and `ProductGrid`.

### 2.2 Domain Types (`src/types/product.ts`)
Inspection of `src/types/product.ts` shows:
```typescript
export type Category = 'outerwear' | 'essentials' | 'summer-drop';
```
For catalog filtering, the category set is extended with the root view `'all'`:
```typescript
export type CategoryFilterValue = 'all' | Category;
```
This matches `NavCategory` in `src/components/layout/Navbar.tsx` (`'all' | 'outerwear' | 'essentials' | 'summer-drop'`).

---

## 3. Detailed Component Specification: `CategoryFilter.tsx`

### 3.1 TypeScript Interface Contracts

```typescript
import React from 'react';
import { Category } from '../../types/product';

export type CategoryFilterValue = 'all' | Category;

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface CategoryTabItem {
  id: CategoryFilterValue;
  label: string;
  shortLabel?: string;
  ariaLabel: string;
}

export interface SortOptionItem {
  value: SortOption;
  label: string;
}

export interface CategoryFilterProps {
  /** The currently active category tab */
  activeCategory: CategoryFilterValue;
  /** Callback fired when a category tab is clicked or activated via keyboard */
  onSelectCategory: (category: CategoryFilterValue) => void;
  /** The currently selected sort option */
  currentSort: SortOption;
  /** Callback fired when sort option is changed */
  onSortChange: (sort: SortOption) => void;
  /** Count of products currently displayed after filtering */
  filteredCount: number;
  /** Total count of products across all categories */
  totalCount: number;
  /** Optional item counts per category for rendering numbers in tabs */
  categoryCounts?: Partial<Record<CategoryFilterValue, number>>;
  /** Optional custom CSS classes for layout adjustment */
  className?: string;
}
```

### 3.2 Category Filter Tabs Architecture
The 4 category tabs and their exact values:

| Tab ID | Display Label | Short Label (Mobile) | Target Category | Semantic Purpose |
|---|---|---|---|---|
| `all` | **ALL PIECES** | ALL | `'all'` | Complete 12-item curated wardrobe |
| `outerwear` | **OUTERWEAR** | OUTERWEAR | `'outerwear'` | Trench coats, cashmere blazers, technical parkas, shearling |
| `essentials` | **ESSENTIALS** | ESSENTIALS | `'essentials'` | Merino knits, pleated trousers, organic tees, poplin shirts |
| `summer-drop` | **SUMMER DROP** | SUMMER | `'summer-drop'` | Raw silk shirts, linen culottes, slip dresses, raffia totes |

#### Visual Styling Specifications:
- **Geometry**: Strict 0px border radius (`rounded-none`).
- **Base Typography**: Hanken Grotesk sans-serif, `text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em]`.
- **Inactive Tab State**:
  - Color: Slate Grey `text-[#707070]` or `text-[#0D0D0D]/60`.
  - Hover: Shifts smoothly to `hover:text-[#0D0D0D]` with a subtle background hover highlight `hover:bg-[#F5F5F3]`.
- **Active Tab State**:
  - Text: Solid Obsidian `text-[#0D0D0D]` with elevated font weight (`font-semibold`).
  - Indicator: Pale Gold `#D4AF37` solid 2px bottom bar (`h-[2px] bg-[#D4AF37]`) spanning the exact width of the tab button.
  - Active background: Flat transparent canvas.
- **Category Counts Inside Tabs**:
  - When `categoryCounts` is supplied, render a subtle count next to the label:
    `<span className="ml-1.5 text-[10px] tracking-normal font-normal text-[#707070]">({count})</span>`
- **Responsive Overflow**:
  - On desktop (>=1024px): Left-aligned inline-flex tab group with `gap-8`.
  - On mobile (<768px): Horizontally scrollable row with `overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory flex-nowrap`. Touch targets are padded to minimum 44px height for touch compliance.

### 3.3 Sort Dropdown Architecture
The sort selector provides rapid ordering across the luxury inventory:

| Value | Display Label | Sorting Algorithm Description |
|---|---|---|
| `featured` | **Featured** | Default editorial curation: items with `featured: true` first, preserving master index order. |
| `price-asc` | **Price: Low to High** | Numeric comparison: `a.price - b.price`. Lowest price garments appear first. |
| `price-desc` | **Price: High to Low** | Numeric comparison: `b.price - a.price`. Haute craftsmanship pieces appear first. |
| `newest` | **New Arrivals** | Priority given to items with `badge === 'NEW ARRIVAL'` or `badge === 'NEW'`. |

#### Dual-Layer Sort Selector (Luxury Custom UI + Robust Accessible Native Control):
To achieve both visual luxury and reliable automated testing in JSDOM:
- The outer presentation features a sharp 0px Obsidian border container (`border border-[#0D0D0D] bg-[#FFFFFF] px-3.5 py-2`).
- An architectural Lucide icon (`SlidersHorizontal` or `ArrowUpDown`, 14x14px) and subtle label `SORT:` (`text-[10px] tracking-[0.18em] text-[#707070]`) anchor the left side.
- Inside sits an accessible, transparent native `<select>` with `data-testid="sort-select"`, styled with `appearance-none bg-transparent pr-6 text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#0D0D0D] cursor-pointer focus:outline-none`.
- A crisp Lucide `ChevronDown` icon (14x14px, pointer-events-none) anchors the right edge.
- **Testing Benefit**: Automated Vitest test suites can use standard `fireEvent.change(screen.getByTestId('sort-select'), { target: { value: 'price-asc' } })` without triggering simulated popup z-index or pointer-event issues.
- **Mobile Benefit**: Native mobile pickers (iOS scroll wheel / Android bottom modal) trigger natively for optimal mobile ergonomics.

### 3.4 Edition Item Count Readout
- Format: `SHOWING {filteredCount} OF {totalCount} EDITIONS`
- Example: `SHOWING 12 OF 12 EDITIONS` (when 'All Pieces' is active)
- Example: `SHOWING 4 OF 12 EDITIONS` (when 'Outerwear' is active)
- Typography: `text-[11px] font-sans uppercase tracking-[0.2em] text-[#707070]` with numeric values highlighted:
  `<span className="font-semibold text-[#0D0D0D]">{filteredCount}</span> OF <span className="font-semibold text-[#0D0D0D]">{totalCount}</span> EDITIONS`
- Accessibility: Wrapped in an ARIA live region (`role="status" aria-live="polite" aria-atomic="true" data-testid="item-count-readout"`) so assistive technologies vocalize inventory counts as filters change.

---

## 4. Accessibility & WAI-ARIA Specification

### 4.1 WAI-ARIA Tabs Pattern
The filter tab group implements the official W3C WAI-ARIA Tabs Design Pattern:
1. **Container**:
   - `role="tablist"`
   - `aria-label="Filter product catalog by category"`
2. **Each Tab**:
   - `role="tab"`
   - `id={`category-tab-${item.id}`}`
   - `aria-selected={activeCategory === item.id}`
   - `aria-controls="catalog-product-grid"`
   - `tabIndex={activeCategory === item.id ? 0 : -1}` (Roving Tabindex)
   - `data-testid={`category-tab-${item.id}`}`

### 4.2 Keyboard Navigation (Roving Tabindex)
Users can navigate the tablist without a mouse:
- **`ArrowRight`**: Shifts focus to the next tab (cycles from Summer Drop back to All Pieces).
- **`ArrowLeft`**: Shifts focus to the previous tab (cycles from All Pieces to Summer Drop).
- **`Home`**: Shifts focus immediately to the first tab (`All Pieces`).
- **`End`**: Shifts focus immediately to the last tab (`Summer Drop`).
- **`Enter` / `Space`**: Activates the currently focused tab and updates `activeCategory`.
- **`Tab`**: Exits the tablist and moves focus to the Sort dropdown.

### 4.3 Screen Reader Announcements
- When active category changes: Screen readers announce the newly selected tab and the live region updates the item count readout.
- Zero accessibility violations: High-contrast ratios (>7:1 for Obsidian text on Cloud White, >4.5:1 for Slate Grey text).

---

## 5. State Architecture & Pure Sorting/Filtering Algorithms

### 5.1 Pure Filtering & Sorting Helper (`filterAndSortProducts`)
Worker M2 can implement or utilize this pure utility function:

```typescript
import { Product } from '../../types/product';
import { CategoryFilterValue, SortOption } from './CategoryFilter';

export function filterAndSortProducts(
  products: Product[],
  category: CategoryFilterValue,
  sort: SortOption
): Product[] {
  // Step 1: Category Filtering
  let result = products;
  if (category !== 'all') {
    result = result.filter((product) => product.category === category);
  }

  // Step 2: Immutably Sort Products
  return [...result].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;

      case 'price-desc':
        return b.price - a.price;

      case 'newest': {
        const aIsNew = a.badge === 'NEW ARRIVAL' || a.badge === 'NEW' ? 1 : 0;
        const bIsNew = b.badge === 'NEW ARRIVAL' || b.badge === 'NEW' ? 1 : 0;
        if (bIsNew !== aIsNew) {
          return bIsNew - aIsNew;
        }
        return 0;
      }

      case 'featured':
      default: {
        const aFeat = a.featured ? 1 : 0;
        const bFeat = b.featured ? 1 : 0;
        if (bFeat !== aFeat) {
          return bFeat - aFeat;
        }
        return 0; // maintain curated array order
      }
    }
  });
}
```

### 5.2 Deep-Link & URL Hash Synchronization
To support shareable links and browser back/forward navigation without requiring a heavy routing framework:
1. **On Mount**: Check `window.location.hash` or search params:
   - If `#outerwear`, `#essentials`, or `#summer-drop` is present, set initial `activeCategory` accordingly.
2. **On Tab Selection**:
   - Update state: `setActiveCategory(cat)`.
   - Update URL: `history.replaceState(null, '', `#${cat === 'all' ? 'catalog' : cat}`)`.
   - Smoothly scroll to `#catalog` if called from outside the catalog section (e.g. from Hero CTA or Navbar).
3. **On `hashchange` Event**:
   - If user hits browser Back button, synchronize state:
     ```typescript
     useEffect(() => {
       const handleHash = () => {
         const hash = window.location.hash.replace(/^#/, '');
         const valid: CategoryFilterValue[] = ['all', 'outerwear', 'essentials', 'summer-drop'];
         if (valid.includes(hash as CategoryFilterValue)) {
           setActiveCategory(hash as CategoryFilterValue);
         }
       };
       window.addEventListener('hashchange', handleHash);
       return () => window.removeEventListener('hashchange', handleHash);
     }, []);
     ```

---

## 6. Complete Reference Implementation: `CategoryFilter.tsx`

Below is the production-ready code for `src/components/catalog/CategoryFilter.tsx`:

```tsx
import React, { useRef } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Category } from '../../types/product';

export type CategoryFilterValue = 'all' | Category;
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export interface CategoryTabItem {
  id: CategoryFilterValue;
  label: string;
  ariaLabel: string;
}

export const CATEGORY_TABS: CategoryTabItem[] = [
  { id: 'all', label: 'ALL PIECES', ariaLabel: 'All collections and pieces' },
  { id: 'outerwear', label: 'OUTERWEAR', ariaLabel: 'Outerwear coats, jackets, and parkas' },
  { id: 'essentials', label: 'ESSENTIALS', ariaLabel: 'Essential knitwear, trousers, and shirting' },
  { id: 'summer-drop', label: 'SUMMER DROP', ariaLabel: 'Summer drop silks, linen, and drapery' },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'New Arrivals' },
];

export interface CategoryFilterProps {
  activeCategory: CategoryFilterValue;
  onSelectCategory: (category: CategoryFilterValue) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filteredCount: number;
  totalCount: number;
  categoryCounts?: Partial<Record<CategoryFilterValue, number>>;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  currentSort,
  onSortChange,
  filteredCount,
  totalCount,
  categoryCounts,
  className = '',
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation for ARIA Tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    const count = CATEGORY_TABS.length;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % count;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + count) % count;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = count - 1;
    } else {
      return;
    }

    tabRefs.current[nextIndex]?.focus();
    onSelectCategory(CATEGORY_TABS[nextIndex].id);
  };

  return (
    <div
      data-testid="category-filter-container"
      className={`w-full border-b border-[#E5E5E5] bg-[#FBF9F9] transition-colors duration-200 ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 py-4 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
        {/* 1. Accessible WAI-ARIA Tablist */}
        <div
          role="tablist"
          aria-label="Filter product catalog by category"
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x py-1 -mx-2 px-2"
        >
          {CATEGORY_TABS.map((tab, idx) => {
            const isActive = activeCategory === tab.id;
            const count = categoryCounts?.[tab.id];

            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[idx] = el)}
                role="tab"
                id={`category-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="catalog-product-grid"
                aria-label={tab.ariaLabel}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectCategory(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                data-testid={`category-tab-${tab.id}`}
                className={`font-sans text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] relative py-2.5 px-1 transition-all duration-200 rounded-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#0D0D0D] whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#0D0D0D] font-semibold'
                    : 'text-[#707070] hover:text-[#0D0D0D]'
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && (
                  <span className="ml-1.5 text-[10px] tracking-normal font-normal text-[#707070]">
                    ({count})
                  </span>
                )}
                {/* Sharp Pale Gold Active Indicator */}
                {isActive && (
                  <span
                    data-testid="active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37] transition-all duration-300 pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Middle: Live Status Item Count Readout */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="item-count-readout"
          className="hidden lg:block text-center font-sans text-[11px] uppercase tracking-[0.2em] text-[#707070] select-none"
        >
          SHOWING{' '}
          <span className="font-semibold text-[#0D0D0D]">{filteredCount}</span> OF{' '}
          <span className="font-semibold text-[#0D0D0D]">{totalCount}</span> EDITIONS
        </div>

        {/* 3. Right: Luxury Sort Selector */}
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
          {/* Mobile item count readout (visible only on small screens) */}
          <div
            role="status"
            aria-live="polite"
            className="lg:hidden font-sans text-[10px] uppercase tracking-[0.18em] text-[#707070]"
          >
            <span className="font-semibold text-[#0D0D0D]">{filteredCount}</span> OF{' '}
            <span className="font-semibold text-[#0D0D0D]">{totalCount}</span>
          </div>

          <div className="relative inline-flex items-center border border-[#0D0D0D] bg-[#FFFFFF] px-3.5 py-2 rounded-none transition-colors hover:border-[#D4AF37] focus-within:border-[#D4AF37]">
            <SlidersHorizontal
              className="w-3.5 h-3.5 text-[#0D0D0D] mr-2 shrink-0 stroke-[1.5]"
              aria-hidden="true"
            />
            <label
              htmlFor="catalog-sort-select"
              className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#707070] mr-1.5 shrink-0 select-none"
            >
              SORT:
            </label>
            <select
              id="catalog-sort-select"
              data-testid="sort-select"
              aria-label="Sort product catalog"
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-transparent pr-6 text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#0D0D0D] cursor-pointer focus:outline-none rounded-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 text-[#0D0D0D] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 stroke-[1.5]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
```

---

## 7. Component Test Suite Specification

The following automated tests must be executed by Worker M2 and verified in Milestone 5:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryFilter } from '../components/catalog/CategoryFilter';

describe('CategoryFilter Component', () => {
  it('renders all 4 category tabs with correct labels', () => {
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

    expect(screen.getByTestId('category-tab-all')).toHaveTextContent(/all pieces/i);
    expect(screen.getByTestId('category-tab-outerwear')).toHaveTextContent(/outerwear/i);
    expect(screen.getByTestId('category-tab-essentials')).toHaveTextContent(/essentials/i);
    expect(screen.getByTestId('category-tab-summer-drop')).toHaveTextContent(/summer drop/i);
  });

  it('indicates active tab with aria-selected, bold text, and gold bottom indicator', () => {
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

    const activeTab = screen.getByTestId('category-tab-outerwear');
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveAttribute('tabindex', '0');
    expect(activeTab).toHaveClass('text-[#0D0D0D]');

    const inactiveTab = screen.getByTestId('category-tab-all');
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    expect(inactiveTab).toHaveAttribute('tabindex', '-1');
    expect(inactiveTab).toHaveClass('text-[#707070]');

    const indicator = screen.getByTestId('active-tab-indicator');
    expect(indicator).toHaveClass('bg-[#D4AF37]');
  });

  it('calls onSelectCategory when a tab is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <CategoryFilter
        activeCategory="all"
        onSelectCategory={handleSelect}
        currentSort="featured"
        onSortChange={vi.fn()}
        filteredCount={12}
        totalCount={12}
      />
    );

    fireEvent.click(screen.getByTestId('category-tab-essentials'));
    expect(handleSelect).toHaveBeenCalledWith('essentials');
  });

  it('supports roving tabindex and arrow key navigation', () => {
    const handleSelect = vi.fn();
    render(
      <CategoryFilter
        activeCategory="all"
        onSelectCategory={handleSelect}
        currentSort="featured"
        onSortChange={handleSelect}
        filteredCount={12}
        totalCount={12}
      />
    );

    const firstTab = screen.getByTestId('category-tab-all');
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(handleSelect).toHaveBeenCalledWith('outerwear');
  });

  it('renders sort dropdown with 4 options and triggers onSortChange', () => {
    const handleSort = vi.fn();
    render(
      <CategoryFilter
        activeCategory="all"
        onSelectCategory={vi.fn()}
        currentSort="featured"
        onSortChange={handleSort}
        filteredCount={12}
        totalCount={12}
      />
    );

    const sortSelect = screen.getByTestId('sort-select');
    expect(sortSelect).toHaveValue('featured');

    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
    expect(handleSort).toHaveBeenCalledWith('price-asc');
  });

  it('displays accurate edition readout in polite live region', () => {
    render(
      <CategoryFilter
        activeCategory="summer-drop"
        onSelectCategory={vi.fn()}
        currentSort="featured"
        onSortChange={vi.fn()}
        filteredCount={4}
        totalCount={12}
      />
    );

    const readout = screen.getByTestId('item-count-readout');
    expect(readout).toHaveTextContent('SHOWING 4 OF 12 EDITIONS');
    expect(readout).toHaveAttribute('aria-live', 'polite');
  });
});
```

---

## 8. Guidance for Worker M2

1. **File Placement**:
   Place the implementation in `src/components/catalog/CategoryFilter.tsx`.
2. **Export Strategy**:
   Export both named (`export const CategoryFilter`) and default (`export default CategoryFilter`), and export types `CategoryFilterValue`, `SortOption`, and constants `CATEGORY_TABS`, `SORT_OPTIONS`.
3. **Integration in `src/App.tsx`**:
   - Replace the Milestone 1 placeholder at `#catalog`.
   - Add `currentSort` state (`useState<SortOption>('featured')`).
   - Compute filtered and sorted items with `filterAndSortProducts`.
   - Render `CategoryFilter` passing `activeCategory`, `setActiveCategory`, `currentSort`, `setSort`, `filteredCount={filteredItems.length}`, `totalCount={PRODUCTS.length}`.
   - Pass filtered and sorted items to `ProductGrid`.
4. **Verification**:
   Execute `npm test` and `npm run build` to ensure zero TypeScript errors, zero CSS warnings, and 100% test pass.
