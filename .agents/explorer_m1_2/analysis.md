# Navigation & Footer Architecture Specification

**Project**: Aura Apparel — Luxury Minimalist Web Storefront  
**Author**: Explorer M1.2 (`explorer_m1_2`)  
**Scope**: Navigation, Mobile Drawer & Footer Architecture (Milestone 1)  
**Target Path**: `src/components/layout/Navbar.tsx`, `src/components/layout/MobileDrawer.tsx`, `src/components/layout/Footer.tsx`  
**Date**: 2026-09-03  
**Status**: Comprehensive Specification & Implementation Blueprint  

---

## 1. Executive Summary

This specification defines the architectural, visual, interaction, and accessibility contracts for the foundational layout shell of **Aura Apparel**:
1. **`Navbar.tsx`**: A responsive, fixed/sticky editorial header with dynamic scroll transitions, prominent Bodoni Moda brand wordmark, category navigation links, mobile hamburger trigger, and shopping bag trigger with live item count and a Pale Gold (`#D4AF37`) status indicator dot.
2. **`MobileDrawer.tsx`**: An off-canvas mobile navigation drawer optimized for viewports `<768px`, featuring smooth slide-and-fade kinematics, touch-friendly navigation items with chevron cues, backdrop dismissal, Escape-key handling, body scroll locking, and an integrated currency switcher.
3. **`Footer.tsx`**: An editorial grounded footer rendered in deep Obsidian (`#0D0D0D`) with sharp 0px geometry, featuring "The Atelier Dispatch" newsletter with RFC-compliant regex email validation, error feedback, luxury confirmation state, a 4-column directory index, and an interactive 4-currency selector (`USD`, `EUR`, `GBP`, `JPY`).

All components adhere strictly to the luxury minimalist design tokens established in `ORIGINAL_REQUEST.md` (R3) and `PROJECT.md`:
- **Colors**: Obsidian `#0D0D0D`, Pale Gold `#D4AF37`, Cloud White `#FBF9F9`, Muted Grey `#707070`, Border `#E5E5E5` (light) / `#262626` (dark).
- **Typography**: Display Serif `Bodoni Moda` (weights 400, 500), Body Sans `Hanken Grotesk` (weights 400, 500, 600).
- **Geometry**: Razor-sharp **0px border radius** (`rounded-none`).
- **Elevation**: Flat planar aesthetic with **0px drop shadows** (`shadow-none`), depth articulated solely through 1px hairline borders.

---

## 2. Design Token Integration & CSS Utility Reference

Components will utilize the Tailwind CSS v4 `@theme` tokens declared in `src/index.css`:

