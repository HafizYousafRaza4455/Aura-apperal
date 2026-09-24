'use client';

import React, { useEffect } from 'react';
import { X, ChevronRight, ShoppingBag, ShieldAlert } from 'lucide-react';
import { NavCategory } from './Navbar';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: NavCategory;
  onSelectCategory?: (category: NavCategory) => void;
  onOpenCart?: () => void;
  cartCount?: number;
  currentCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
  onCurrencyChange?: (currency: 'USD' | 'EUR' | 'GBP' | 'JPY') => void;
  onOpenAdmin?: () => void;
}

const DRAWER_ITEMS = [
  { label: 'ALL COLLECTIONS', category: 'all' as NavCategory, targetId: 'catalog' },
  { label: 'OUTERWEAR', category: 'outerwear' as NavCategory, targetId: 'catalog' },
  { label: 'ESSENTIALS', category: 'essentials' as NavCategory, targetId: 'catalog' },
  { label: 'SUMMER DROP', category: 'summer-drop' as NavCategory, targetId: 'catalog' },
  { label: 'BRAND STORY', targetId: 'story' },
];

const CURRENCIES: Array<'USD' | 'EUR' | 'GBP' | 'JPY'> = ['USD', 'EUR', 'GBP', 'JPY'];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeCategory = 'all',
  onSelectCategory,
  onOpenCart,
  cartCount = 0,
  currentCurrency = 'USD',
  onCurrencyChange,
  onOpenAdmin,
}) => {
  // ESC key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = (category?: NavCategory, targetId?: string) => {
    if (category && onSelectCategory) {
      onSelectCategory(category);
    }
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    onClose();
  };

  const handleBagClick = () => {
    onClose();
    if (onOpenCart) {
      onOpenCart();
    }
  };

  return (
    <div
      role={isOpen ? 'dialog' : undefined}
      aria-modal={isOpen ? 'true' : undefined}
      aria-label="Mobile Navigation Menu"
      data-testid="mobile-drawer-container"
      className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
    >
      {/* Dimmed backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        data-testid="mobile-drawer-backdrop"
      />

      {/* Slide-out drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-[360px] h-[100dvh] bg-[#FBF9F9] border-r border-[#E5E5E5] flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5]">
          <span className="font-serif text-lg tracking-[0.2em] text-[#0D0D0D] uppercase font-medium">
            AURA APPAREL
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer"
            aria-label="Close navigation menu"
            data-testid="mobile-drawer-close"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <nav className="space-y-1">
            {DRAWER_ITEMS.map((item) => {
              const isActive = item.category ? activeCategory === item.category : false;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleLinkClick(item.category, item.targetId)}
                  className={`w-full text-left py-4 flex items-center justify-between border-b border-[#E5E5E5]/60 group transition-colors cursor-pointer ${
                    isActive ? 'text-[#D4AF37]' : 'text-[#0D0D0D] hover:text-[#D4AF37]'
                  }`}
                  data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="font-serif text-xl tracking-[0.1em]">
                    {item.label}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#0D0D0D]/40 group-hover:text-[#D4AF37]'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Quick Bag Button */}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleBagClick}
              className="w-full bg-[#0D0D0D] text-[#FBF9F9] hover:bg-[#262626] font-sans text-xs uppercase tracking-[0.2em] py-3.5 px-4 flex items-center justify-center gap-3 transition-colors rounded-none cursor-pointer"
              data-testid="mobile-drawer-cart-btn"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span suppressHydrationWarning>VIEW SHOPPING BAG ({cartCount})</span>
              {cartCount > 0 && (
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              )}
            </button>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full bg-white border border-[#E5E5E5] hover:border-[#0D0D0D] text-[#0D0D0D] font-sans text-xs uppercase tracking-[0.2em] py-3 px-4 flex items-center justify-center gap-2 transition-colors rounded-none cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                <span>ATELIER ADMIN HUB</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-[#E5E5E5] bg-[#F5F4F0]/60 space-y-4">
          {/* Mobile Currency Bar */}
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#707070] block mb-2">
              Currency
            </span>
            <div className="grid grid-cols-4 gap-1">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => onCurrencyChange?.(curr)}
                  className={`py-1.5 text-xs font-mono border rounded-none transition-colors cursor-pointer ${
                    currentCurrency === curr
                      ? 'bg-[#0D0D0D] text-[#D4AF37] border-[#0D0D0D]'
                      : 'bg-white text-[#707070] border-[#E5E5E5] hover:border-[#0D0D0D]'
                  }`}
                  data-testid={`mobile-currency-${curr}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <p className="font-serif italic text-xs text-[#707070]">
            Architectural silhouettes crafted for permanence.
          </p>
          <p className="text-[10px] tracking-[0.25em] text-[#707070] uppercase">
            MILAN • TOKYO • NEW YORK
          </p>
        </div>
      </div>
    </div>
  );
};
