'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, ShieldAlert, Search } from 'lucide-react';

export type NavCategory = 'all' | 'outerwear' | 'essentials' | 'summer-drop';

export interface NavbarProps {
  activeCategory?: NavCategory;
  onSelectCategory?: (category: NavCategory) => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onOpenAdmin?: () => void;
  onOpenSearch?: () => void;
}

interface NavItem {
  label: string;
  category?: NavCategory;
  targetId?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'COLLECTIONS', category: 'all', targetId: 'catalog' },
  { label: 'OUTERWEAR', category: 'outerwear', targetId: 'catalog' },
  { label: 'ESSENTIALS', category: 'essentials', targetId: 'catalog' },
  { label: 'SUMMER DROP', category: 'summer-drop', targetId: 'catalog' },
  { label: 'BRAND STORY', targetId: 'story' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory = 'all',
  onSelectCategory,
  onOpenCart,
  cartCount,
  onOpenMobileMenu,
  isMobileMenuOpen = false,
  onOpenAdmin,
  onOpenSearch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (item: NavItem) => {
    if (item.category && onSelectCategory) {
      onSelectCategory(item.category);
    }
    if (item.targetId) {
      const el = document.getElementById(item.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleWordmarkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      role="banner"
      className={`sticky top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-[#FBF9F9]/95 backdrop-blur-md border-b border-[#E5E5E5] py-3.5 md:py-4 shadow-none'
          : 'bg-[#FBF9F9]/80 backdrop-blur-md border-b border-transparent py-5 md:py-6 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Mobile Left: Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer"
            aria-label="Open mobile navigation menu"
            aria-expanded={isMobileMenuOpen}
            data-testid="mobile-menu-trigger"
          >
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Desktop Left: Navigation Links */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className="hidden md:flex items-center space-x-6 lg:space-x-8"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.category
              ? activeCategory === item.category
              : false;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleLinkClick(item)}
                className={`font-sans text-[11px] font-medium tracking-[0.2em] transition-colors py-1 relative cursor-pointer ${
                  isActive
                    ? 'text-[#0D0D0D]'
                    : 'text-[#0D0D0D]/70 hover:text-[#0D0D0D]'
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Center: Bodoni Moda Wordmark */}
        <div className="flex-1 md:flex-initial text-center">
          <button
            type="button"
            onClick={handleWordmarkClick}
            className="font-serif font-medium text-xl lg:text-2xl tracking-[0.25em] text-[#0D0D0D] uppercase select-none hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
            data-testid="brand-wordmark"
          >
            AURA APPAREL
          </button>
        </div>

        {/* Right: Atelier Executive Admin & Cart Trigger */}
        <div className="flex items-center justify-end space-x-3 sm:space-x-4">
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 border border-[#E5E5E5] hover:border-[#0D0D0D] bg-white text-[#0D0D0D] hover:text-[#D4AF37] text-[10px] font-sans font-semibold uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5 cursor-pointer rounded-none"
              aria-label="Open Atelier Admin Panel"
              data-testid="admin-trigger"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Atelier Hub</span>
            </button>
          )}

          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
              aria-label="Search archive catalog"
              data-testid="search-trigger"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 -mr-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors flex items-center justify-center cursor-pointer focus:outline-none"
            aria-label={`Shopping bag, ${cartCount} items`}
            data-testid="cart-trigger"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <>
                <span
                  data-testid="cart-badge"
                  className="absolute -top-1 -right-1 bg-[#0D0D0D] text-[#FBF9F9] text-[10px] font-sans font-medium px-1.5 min-w-[18px] h-[18px] flex items-center justify-center border border-[#E5E5E5] rounded-none"
                >
                  <span data-testid="cart-count-badge">{cartCount}</span>
                </span>
                <span
                  data-testid="cart-gold-dot"
                  className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] ring-2 ring-[#FBF9F9] rounded-full"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