```css
@theme {
  --color-obsidian: #0D0D0D;
  --color-pale-gold: #D4AF37;
  --color-cloud-white: #FBF9F9;
  --color-surface-white: #FFFFFF;
  --color-slate-muted: #707070;
  --color-border-light: #E5E5E5;
  --color-border-dark: #262626;

  --font-serif: "Bodoni Moda", Georgia, serif;
  --font-sans: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

### Visual Token Matrix for Layout Components

| Element | Background | Text / Icon Color | Border / Accent | Typography | Geometry |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Navbar (Top)** | `#FBF9F9`/80 (backdrop-blur) | `#0D0D0D` | Border-transparent | `Bodoni Moda` (wordmark) / `Hanken Grotesk` (links) | 0px |
| **Navbar (Scrolled)** | `#FBF9F9`/95 (backdrop-blur) | `#0D0D0D` | `border-b border-[#E5E5E5]` | Same | 0px |
| **Wordmark** | Transparent | `#0D0D0D` | N/A | `font-serif text-xl md:text-2xl tracking-[0.25em]` | 0px |
| **Active Nav Link** | Transparent | `#0D0D0D` | `1.5px` Pale Gold bottom bar (`#D4AF37`) | `font-sans text-[11px] tracking-[0.2em] font-medium` | 0px |
| **Cart Badge** | `#0D0D0D` | `#FBF9F9` | `1px border-[#E5E5E5]` | `font-sans text-[10px]` | 0px sharp chip |
| **Pale Gold Dot** | `#D4AF37` | N/A | Ring-2 `#FBF9F9` | N/A | Micro-circle indicator |
| **Mobile Drawer** | `#FBF9F9` | `#0D0D0D` | `border-r border-[#E5E5E5]` | `Bodoni Moda` (headings) / `Hanken Grotesk` | 0px |
| **Drawer Backdrop** | `rgba(0,0,0,0.6)` | N/A | `backdrop-blur-xs` | N/A | 0px |
| **Footer Ground** | `#0D0D0D` | `#FBF9F9` | `border-t border-[#262626]` | `Bodoni Moda` / `Hanken Grotesk` | 0px |
| **Newsletter Input** | `transparent` | `#FBF9F9` | `1px border-[#333333]` (active: `#D4AF37`) | `font-sans text-xs tracking-wider` | 0px sharp |
| **Newsletter Submit** | `#D4AF37` | `#0D0D0D` | Hover: `#C4A030` | `font-sans text-xs uppercase tracking-[0.2em]` | 0px sharp |
| **Currency Selector** | `#1A1A1A` | `#FBF9F9` | `1px border-[#333333]` | `font-sans text-xs` | 0px sharp |

---

## 3. Detailed Component Architecture: `Navbar.tsx`

### 3.1 Responsibilities & Component Interface
The `Navbar` acts as the persistent top-level navigation anchor across the entire storefront application.

```typescript
export type NavCategory = 'all' | 'outerwear' | 'essentials' | 'summer-drop';

export interface NavbarProps {
  /** Active category filter id */
  activeCategory?: NavCategory;
  /** Category selection callback for catalog routing/filtering */
  onSelectCategory?: (category: NavCategory) => void;
  /** Trigger to open the slide-out cart drawer */
  onOpenCart: () => void;
  /** Live item count inside the shopping bag */
  cartCount: number;
  /** Trigger to toggle or open the mobile navigation drawer */
  onOpenMobileMenu?: () => void;
  /** Indicates whether the mobile menu is currently open */
  isMobileMenuOpen?: boolean;
}
```

### 3.2 Layout & Grid Topology (Desktop vs Mobile)

#### Desktop Viewport (`>= 768px` / benchmark `1440px`)
A balanced 3-zone layout creates structural symmetry:
- **Left Zone (40%)**: Desktop navigation link cluster.
  - Links: `COLLECTIONS`, `OUTERWEAR`, `ESSENTIALS`, `SUMMER DROP`, `BRAND STORY`.
  - Spacing: `flex items-center space-x-6 lg:space-x-8`.
  - Typography: `font-sans text-[11px] font-medium tracking-[0.2em] text-[#0D0D0D]/75 hover:text-[#0D0D0D] transition-colors py-1 relative`.
  - Active indicator: A persistent 1.5px Pale Gold (`#D4AF37`) line positioned at `bottom-0 left-0 right-0`.
