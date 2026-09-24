# Technical Architecture, Toolchain & Environment Survey Report: Aura Apparel

**Author**: Explorer 1 (`explorer_survey_1`)  
**Project**: Aura Apparel Luxury Minimalist Web Storefront  
**Working Directory**: `C:\Users\YC\teamwork_projects\aura_apparel\.agents\explorer_survey_1`  
**Brain Directory**: `C:\Users\YC\.gemini\antigravity\brain\e15c56d4-6010-4a0d-833b-7a697ec5f6a0`  
**Date**: 2026-09-03  
**Status**: Complete  

---

## Executive Summary

This survey provides the authoritative technical blueprint, toolchain specification, and architectural guidance for implementing the **Aura Apparel** luxury minimalist web storefront on the local Windows development environment.

Through direct empirical validation in a clean sandbox on this host machine, we verified the optimal, zero-console-error toolchain:
- **Runtime & Package Manager**: Node.js `v24.18.1` + npm `11.16.0` (pnpm/yarn/bun not available).
- **Core Framework**: React `19.2.8` + React DOM `19.2.8`.
- **Bundler & Build Tool**: Vite `8.2.2` with native ESM (`"type": "module"`).
- **Styling Engine**: Tailwind CSS `4.3.3` with the official `@tailwindcss/vite` plugin (eliminating PostCSS and `tailwind.config.js` overhead while achieving 1.5s build speeds).
- **Component & E2E Testing**: Vitest `4.1.11` + `@testing-library/react` `16.3.3` + `@testing-library/jest-dom` `7.0.1` + `jsdom` `30.0.1`.
- **Crucial Windows OS Mitigations Identified**:
  1. *Vitest Pool Execution*: Default `forks` pool on Windows encounters worker IPC timeouts (`Failed to start forks worker`). Setting `pool: 'threads'` in `vite.config.ts` resolves this completely, achieving sub-6s test execution with 100% test reliability.
  2. *UTF-8 Byte Order Mark (BOM)*: PowerShell 5.1 `Set-Content -Encoding utf8` writes a UTF-8 BOM (`\uFEFF`), which causes Node.js JSON parsers to crash with `Unexpected token '﻿'`. All file creations must use BOM-less UTF-8.
  3. *Vite ESM Native Loader*: Vite 8 requires `"type": "module"` in `package.json` to prevent CommonJS fallback warnings.

---

## 1. Windows Host Environment Survey

### 1.1 Installed Tooling & Capabilities

| Tool | Version | Availability / Status | Notes / Impact |
|---|---|---|---|
| **OS** | Windows 10/11 x64 | Active host environment | PowerShell 5.1 default shell |
| **Node.js** | `v24.18.1` | Installed & verified on system PATH | Modern Node 24 runtime with full ES module and native worker support |
| **npm** | `11.16.0` | Installed & verified on system PATH | Standard package manager; registry latency ~990ms |
| **npx** | `11.16.0` | Installed & verified on system PATH | Fully functional for running one-off CLI tools |
| **Git** | `2.55.0.windows.2` | Installed & verified on system PATH | Version control ready |
| **pnpm** | *Not installed* | Not available on PATH | Must NOT be referenced in project documentation or scripts |
| **yarn** | *Not installed* | Not available on PATH | Must NOT be referenced in project documentation or scripts |
| **bun** | *Not installed* | Not available on PATH | Must NOT be referenced in project documentation or scripts |

### 1.2 Host-Specific Pitfalls & Verified Mitigations

#### Pitfall A: PowerShell UTF-8 BOM Corruption
- **Phenomenon**: When generating JSON files (like `package.json` or `tsconfig.json`) via PowerShell's `Set-Content -Path ... -Encoding utf8` or `Out-File -Encoding utf8`, Windows PowerShell automatically prepends a 3-byte Byte Order Mark (`0xEF 0xBB 0xBF`).
- **Failure Mode**: Node.js and Vite's internal JSON loaders fail with:
  ```
  SyntaxError: Unexpected token '﻿', "﻿{ "n"... is not valid JSON
  ```
- **Verified Mitigation**: Workers writing files via PowerShell must explicitly construct a BOM-less UTF8 encoder:
  ```powershell
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
  ```

