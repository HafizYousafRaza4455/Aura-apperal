'use client';

import React, { useRef } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { FilterCategory, SortOption } from '../../types/product';

export type CategoryFilterValue = FilterCategory;
export type { SortOption };

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
  /** The currently active category tab */
  activeCategory: CategoryFilterValue;
  /** Callback fired when a category tab is clicked or activated via keyboard */
  onSelectCategory: (category: CategoryFilterValue) => void;
  /** The currently selected sort option (supports currentSort or sortBy alias) */
  currentSort?: SortOption;
  sortBy?: SortOption;
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

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  currentSort,
  sortBy,
  onSortChange,
  filteredCount,
  totalCount,
  categoryCounts,
  className = '',
}) => {
  const activeSort = currentSort || sortBy || 'featured';
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
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
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
          <span className="sr-only"> ({activeCategory})</span>
        </div>

        {/* 3. Right: Luxury Sort Selector & Mobile Count */}
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
          {/* Mobile item count readout */}
          <div
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
              value={activeSort}
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
              className="w-3.5 h-3.5 text-[#0D0D0D] absolute right-2.5 pointer-events-none stroke-[1.5]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
