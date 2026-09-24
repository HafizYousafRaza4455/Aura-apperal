'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { Product } from '@/types/product';

export interface SearchFacets {
  categories: Record<string, number>;
  priceRanges: {
    under500: number;
    '500to1000': number;
    '1000to2000': number;
    over2000: number;
  };
  inStockCount: number;
}

export interface SearchResponse {
  results: Product[];
  total: number;
  facets: SearchFacets;
  executionTimeMs: number;
  isCached: boolean;
}

export interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  currency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const SearchPalette: React.FC<SearchPaletteProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  currency = 'USD',
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [results, setResults] = useState<Product[]>([]);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Perform search with debounce via REST API
  const runSearch = useCallback(async (q: string, cat: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat !== 'all') params.set('category', cat);
      params.set('limit', '8');

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const resp: SearchResponse = await res.json();
        setResults(resp.results || []);
        setFacets(resp.facets || null);
        setSelectedIndex(0);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveCategory('all');
      return;
    }

    // Auto-focus input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    runSearch('', 'all');

    return () => clearTimeout(timer);
  }, [isOpen, runSearch]);

  // Debounced search on input change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      runSearch(query, activeCategory);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, activeCategory, isOpen, runSearch]);

  // Global Keyboard shortcuts: ⌘K or Ctrl+K to toggle, ESC to close, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      } else if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault();
          onSelectProduct(results[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectProduct, results, selectedIndex]);

  if (!mounted || typeof document === 'undefined' || !isOpen) {
    return null;
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product Search Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Palette Card */}
      <div className="relative w-full max-w-2xl bg-[#111111] border border-[#2A2A2A] shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#222222] bg-[#141414]">
          <Search className="w-4 h-4 text-[#D4AF37] shrink-0 mr-3" />
          <input
            ref={inputRef}
            id="catalog-search-input"
            name="search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search silhouettes, virgin wool, silk, outerwear..."
            aria-label="Search catalog"
            className="w-full bg-transparent text-sm text-[#FBF9F9] placeholder-[#555555] outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#707070] hover:text-[#FBF9F9] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#555555] border border-[#2B2B2B] px-1.5 py-0.5 ml-2">
            ESC
          </span>
        </div>

        {/* Category Facet Tabs */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0D0D0D] border-b border-[#1F1F1F] overflow-x-auto text-[11px] font-mono uppercase tracking-wider">
          {['all', 'outerwear', 'essentials', 'summer-drop'].map((cat) => {
            const count =
              cat === 'all'
                ? results.length
                : facets?.categories[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 transition-colors cursor-pointer border ${
                  activeCategory === cat
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5'
                    : 'border-transparent text-[#707070] hover:text-[#FBF9F9]'
                }`}
              >
                {cat.replace('-', ' ')}
                <span className="text-[9px] text-[#555555] ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#1B1B1B]">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#707070] tracking-[0.2em] uppercase">
              Searching Atelier Archives...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <p className="text-sm font-serif text-[#A3A3A3]">No exact archive matches for &quot;{query}&quot;</p>
              <p className="text-xs text-[#555555]">
                Try exploring &quot;cashmere&quot;, &quot;trench&quot;, or &quot;silk evening shirt&quot;.
              </p>
            </div>
          ) : (
            results.map((product, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1C1C1C]' : 'hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-12 bg-[#222222] shrink-0 overflow-hidden border border-[#2B2B2B]">
                      {product.colors[0]?.image && (
                        <img
                          src={product.colors[0].image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif text-[#FBF9F9] truncate font-medium">
                          {product.title}
                        </span>
                        {product.badge && (
                          <span className="text-[8px] tracking-widest uppercase bg-[#222222] text-[#D4AF37] px-1.5 py-0.5 border border-[#D4AF37]/30">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#707070] truncate mt-0.5">
                        {product.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs font-mono text-[#D4AF37]">
                      {symbol}
                      {product.price.toLocaleString()}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-[#D4AF37] translate-x-0.5' : 'text-[#444444]'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#0D0D0D] border-t border-[#1C1C1C] flex items-center justify-between text-[10px] text-[#555555] font-mono">
          <div className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#D4AF37]">
            <Sparkles className="w-3 h-3" />
            <span className="uppercase tracking-widest text-[9px]">Aura Atelier Index</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