#### Pitfall B: Vitest Windows Fork Worker Timeout
- **Phenomenon**: Vitest 4 defaults to `forks` pool on Windows. In this environment, child process IPC communication over Windows named pipes times out after 60 seconds:
  ```
  Error: [vitest-pool]: Failed to start forks worker for test files ...
  Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond (60.05s)
  ```
- **Verified Mitigation**: Set `pool: 'threads'` in `vite.config.ts` under the `test` block. With `threads`, Vitest initializes worker threads inside the main Node process, executing the full test suite in under 6 seconds with 0 errors.

#### Pitfall C: Vite 8 Native ConfigLoader Warning
- **Phenomenon**: If `package.json` does not declare `"type": "module"`, Vite 8 outputs a warning on every build and test run:
  ```
  (!) Your Vite config uses features that are unsupported by configLoader: 'native'
  ESM syntax in a file loaded as CommonJS. Use a .mjs extension or set "type": "module" in the closest package.json
  ```
- **Verified Mitigation**: Explicitly include `"type": "module"` in `package.json`.

---

## 2. Recommended Technology Stack & Version Matrix

### 2.1 Dependency Matrix

```json
{
  "name": "aura-apparel",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^1.40.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@testing-library/jest-dom": "^7.0.1",
    "@testing-library/react": "^16.3.3",
    "@types/node": "^24.1.0",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.6",
    "@vitejs/plugin-react": "^6.1.1",
    "jsdom": "^30.0.1",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.8.2",
    "vite": "^8.2.2",
    "vitest": "^4.1.11"
  }
}
```

### 2.2 Stack Rationale & Empirical Benchmarks

1. **Vite 8.2 + React 19.2**:
   - Production bundle compiles in **1.54s** (`dist/assets/index-...js`: ~193 kB uncompressed, ~61 kB gzipped; `dist/assets/index-...css`: ~7.8 kB uncompressed, ~2.4 kB gzipped).
   - Zero deprecation warnings with React 19's `createRoot` and modern hook lifecycle.
2. **Tailwind CSS v4 + `@tailwindcss/vite`**:
   - Native Rust/LightningCSS-powered Vite plugin. No `postcss.config.js` or `tailwind.config.js` required.
   - Declarative `@theme` configuration inside `src/index.css` directly exports CSS variables and utility classes (`bg-obsidian`, `text-pale-gold`, `bg-cloud-white`, `font-serif`, `font-sans`).
3. **Lucide React 1.40**:
   - Provides crisp, lightweight SVGs that perfectly complement luxury minimalist design: `ShoppingBag`, `X`, `Plus`, `Minus`, `ChevronRight`, `ArrowRight`, `Filter`, `Check`, `Menu`, `SlidersHorizontal`, `Star`, `Heart`, `ShieldCheck`.
   - Tree-shakeable: only imported icons are bundled.
4. **Vitest 4.1 + React Testing Library 16.3 + JSDOM 30.0**:
   - Component and end-to-end user journey tests run inside JSDOM without requiring heavy external browser binaries (such as Playwright Chromium/WebKit downloads) which can fail on restricted or slow connections.
   - Simulates complete user interactions: browsing, filtering, modal opens, size/color variant selection, adding to cart, cart drawer slide-in, subtotal calculation, free shipping meter progress, promo codes, and `localStorage` persistence.

---

## 3. Design System Implementation Architecture

### 3.1 Design Tokens (StitchMCP Authoritative Specification)

In accordance with `ORIGINAL_REQUEST.md` (R3) and StitchMCP design system tokens (`assets/a9c56d1a72094d4a9dab8c50640ee2fc`):

