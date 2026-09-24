# Project: Aura Apparel Luxury Web Storefront

## Architecture
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), zero-runtime CSS with `@theme` design tokens
- **Icons**: Lucide React
- **Test Infrastructure**: Vitest 4 + `@testing-library/react` + `jsdom` with `pool: 'threads'` for Windows host reliability
- **State Management**: React Context (`CartContext`) + Reducer with `localStorage` persistence and cross-tab storage sync
- **Design Archetype**: Luxury Minimalism (Obsidian `#0D0D0D`, Pale Gold `#D4AF37`, Cloud White `#FBF9F9`, 0px border geometry, Bodoni Moda display typography, Hanken Grotesk body typography, zero drop shadows).

## Code Layout
```
C:\Users\YC\teamwork_projects\aura_apparel\
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── src\
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types\
│   │   ├── product.ts
│   │   └── cart.ts
│   ├── data\
│   │   └── products.ts
│   ├── context\
│   │   └── CartContext.tsx
│   ├── components\
│   │   ├── layout\
│   │   │   ├── Navbar.tsx
│   │   │   ├── MobileDrawer.tsx
│   │   │   └── Footer.tsx
│   │   ├── home\
│   │   │   ├── Hero.tsx
│   │   │   ├── CollectionsShowcase.tsx
│   │   │   └── BrandStory.tsx
│   │   ├── catalog\
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── modal\
│   │   │   └── ProductModal.tsx
│   │   ├── cart\
│   │   │   ├── CartDrawer.tsx
│   │   │   └── CartItemRow.tsx
│   │   └── common\
│   │       ├── ImageWithFallback.tsx
│   │       └── LuxuryBadge.tsx
│   └── tests\
│       ├── setup.ts
│       ├── m1-shell.test.tsx
│       ├── m2-catalog.test.tsx
│       ├── m3-modal.test.tsx
│       ├── m4-cart.test.tsx
│       ├── tier1-features.test.tsx
│       ├── tier2-boundary.test.tsx
│       ├── tier3-combinations.test.tsx
│       ├── tier4-scenarios.test.tsx
│       └── tier5-adversarial.test.tsx
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Sticky Editorial Header | Fixed header with scroll transition & 1px border | M1 | Survey |
| 2 | Brand Wordmark | Prominent "AURA APPAREL" in Bodoni Moda serif | M1 | Survey |
| 3 | Desktop Menu Links | Collections, Outerwear, Essentials, Summer Drop, Story | M1 | Survey |
| 4 | Mobile Navigation Drawer | Hamburger toggle (<768px) with mobile nav links | M1 | Survey |
| 5 | Cart Trigger & Indicator | Bag icon with live item count badge & Pale Gold dot | M1 | Survey |
| 6 | Editorial Full-Bleed Hero | Immersive hero banner, Bodoni Moda headline & copy | M1 | Survey |
| 7 | Primary Hero CTA | Sharp 0px Obsidian button scrolling to catalog | M1 | Survey |
| 8 | Curated Category Showcase | Outerwear, Essentials, Summer Drop visual cards | M1 | Survey |
| 9 | Category Card Interactions | 1.03x scale zoom on hover & catalog filter trigger | M1 | Survey |
| 10 | Brand Story Manifesto | 3 craftsmanship pillars: Precision, Textiles, Atelier | M1 | Survey |
| 11 | Newsletter Subscription | Sharp 0px input, regex validation, confirmation state | M1 | Survey |
| 12 | Multi-Column Directory | Collections, Concierge, Legal & Atelier directory links | M1 | Survey |
| 13 | Currency Selector | Dropdown supporting USD, EUR, GBP, JPY | M1 | Survey |
| 14 | Design Tokens Integration | Obsidian, Pale Gold, Cloud White, 0px border geometry | M1 | Survey |
| 15 | Curated Product Dataset | 12 luxury items across Outerwear, Essentials, Summer Drop | M2 | Survey |
| 16 | Dynamic Category Filter Tabs | ALL, OUTERWEAR, ESSENTIALS, SUMMER DROP tabs | M2 | Survey |
| 17 | Sort & Arrangement Selector | Featured, Price Low-High, Price High-Low, New Arrivals | M2 | Survey |
| 18 | Responsive Product Grid | 4-col desktop, 2-col tablet, 1-col mobile layout | M2 | Survey |
| 19 | Product Card Hover Flip | Secondary angle/lifestyle image fade/zoom on hover | M2 | Survey |
| 20 | Luxury Status Badges | Sharp 0px chips for EXCLUSIVE, NEW ARRIVAL, BESTSELLER | M2 | Survey |
| 21 | Direct Quick-Buy Action | Fast add-to-bag hover button for default variant | M2 | Survey |
| 22 | Quick View Product Modal | Full-screen overlay modal with backdrop blur & focus trap | M3 | Survey |
| 23 | Multi-Angle Gallery | Main photo with clickable sharp thumbnail selectors | M3 | Survey |
| 24 | Size Selector Matrix | XS, S, M, L, XL sharp rectangular selector chips | M3 | Survey |
| 25 | Color Swatch Selector | Swatches with Pale Gold active indicator ring | M3 | Survey |
| 26 | Quantity Stepper | Increment/decrement controls clamped between 1 and 10 | M3 | Survey |
| 27 | Modal Add-to-Bag CTA | High-emphasis button with "Added to Bag" confirmation | M3 | Survey |
| 28 | Size Selection Validation | Inline warning when attempting to add without size | M3 | Survey |
| 29 | Slide-Out Cart Drawer | Smooth right-edge slide-in with backdrop dismissal | M4 | Survey |
| 30 | Cart State & Deduplication | Compound key (${id}__${color}__${size}) deduplication | M4 | Survey |
| 31 | Free Shipping Progress Bar | $250 spend threshold progress calculation & status | M4 | Survey |
| 32 | Live Price Calculation | Real-time Subtotal, Shipping, Tax, Grand Total | M4 | Survey |
| 33 | Promo Code Engine | Discount coupon ("AURA10") validation & calculation | M4 | Survey |
| 34 | State Persistence | SSR-safe localStorage sync and cross-tab storage event | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Project Setup & Responsive Shell | Scaffolding, Vite+React+Tailwind v4 tokens, Navbar, Drawer, Hero, Collections, Story, Footer | none | DONE |
| M2 | Product Catalog & Category Filtering | 12 curated products, Category filter tabs, Sort dropdown, Responsive grid, Product cards | M1 | DONE |
| M3 | Product Detail Modal & Quick Buy | Modal dialog, Multi-angle gallery, Size matrix, Color swatches, Stepper, Validation | M2 | IN_PROGRESS |
| M4 | Slide-Out Cart Drawer & State Persistence | CartContext, Deduplication, Free shipping meter, Live totals, Promo engine, LocalStorage sync | M3 | PLANNED |
| M5 | Full E2E & Component Test Suite Pass | Complete verification of Tiers 1-4 tests (Feature, Boundary, Combinations, Scenarios) | M4, TEST_READY | PLANNED |
| M6 | Adversarial Hardening (Tier 5) | Adversarial coverage audit, stress tests, edge case resolution | M5 | PLANNED |

## Interface Contracts
### Product Domain (`src/types/product.ts`)
```typescript
export type Category = 'outerwear' | 'essentials' | 'summer-drop';

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  secondaryImage: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  category: Category;
  description: string;
  details: string[];
  colors: ProductColor[];
  sizes: string[];
  badge?: 'EXCLUSIVE' | 'NEW ARRIVAL' | 'BESTSELLER' | 'SUMMER DROP';
  stock: number;
  featured?: boolean;
}
```

### Cart Domain (`src/types/cart.ts`)
```typescript
export interface CartItem {
  key: string; // `${productId}__${colorName}__${size}`
  productId: string;
  title: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
}

export interface CartTotals {
  subtotal: number;
  shippingThreshold: number; // 250
  freeShippingUnlocked: boolean;
  shippingRemaining: number;
  shippingCost: number; // 0 if subtotal >= 250 or empty, 15 otherwise
  discountAmount: number;
  promoCodeApplied?: string;
  tax: number; // 8% of (subtotal - discountAmount)
  grandTotal: number;
}
```