- **Center Zone (20%)**: Brand Wordmark.
  - Text: **AURA APPAREL** in `font-serif font-medium text-xl lg:text-2xl tracking-[0.25em] text-[#0D0D0D] whitespace-nowrap text-center select-none cursor-pointer`.
  - Interaction: Clicking smoothly scrolls to page top (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
- **Right Zone (40%)**: Utility Actions.
  - Aligned to right: `flex items-center justify-end space-x-6`.
  - Shopping Bag trigger button with live counter badge and Pale Gold indicator dot.

#### Mobile Viewport (`< 768px`)
- **Left**: Mobile menu hamburger button (`Menu` icon from Lucide React, stroke width 1.5, 44x44px touch target).
- **Center**: Brand Wordmark **AURA APPAREL** in `font-serif text-lg tracking-[0.2em]`.
- **Right**: Shopping Bag trigger button with counter badge.

### 3.3 Scroll Detection & Background Elevation Transition
- **Hook / Event**:
  ```typescript
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  ```
- **Styling Transition**:
  - `header` container classes:
    ```tsx
    className={`sticky top-0 left-0 right-0 z-40 w-full transition-all duration-300 ease-out ${
      isScrolled
        ? 'bg-[#FBF9F9]/95 backdrop-blur-md border-b border-[#E5E5E5] py-3.5 md:py-4 shadow-none'
        : 'bg-[#FBF9F9]/80 backdrop-blur-md border-b border-transparent py-5 md:py-6 shadow-none'
    }`}
    ```

### 3.4 Shopping Bag Trigger & Pale Gold Dot Specification
- Features Lucide React `ShoppingBag` icon (size 20, stroke width 1.5).
- If `cartCount > 0`:
  1. Sharp rectangular numeric badge: `absolute -top-1 -right-1.5 bg-[#0D0D0D] text-[#FBF9F9] text-[10px] font-sans font-medium px-1.5 min-w-[18px] h-[18px] flex items-center justify-center border border-[#E5E5E5] rounded-none`.
  2. Micro Pale Gold Indicator Dot: `absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] ring-2 ring-[#FBF9F9] rounded-full`.
- Accessible label: `aria-label={`Shopping bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}`.

### 3.5 Smooth Scroll Navigation Handlers
```typescript
const handleNavClick = (category?: NavCategory, targetId?: string) => {
  if (category && onSelectCategory) {
    onSelectCategory(category);
  }
  if (targetId) {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
};
```

---

## 4. Detailed Component Architecture: `MobileDrawer.tsx`

### 4.1 Responsibilities & Component Interface
The `MobileDrawer` manages off-canvas navigation on viewports `<768px`.

```typescript
export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: NavCategory;
  onSelectCategory?: (category: NavCategory) => void;
  onOpenCart?: () => void;
  cartCount?: number;
  currentCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
  onCurrencyChange?: (currency: 'USD' | 'EUR' | 'GBP' | 'JPY') => void;
}
```

### 4.2 Kinematics & Transition Architecture
- **Backdrop Overlay**:
  - `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out md:hidden`
  - When `isOpen === true`: `opacity-100 pointer-events-auto`
  - When `isOpen === false`: `opacity-0 pointer-events-none`
- **Drawer Panel**:
  - `fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[360px] h-[100dvh] bg-[#FBF9F9] border-r border-[#E5E5E5] flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden`
  - When `isOpen === true`: `translate-x-0`
  - When `isOpen === false`: `-translate-x-full`

### 4.3 Interior Hierarchy & Content Zones
1. **Drawer Header**:
   - Wordmark "AURA APPAREL" in `font-serif text-lg tracking-[0.2em] text-[#0D0D0D]`.
   - Dismissal close button: `X` icon from Lucide React, stroke width 1.5, minimum 44x44px touch area, `aria-label="Close navigation menu"`.
   - 1px divider `border-b border-[#E5E5E5] pb-5 px-6 pt-6`.
2. **Navigation List Zone (`flex-1 overflow-y-auto px-6 py-6`)**:
   - Navigation links rendered with generous touch targets (52px height):
     - `ALL COLLECTIONS`
     - `OUTERWEAR`
     - `ESSENTIALS`
     - `SUMMER DROP`
     - `BRAND STORY`
   - Typography: `font-serif text-2xl tracking-[0.1em] text-[#0D0D0D] hover:text-[#D4AF37] transition-colors py-3.5 border-b border-[#E5E5E5]/50 flex items-center justify-between group`.
   - Active state: `text-[#D4AF37] font-semibold`.
   - Accent cue: Pale Gold `ChevronRight` icon (stroke width 1.5) that nudges right `group-hover:translate-x-1 transition-transform`.
3. **Utility Action Zone**:
   - Direct Cart CTA Button:
     - `w-full bg-[#0D0D0D] text-[#FBF9F9] hover:bg-[#262626] font-sans text-xs uppercase tracking-[0.2em] py-3.5 px-4 flex items-center justify-center gap-3 transition-colors rounded-none mt-4`.
     - Displays `ShoppingBag` icon + `VIEW SHOPPING BAG (${cartCount})`.
4. **Drawer Footer Zone (`p-6 border-t border-[#E5E5E5] bg-[#F5F4F0]/60`)**:
   - Currency switcher segmented bar (`USD | EUR | GBP | JPY`).
   - Atelier Manifesto subcopy: *"Architectural silhouettes woven from rare natural textiles."* (`font-serif italic text-xs text-[#707070]`).
   - Origin marks: `MILAN • TOKYO • NEW YORK` (`text-[10px] tracking-[0.25em] text-[#707070] uppercase mt-2`).

### 4.4 Accessibility & Event Discipline
- **Escape Key Dismissal**:
  ```typescript
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  ```
- **Body Scroll Lock**:
  ```typescript
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
  ```
- **ARIA Semantics**: `role="dialog"`, `aria-modal="true"`, `aria-label="Mobile Navigation"`.

---

## 5. Detailed Component Architecture: `Footer.tsx`

### 5.1 Responsibilities & Component Interface
The `Footer` grounds the storefront experience with brand authority, newsletter acquisition, navigational directory, and multi-currency commerce configuration.

```typescript
export interface FooterProps {
  /** Optional category routing callback */
  onSelectCategory?: (category: NavCategory) => void;
  /** Current active currency code */
  currentCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
  /** Currency update callback */
  onCurrencyChange?: (currency: 'USD' | 'EUR' | 'GBP' | 'JPY') => void;
}
```

### 5.2 Atmospheric Ground & Layout Composition
- Container: `<footer role="contentinfo" className="bg-[#0D0D0D] text-[#FBF9F9] border-t border-[#262626] pt-20 pb-12 px-6 md:px-12 lg:px-16 select-none">`
- Structure:
  1. **Top Tier**: "The Atelier Dispatch" Newsletter Subscription Form with Regex Validation.
  2. **Middle Tier**: 4-Column Directory (Maison, Collections, Concierge, Legal).
  3. **Bottom Tier**: Multi-Currency Selector & Legal Copyright.

---

### 5.3 "The Atelier Dispatch" Newsletter Subscription Architecture

#### 5.3.1 Visual Structure
- Section Title: `THE ATELIER DISPATCH` (`font-serif text-2xl md:text-3xl tracking-[0.15em] text-[#FBF9F9]`).
- Subtitle: *"Enter your email to receive private salon invitations, seasonal lookbook debuts, and archival allocations."* (`font-sans text-xs text-[#A3A3A3] max-w-xl mt-2 tracking-wide leading-relaxed`).
- Geometry: Strict **0px border radius** (`rounded-none`).

#### 5.3.2 Regex Validation Protocol
Email validation is implemented via a strict, RFC-compatible regular expression:
```typescript
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

#### 5.3.3 State Machine & Interaction Flows
```typescript
type SubscriptionStatus = 'idle' | 'invalid' | 'submitting' | 'success';

const [email, setEmail] = useState('');
const [status, setStatus] = useState<SubscriptionStatus>('idle');
const [errorMessage, setErrorMessage] = useState('');

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const trimmed = email.trim();

  if (!trimmed) {
    setStatus('invalid');
    setErrorMessage('Please enter an email address.');
    return;
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    setStatus('invalid');
    setErrorMessage('Please enter a valid email address.');
    return;
  }

  setStatus('submitting');
  // Simulated asynchronous luxury invitation dispatch
  setTimeout(() => {
    setStatus('success');
  }, 400);
};
```

#### 5.3.4 UI Feedback States
1. **Idle State**:
   - Form renders input and submit button side by side on desktop (`flex flex-col sm:flex-row max-w-md w-full mt-6 gap-0`).
   - Input: `flex-1 bg-transparent border border-[#333333] focus:border-[#D4AF37] focus:outline-none text-[#FBF9F9] text-xs tracking-wider px-4 py-3 placeholder:text-[#525252] rounded-none transition-colors`.
   - Submit Button: `bg-[#D4AF37] text-[#0D0D0D] hover:bg-[#C4A030] font-sans text-xs uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors rounded-none whitespace-nowrap cursor-pointer`.
2. **Invalid State**:
   - Input border shifts to `#EF4444`.
   - Inline alert:
     ```tsx
     <p role="alert" data-testid="newsletter-error" className="text-[#EF4444] text-[11px] uppercase tracking-wider mt-2 flex items-center gap-1.5">
       <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" />
       <span>{errorMessage}</span>
     </p>
     ```
3. **Success State (Luxury Confirmation)**:
   - High-fidelity confirmation card with Pale Gold border and translucent background:
     ```tsx
     <div 
       role="status" 
       data-testid="newsletter-success" 
       className="border border-[#D4AF37]/50 bg-[#D4AF37]/5 p-5 mt-6 max-w-md animate-fade-in"
     >
       <div className="flex items-center gap-2 text-[#D4AF37]">
         <Check className="w-4 h-4 stroke-[2]" />
         <span className="font-serif text-sm tracking-[0.15em] font-medium">
           WELCOME TO THE ATELIER
         </span>
       </div>
       <p className="text-xs text-[#A3A3A3] font-sans mt-1.5 leading-relaxed">
         Your private dispatch reservation for <span className="text-[#FBF9F9]">{email}</span> is confirmed. Salon access details will arrive shortly.
       </p>
     </div>
     ```

---

### 5.4 Multi-Column Directory Index Specification

The directory is structured across a responsive 4-column grid (`grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 lg:gap-12 py-16 border-y border-[#262626] mt-16`):

```
+---------------------+---------------------+---------------------+---------------------+
| COLUMN 1: MAISON    | COLUMN 2: ARCHIVE   | COLUMN 3: CONCIERGE | COLUMN 4: GOVERNANCE|
+---------------------+---------------------+---------------------+---------------------+
| Atelier Philosophy  | Outerwear           | White-Glove Shipping| Privacy Policy      |
| Milan Flagship      | Essentials          | 30-Day Returns      | Terms of Service    |
| Tokyo Studio        | Summer Drop         | Bespoke Tailoring   | Carbon Neutrality   |
| Rare Textiles       | Permanent Lookbook  | Garment Care        | Transparency Report |
+---------------------+---------------------+---------------------+---------------------+
```

- Column headers: `font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium`.
- Directory links: `font-sans text-xs text-[#A3A3A3] hover:text-[#FBF9F9] hover:translate-x-0.5 transition-all duration-200 block py-1.5`.
- Category links trigger `onSelectCategory()` and smoothly scroll to `#catalog`.
- Story links smoothly scroll to `#story`.

---

### 5.5 Currency Selector Architecture

#### 5.5.1 Currencies Supported & Conversion Model
```typescript
export interface CurrencyConfig {
  code: 'USD' | 'EUR' | 'GBP' | 'JPY';
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP' },
];
```

#### 5.5.2 Dropdown Interaction & Geometry
- **Trigger Button**:
  - Razor-sharp 0px rectangular selector (`rounded-none`).
  - Container: `flex items-center gap-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#D4AF37] text-[#FBF9F9] text-xs font-sans px-3 py-2 transition-colors cursor-pointer`.
  - Icon: Lucide `Globe` or `ChevronDown` (size 14).
  - ARIA: `aria-haspopup="listbox"`, `aria-expanded={isOpen}`, `aria-label="Select store currency"`.
  - Test ID: `data-testid="currency-selector"`.
- **Dropdown Menu**:
  - Positioned upward or downward (`bottom-full mb-1` in footer):
  - Classes: `absolute bottom-full right-0 mb-1 w-36 bg-[#141414] border border-[#333333] py-1 z-30 shadow-none rounded-none`.
  - Options:
    - Active item: `bg-[#222222] text-[#D4AF37] font-medium`.
    - Inactive items: `text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FBF9F9]`.
    - Test IDs: `data-testid={`currency-option-${code}`}`.
  - Outside click handler to dismiss menu.

---

## 6. Implementation Reference Blueprints

Below are complete, production-ready TypeScript component code references designed for immediate implementation by downstream workers.

### 6.1 `src/components/layout/Navbar.tsx` Blueprint

```tsx
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu } from 'lucide-react';

export type NavCategory = 'all' | 'outerwear' | 'essentials' | 'summer-drop';

export interface NavbarProps {
  activeCategory?: NavCategory;
  onSelectCategory?: (category: NavCategory) => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
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
            className="p-2 -ml-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors focus:outline-none"
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

        {/* Right: Cart Trigger with Live Counter & Pale Gold Indicator */}
        <div className="flex items-center justify-end space-x-4">
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
                  {cartCount}
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
```

---

### 6.2 `src/components/layout/MobileDrawer.tsx` Blueprint

```tsx
import React, { useEffect } from 'react';
import { X, ChevronRight, ShoppingBag } from 'lucide-react';
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
      role="dialog"
      aria-modal="true"
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
            className="p-2 -mr-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors focus:outline-none"
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
          <div className="mt-8">
            <button
              type="button"
              onClick={handleBagClick}
              className="w-full bg-[#0D0D0D] text-[#FBF9F9] hover:bg-[#262626] font-sans text-xs uppercase tracking-[0.2em] py-3.5 px-4 flex items-center justify-center gap-3 transition-colors rounded-none cursor-pointer"
              data-testid="mobile-drawer-cart-btn"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>VIEW SHOPPING BAG ({cartCount})</span>
              {cartCount > 0 && (
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              )}
            </button>
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
                  className={`py-1.5 text-xs font-mono border rounded-none transition-colors ${
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
```

---

### 6.3 `src/components/layout/Footer.tsx` Blueprint

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { NavCategory } from './Navbar';

export interface FooterProps {
  onSelectCategory?: (category: NavCategory) => void;
  currentCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
  onCurrencyChange?: (currency: 'USD' | 'EUR' | 'GBP' | 'JPY') => void;
}

export interface CurrencyConfig {
  code: 'USD' | 'EUR' | 'GBP' | 'JPY';
  symbol: string;
  label: string;
}

const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  currentCurrency = 'USD',
  onCurrencyChange,
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'submitting' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Close currency menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus('invalid');
      setErrorMessage('Please enter an email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus('invalid');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 300);
  };

  const handleCategoryClick = (category: NavCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStoryClick = () => {
    const el = document.getElementById('story');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedCurrencyConfig =
    CURRENCIES.find((c) => c.code === currentCurrency) || CURRENCIES[0];

  return (
    <footer
      role="contentinfo"
      className="bg-[#0D0D0D] text-[#FBF9F9] border-t border-[#262626] pt-20 pb-12 px-6 md:px-12 lg:px-16 select-none"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Tier: Newsletter Subscription */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-16 border-b border-[#262626]">
          <div className="max-w-xl">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D4AF37] block mb-3 font-semibold">
              The Aura Dispatch
            </span>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-[#FBF9F9] font-normal">
              JOIN THE ATELIER
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-3 font-sans leading-relaxed">
              Enter your email to receive private salon invitations, seasonal lookbook debuts, and archival allocations.
            </p>
          </div>

          <div className="w-full max-w-md">
            {status === 'success' ? (
              <div
                role="status"
                data-testid="newsletter-success"
                className="border border-[#D4AF37]/50 bg-[#D4AF37]/5 p-4 rounded-none"
              >
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Check className="w-4 h-4 stroke-[2]" />
                  <span className="font-serif text-sm tracking-[0.15em] font-medium">
                    WELCOME TO THE ATELIER
                  </span>
                </div>
                <p className="text-xs text-[#A3A3A3] font-sans mt-1">
                  Confirmation dispatched to <span className="text-white">{email}</span>. Check your inbox for private access.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="w-full">
                <div className="flex flex-col sm:flex-row gap-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'invalid') setStatus('idle');
                    }}
                    placeholder="Enter your email address..."
                    aria-label="Email address for newsletter"
                    data-testid="newsletter-input"
                    className={`flex-1 bg-transparent border ${
                      status === 'invalid' ? 'border-[#EF4444]' : 'border-[#333333]'
                    } focus:border-[#D4AF37] focus:outline-none text-[#FBF9F9] text-xs tracking-wider px-4 py-3 placeholder:text-[#525252] rounded-none transition-colors`}
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    aria-label="Subscribe to newsletter"
                    data-testid="newsletter-submit"
                    className="bg-[#D4AF37] text-[#0D0D0D] hover:bg-[#C4A030] active:bg-[#B39025] font-sans text-xs uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors rounded-none whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{status === 'submitting' ? 'DISPATCHING...' : 'SUBSCRIBE'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {status === 'invalid' && (
                  <p
                    role="alert"
                    data-testid="newsletter-error"
                    className="text-[#EF4444] text-[11px] uppercase tracking-wider mt-2 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Middle Tier: 4-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 lg:gap-12 py-16 border-b border-[#262626]">
          {/* Column 1: Maison & Atelier */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              MAISON
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li>
                <button
                  type="button"
                  onClick={handleStoryClick}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                >
                  Our Philosophy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleStoryClick}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                >
                  Atelier Craftsmanship
                </button>
              </li>
              <li className="hover:text-[#FBF9F9] transition-colors">Milan Flagship: Via Montenapoleone 8</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Tokyo Studio: Minato-ku, Aoyama</li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              COLLECTIONS
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('outerwear')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-outerwear"
                >
                  Outerwear & Tailoring
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('essentials')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-essentials"
                >
                  Architectural Essentials
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('summer-drop')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-summer-drop"
                >
                  Summer Drop 2026
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('all')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-all"
                >
                  Permanent Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Concierge */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              CONCIERGE
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li className="hover:text-[#FBF9F9] transition-colors">White-Glove Delivery</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Complimentary Returns (30 Days)</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Bespoke Alterations</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Private Salon Appointments</li>
            </ul>
          </div>

          {/* Column 4: Legal & Ethics */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              LEGAL & ETHICS
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li className="hover:text-[#FBF9F9] transition-colors">Sustainability & Rare Textiles</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Carbon Neutrality Commitment</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Privacy Policy</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Currency Selector & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 gap-6 text-xs text-[#707070]">
          <div>
            <p className="font-serif text-xs tracking-[0.1em] text-[#A3A3A3]">
              © 2026 AURA APPAREL ATELIER. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#525252] mt-0.5">
              MILAN • TOKYO • NEW YORK • ARCHITECTURAL MINIMALISM
            </p>
          </div>

          {/* Currency Dropdown Selector */}
          <div className="relative" ref={currencyRef}>
            <button
              type="button"
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              aria-haspopup="listbox"
              aria-expanded={isCurrencyOpen}
              aria-label="Select currency"
              data-testid="currency-selector"
              className="flex items-center gap-2.5 bg-[#1A1A1A] border border-[#333333] hover:border-[#D4AF37] text-[#FBF9F9] text-xs font-sans px-3.5 py-2 rounded-none transition-colors cursor-pointer"
            >
              <span className="font-mono text-[#D4AF37]">
                {selectedCurrencyConfig.symbol}
              </span>
              <span>{selectedCurrencyConfig.code}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#707070] transition-transform duration-200 ${
                  isCurrencyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCurrencyOpen && (
              <ul
                role="listbox"
                data-testid="currency-dropdown"
                className="absolute bottom-full right-0 mb-1.5 w-36 bg-[#141414] border border-[#333333] py-1 z-30 shadow-none rounded-none"
              >
                {CURRENCIES.map((curr) => {
                  const isSelected = curr.code === currentCurrency;
                  return (
                    <li
                      key={curr.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onCurrencyChange?.(curr.code);
                        setIsCurrencyOpen(false);
                      }}
                      data-testid={`currency-option-${curr.code}`}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#222222] text-[#D4AF37] font-medium'
                          : 'text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FBF9F9]'
                      }`}
                    >
                      <span>{curr.code}</span>
                      <span className="font-mono text-[11px] text-[#707070]">
                        {curr.symbol}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
```

---

## 7. Verification & Testing Matrix

Downstream workers can execute automated unit and integration tests against this specification.

| Test Tier | Test Case | Target Component | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Feature)** | Brand Wordmark Display | `Navbar.tsx` | Element with `data-testid="brand-wordmark"` renders "AURA APPAREL" with `font-serif`. |
| **Tier 1 (Feature)** | Nav Links Rendering | `Navbar.tsx` | Renders all 5 links (`COLLECTIONS`, `OUTERWEAR`, `ESSENTIALS`, `SUMMER DROP`, `BRAND STORY`). |
| **Tier 1 (Feature)** | Cart Trigger & Count Badge | `Navbar.tsx` | Renders `data-testid="cart-trigger"`. When `cartCount > 0`, renders `data-testid="cart-badge"` and `data-testid="cart-gold-dot"`. |
| **Tier 1 (Feature)** | Mobile Drawer Open/Close | `MobileDrawer.tsx` | Clicking hamburger opens drawer (`translate-x-0`), clicking close `X` closes drawer (`-translate-x-full`). |
| **Tier 1 (Feature)** | Newsletter Regex Validation | `Footer.tsx` | Empty string yields `"Please enter an email address."`. Invalid `test@foo` yields `"Please enter a valid email address."`. Valid `test@example.com` yields success confirmation card. |
| **Tier 1 (Feature)** | Currency Selection | `Footer.tsx` | Clicking currency dropdown exposes `USD`, `EUR`, `GBP`, `JPY` options; clicking `EUR` updates active display and triggers `onCurrencyChange('EUR')`. |
| **Tier 2 (Boundary)** | Extreme Emails | `Footer.tsx` | Handles `user+sub@domain.co.uk`, uppercase emails, and leading/trailing whitespace gracefully via `.trim()`. |
| **Tier 2 (Boundary)** | Zero Cart Count | `Navbar.tsx` | When `cartCount === 0`, badge and gold dot are not mounted in DOM. |
| **Tier 3 (Combination)** | Mobile Drawer Nav Click | `MobileDrawer.tsx` | Clicking "OUTERWEAR" inside drawer fires `onSelectCategory('outerwear')` AND triggers `onClose()`. |
| **Tier 4 (Scenarios)** | Scroll Transition | `Navbar.tsx` | Firing `window.dispatchEvent(new Event('scroll'))` with `window.scrollY = 100` switches header class to `bg-[#FBF9F9]/95 border-b border-[#E5E5E5]`. |

---

## 8. Summary of Downstream Worker Action Items

1. Create `src/components/layout/Navbar.tsx` based on the blueprint in Section 6.1.
2. Create `src/components/layout/MobileDrawer.tsx` based on the blueprint in Section 6.2.
3. Create `src/components/layout/Footer.tsx` based on the blueprint in Section 6.3.
4. Verify tests pass with `npm test`.