| Token Category | Token Name | Value | Purpose / Application |
|---|---|---|---|
| **Color** | Obsidian | `#0D0D0D` | Primary wordmark, headers, solid CTA buttons, high-contrast borders |
| **Color** | Pale Gold | `#D4AF37` | Exclusive badges, VIP tags, shipping progress bar, subtle micro-accents |
| **Color** | Cloud White | `#FBF9F9` / `#FAFAFA` | Main canvas background, editorial contrast |
| **Color** | Pure Surface White | `#FFFFFF` | Card containers, modal background, cart drawer surface |
| **Color** | Slate / Neutral Ink | `#707070` | Secondary metadata, color names, fabric specs |
| **Color** | Muted Outline | `#E5E5E5` / `#C4C7C7` | Architectural 1px grid dividers and input borders |
| **Color** | Error Red | `#BA1A1A` | Validation error messages and alert indicators |
| **Typography** | Display Serif | **Bodoni Moda**, serif | Large headlines, editorial titles, brand wordmark (`display-lg`: 72px/80px -0.02em) |
| **Typography** | Body Sans | **Hanken Grotesk**, sans-serif | Navigation links, body copy, product titles, labels (`label-sm`: 12px uppercase +0.1em) |
| **Geometry** | Border Radius | **`0px` (sharp)** | Strictly 0px across all elements (`rounded-none`). No rounded pill buttons. |
| **Elevation** | Box Shadow | **`none`** | Zero drop shadows (`shadow-none`). Depth created exclusively via 1px border lines. |

### 3.2 Font Loading Architecture

In `index.html`, load Google Fonts with `preconnect` for high performance and zero layout shift:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
```

### 3.3 Tailwind v4 `@theme` Configuration (`src/index.css`)

```css
@import "tailwindcss";

@theme {
  --color-obsidian: #0D0D0D;
  --color-pale-gold: #D4AF37;
  --color-cloud-white: #FBF9F9;
  --color-surface-white: #FFFFFF;
  --color-slate-muted: #707070;
  --color-border-subtle: #E5E5E5;

  --font-serif: "Bodoni Moda", Georgia, serif;
  --font-sans: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

@layer base {
  *, ::before, ::after {
    border-radius: 0px !important;
  }
  body {
    background-color: var(--color-cloud-white);
    color: var(--color-obsidian);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

---

## 4. Proposed Project Structure & Module Organization

```
aura_apparel/
├── .agents/                        # Agent metadata (plans, reports, progress)
├── index.html                      # HTML template with Google Fonts & metadata
├── package.json                    # Dependencies, scripts, "type": "module"
├── tsconfig.json                   # Root TypeScript config
├── tsconfig.app.json               # Application TS config
├── tsconfig.node.json              # Tooling TS config
├── vite.config.ts                  # Vite + React + Tailwind + Vitest threads configuration
├── src/
│   ├── main.tsx                    # React 19 entry mount point
│   ├── App.tsx                     # Storefront composition & layout coordinator
│   ├── index.css                   # Tailwind v4 theme tokens & base styles
│   ├── types/
│   │   ├── product.ts              # Product, Category, Variant, Review interfaces
│   │   └── cart.ts                 # CartItem, CartState, CartAction, Promo interfaces
│   ├── data/
│   │   └── products.ts             # 12 curated luxury products (Outerwear, Essentials, Summer Drop)
│   ├── context/
│   │   └── CartContext.tsx         # Cart reducer, localStorage sync, compound key logic
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Sticky header, brand wordmark, nav links, bag badge
│   │   │   ├── MobileMenu.tsx      # Hamburger drawer for mobile viewports (<768px)
│   │   │   └── Footer.tsx          # Newsletter form, directory links, currency switcher
│   │   ├── sections/
│   │   │   ├── Hero.tsx            # Full-bleed editorial hero with Bodoni Moda headline
│   │   │   ├── CuratedCollections.tsx # Outerwear, Essentials, Summer Drop category cards
│   │   │   ├── ProductGrid.tsx     # Dynamic filter tabs, sort dropdown, responsive grid
│   │   │   └── BrandStory.tsx      # Atelier manifesto & craftsmanship pillars
│   │   ├── product/
│   │   │   ├── ProductCard.tsx     # Image hover flip, luxury badges, quick add
│   │   │   └── ProductModal.tsx    # Detail modal, multi-angle gallery, size & color selection
│   │   └── cart/
│   │       ├── CartDrawer.tsx      # Slide-out drawer, shipping meter, totals, promo code, checkout
│   │       └── CartItemRow.tsx     # Line item row with stepper and remove controls
│   └── test/
│       ├── setup.ts                # @testing-library/jest-dom initialization
│       └── storefront.test.tsx     # Automated end-to-end user flow test suite
```

---

## 5. Automated Testing Strategy for Zero-Error Verification

### 5.1 Test Framework Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    pool: 'threads', // CRITICAL for Windows host stability
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

### 5.2 Core User Flow Test Suite Scope (`storefront.test.tsx`)

The test suite directly tests all acceptance criteria outlined in `ORIGINAL_REQUEST.md`:

1. **Rendering & Brand Fidelity**:
   - Header renders "AURA APPAREL" in display serif.
   - Full-bleed hero renders headline "THE FORM OF STILLNESS" and primary CTA.
   - Curated collection categories (Outerwear, Essentials, Summer Drop) render with item counts.
2. **Catalog Browsing & Category Filtering**:
   - Initial render displays all 12 curated products.
   - Clicking "Outerwear" filters grid to 4 outerwear items.
   - Clicking "Essentials" filters grid to 4 essentials items.
   - Clicking "Summer Drop" filters grid to 4 summer drop items.
   - Clicking "All Pieces" restores the complete catalog.
3. **Product Detail Modal & Selection Validation**:
   - Clicking a product card opens the full-screen modal with backdrop blur.
   - Gallery image updates upon clicking alternate angle thumbnails.
   - Selecting a color swatch updates active color state.
   - Clicking "Add to Bag" without a selected size displays validation feedback.
   - Selecting size (e.g. "M") and clicking "Add to Bag" succeeds and opens the cart drawer.
4. **Slide-Out Cart Drawer Operations**:
   - Slide-out drawer opens with matching item, selected size, and color.
   - Live badge counter in header updates accurately.
   - Incrementing item quantity updates line item subtotal and cart total.
   - Decrementing item to 0 removes the item.
   - Free shipping progress bar dynamically calculates remaining spend towards $250.
   - Promo code "AURA10" applies 10% discount to subtotal.
5. **State Persistence**:
   - Cart modifications are serialized to `localStorage.getItem('aura_cart')`.
   - Reloading the component hydrates from `localStorage` without console errors.

---

## 6. Implementation Risk Register & Mitigation Strategy

| Risk | Severity | Impact | Mitigation Strategy |
|---|---|---|---|
| **External CDN Image Failures** | Medium | Broken image icons or console 404s if Unsplash CDN rate limits or blocks requests. | Implement an `ImageWithFallback` component that catches `onError` and seamlessly renders an elegant SVG geometric silhouette with the brand wordmark. |
| **LocalStorage Serialization Errors** | Low | Corrupted `localStorage` data throwing unhandled JSON parse exceptions. | Wrap all `localStorage` reads/writes in defensive `try/catch` blocks; fallback to empty cart state `[]` on any failure. |
| **Layout Shift During Drawer/Modal Open** | Low | Page content jumps when body scroll is locked. | Compensate scrollbar width when adding `overflow: hidden` to `document.body`. |
| **Rapid Multiple Clicks (Double Add)** | Low | User clicks "Quick Add" repeatedly, adding unintended duplicates. | Debounce action and provide 400ms visual button feedback ("Added"). |
| **Mobile Drawer Viewport Overflow** | Medium | Menu drawer or cart drawer exceeding viewport height on mobile devices. | Use `h-[100dvh]` (dynamic viewport height) and `overflow-y-auto` for inner content. |

---

## 7. Step-by-Step Command Sequences for Downstream Workers

### 7.1 Initial Workspace Scaffolding
```powershell
# In C:\Users\YC\teamwork_projects\aura_apparel:
# 1. Install dependencies
npm i react react-dom lucide-react
npm i -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss typescript @types/react @types/react-dom @types/node vitest @testing-library/react @testing-library/jest-dom jsdom

# 2. Verify "type": "module" exists in package.json
```

### 7.2 Verification & Build Execution
```powershell
# Run automated component & E2E user flow tests
npm test

# Run production build (TypeScript check + Vite bundle)
npm run build
```

---

## 8. Conclusion

The execution environment is fully primed for high-performance React 19 + Vite 8 + Tailwind CSS v4 development. By applying the thread-based Vitest pool and BOM-less file writing protocols, downstream implementation workers can develop and verify the Aura Apparel storefront with **zero console errors, zero build warnings, and 100% automated test pass rates**.
