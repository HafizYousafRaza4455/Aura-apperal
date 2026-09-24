# Technical Analysis & Architectural Specification: Product Modal Dialog & Accessibility Architecture

**Author**: Explorer M3.1  
**Project**: Aura Apparel Luxury Minimalist Web Storefront  
**Milestone**: M3 - Product Detail Modal & Quick Buy  
**Target Component**: `src/components/modal/ProductModal.tsx`  
**Date**: 2026-09-03  

---

## 1. Executive Summary & Architectural Overview

The **Product Detail Modal (`ProductModal.tsx`)** is the focal interaction hub of Milestone 3 for the Aura Apparel luxury storefront. It transitions the customer from the high-level editorial catalog grid into an intimate, high-definition inspection of archival garments with bespoke variant selection, sizing matrix, and bag actions.

Because Aura Apparel embodies a strict **Luxury Minimalist** archetype (Obsidian `#0D0D0D`, Pale Gold `#D4AF37`, Cloud White `#FBF9F9`, sharp 0px border geometry, zero box shadows, Bodoni Moda display serif, Hanken Grotesk sans-serif), the modal dialog must exude architectural precision and zero-jank execution.

### Core Architectural Pillars
1. **WAI-ARIA 1.2 Compliant Dialog Semantics**:
   - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="product-modal-title"`, `aria-describedby="product-modal-subtitle"`.
   - Rendered at the DOM root via React `createPortal(..., document.body)` to escape parent CSS stacking contexts, `overflow: hidden`, and CSS transforms.
2. **Robust Bidirectional Focus Trapping & Restoration**:
   - Traps Tab and Shift+Tab cycles strictly within modal interactive elements.
   - Saves trigger element before opening; restores focus to trigger upon dismissal (WCAG 2.4.3).
   - Initial focus automatically placed on the close button or modal container to trigger screen reader announcement.
3. **Multi-Channel Dismissal Engine**:
   - **Escape Key**: Global keydown listener with stopPropagation.
   - **Backdrop Dismissal**: Drag-safe mousedown/mouseup origin verification preventing accidental dismissals during text selection.
   - **Close Button**: Sharp 0px button with Lucide `X` icon, Pale Gold hover accent, and explicit `aria-label="Close modal"`.
4. **Layout-Shift-Free Body Scroll Locking**:
   - Locks `document.body.style.overflow = 'hidden'`.
   - Dynamically calculates scrollbar width (`window.innerWidth - document.documentElement.clientWidth`) and injects matching `paddingRight` onto `document.body` to eliminate horizontal layout jank on desktop browsers.
   - Cleanly restores previous styles on unmount or dismissal.
5. **Responsive Split Layout**:
   - **Desktop (>= 768px / md:)**: Centered luxury overlay card (`max-w-4xl` / 960px) with 2-column split (3:4 portrait gallery on left, independently scrollable details pane on right).
   - **Mobile (< 768px)**: Full-width bottom slide-up sheet (`100dvh` / `max-h-[92vh]`) with top drag indicator, scrollable content body, and sticky bottom Add to Bag action bar.

---

## 2. WAI-ARIA 1.2 Modal Dialog Semantics & Accessibility Tree

Assistive technologies (screen readers like NVDA, JAWS, VoiceOver, and Orca) require explicit ARIA attributes to understand that the document behind the modal is inert and inaccessible while the modal is open.

### 2.1 Semantic Markup Structure

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="product-modal-title"
  aria-describedby="product-modal-subtitle"
  data-testid="product-modal"
  className="..."
>
  {/* Accessible Title */}
  <h2 id="product-modal-title" className="font-serif text-2xl sm:text-3xl text-[#0D0D0D] font-normal uppercase">
    {product.title}
  </h2>

  {/* Accessible Subtitle / Description */}
  <p id="product-modal-subtitle" className="text-xs uppercase tracking-[0.2em] text-[#707070]">
    {product.subtitle}
  </p>
  ...
</div>
```

### 2.2 Semantic Attributes Breakdown
| Attribute | Target | Value | Purpose |
|---|---|---|---|
| `role="dialog"` | Dialog container | `"dialog"` | Identifies the container as a distinct sub-window/dialog within the application. |
| `aria-modal="true"` | Dialog container | `"true"` | Instructs assistive technologies to confine virtual cursor and reading to the dialog elements only. |
| `aria-labelledby` | Dialog container | `"product-modal-title"` | Associates the dialog with its primary heading, immediately announced upon opening. |
| `aria-describedby` | Dialog container | `"product-modal-subtitle"` | Associates the dialog with the secondary garment description for context. |
| `aria-label="Close modal"` | Close button | `"Close modal"` | Accessible name for screen reader users on the visual `X` icon button. |
| `aria-live="assertive"` | Validation alert | `"assertive"` | Immediately announces missing size error to screen reader users when Add to Bag is pressed without a size. |

### 2.3 Portal Strategy (`createPortal`)
In React applications, rendering modal markup inline within the catalog hierarchy creates subtle bugs:
- **Stacking Context Traps**: Parents with `z-index`, `opacity < 1`, `transform`, `filter`, or `will-change` establish local stacking contexts, preventing the modal backdrop from truly sitting above all page layers (like the sticky `Navbar` at `z-40`).
- **Overflow Clipping**: Parents with `overflow: hidden` or `overflow: auto` (e.g. carousels or scrollable containers) can clip fixed elements in some rendering engines.

**Solution**:
```tsx
import { createPortal } from 'react-dom';

export const ProductModal: React.FC<ProductModalProps> = (props) => {
  if (!props.isOpen || !props.product) return null;

  return createPortal(
    <ProductModalOverlay {...props} />,
    document.body
  );
};
```

---

## 3. Keyboard Navigation, Bidirectional Focus Trapping & Restoration

A complete accessibility loop requires capturing focus on open, trapping focus inside, cycling seamlessly between first and last tabbable elements, and returning focus to the triggering element on close.

### 3.1 Focus Trapping State Machine & Lifecycle

```
[User clicks ProductCard]
        │
        ▼
1. Save document.activeElement to triggerRef
        │
        ▼
2. Mount ProductModal via createPortal into document.body
        │
        ▼
3. Set initial focus on Close Button or Modal Container
        │
        ▼
4. [User presses Tab / Shift+Tab]
   ├── Tab on Last Element    ───► Wrap to First Element
   ├── Shift+Tab on First Element ───► Wrap to Last Element
   └── Escape Key             ───► Trigger onClose()
        │
        ▼
5. [Modal Dismissed]
   ├── Restore document.body styles (overflow, paddingRight)
   └── Restore focus to triggerRef.current.focus()
```

### 3.2 Focusable Selector Definition
To guarantee that every interactive element inside the modal is reachable while ignoring disabled, hidden, or non-interactive elements:

```typescript
const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');
```

### 3.3 Bidirectional Trap Implementation Hook (`useFocusTrap`)

```typescript
export function useFocusTrap(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Capture trigger element
    triggerRef.current = document.activeElement as HTMLElement;

    // 2. Schedule initial focus placement
    const timeoutId = setTimeout(() => {
      if (!modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        modalRef.current.focus();
      }
    }, 50);

    // 3. Tab and Escape Keydown Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Backward Tab (Shift + Tab)
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Forward Tab
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    // 4. Teardown: Restore focus to trigger
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return modalRef;
}
```

---

## 4. Multi-Channel Dismissal Engine

Luxury user experience mandates that dismissal is effortless, intuitive, and devoid of frustrating false-positives.

### 4.1 Channels of Dismissal
1. **Escape Keypress**:
   - Handled directly in the window keydown listener.
   - Stops propagation so parent components or drawers don't trigger simultaneous events.
2. **Top-Right Sharp 0px Close Button**:
   - Positioned in the upper right corner of the modal with high touch target (`p-2.5 min-w-[44px] min-h-[44px]`).
   - Icon: `Lucide X` (stroke width 1.5).
   - Styling: Sharp 0px border, Obsidian `#0D0D0D` colorway, hovering to Pale Gold `#D4AF37`.
   - Explicit `aria-label="Close modal"`.
3. **Backdrop Click with Drag-Safe Mouse Origin Verification**:
   - **The Drag Edge Case**: A user selecting garment description text inside the modal card might drag their mouse and release it on the backdrop. If listening only to `onClick`, the browser treats this as a click on the backdrop, closing the modal and losing user selections!
   - **Solution**: Track `onMouseDown` target. Only trigger `onClose` if BOTH `onMouseDown` AND `onClick` originated directly on the backdrop element (`e.target === e.currentTarget`).

```tsx
const mouseDownTargetRef = useRef<EventTarget | null>(null);

const handleBackdropMouseDown = (e: React.MouseEvent) => {
  mouseDownTargetRef.current = e.target;
};

const handleBackdropClick = (e: React.MouseEvent) => {
  if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
    onClose();
  }
  mouseDownTargetRef.current = null;
};
```

---

## 5. Layout-Shift-Free Body Scroll Locking with Scrollbar Width Compensation

When displaying full-screen overlays, locking background scrolling is mandatory to prevent disorienting double-scroll behaviors. However, standard `document.body.style.overflow = 'hidden'` removes the operating system scrollbar, causing an ugly 15px-17px horizontal layout jump on desktop screens (Windows Chrome, Edge, Firefox).

### 5.1 The Calculation Mechanism
The exact scrollbar width can be computed dynamically by comparing the outer window width with the inner client width of the root document element:

$$\text{scrollbarWidth} = \text{window.innerWidth} - \text{document.documentElement.clientWidth}$$

- If $\text{scrollbarWidth} > 0$: The page currently possesses a visible scrollbar.
- Applying `document.body.style.paddingRight = \`${scrollbarWidth}px\`` precisely replaces the vanished scrollbar with an identical margin, preventing any content jumping.

### 5.2 Implementation Hook (`useBodyScrollLock`)

```typescript
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // 1. Calculate scrollbar width
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    // 2. Cache initial styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // 3. Apply scroll lock with compensation
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 4. Clean up on unlock or unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
```

---

## 6. Responsive Split Architecture (Desktop 960px 2-Column vs Mobile Sheet)

The modal layout adapts fluidly between desktop screens (where editorial gallery presentation thrives in a wide two-column card) and mobile viewports (where touch-friendly slide-up sheets anchored to the bottom maximize thumb ergonomics).

```
================================================================================
DESKTOP (>= 768px / md:) — Centered 960px 2-Column Luxury Overlay Card
================================================================================
┌────────────────────────────────────────┬─────────────────────────────────────┐
│ 3:4 High-Res Editorial Gallery         │ Product Details & Action Pane       │
│                                        │                                     │
│  [EXCLUSIVE BADGE]                     │  OUTERWEAR ARCHIVE                  │
│                                        │  THE OVERSIZED WOOL TRENCH     [ X ]│
│  ┌──────────────────────────────────┐  │  $580 USD                           │
│  │                                  │  │  ────────────────────────────────── │
│  │                                  │  │  COLOR: OBSIDIAN BLACK              │
│  │                                  │  │  [■] [■] [■] (Pale Gold Ring)       │
│  │       3:4 Portrait Image         │  │                                     │
│  │                                  │  │  SIZE: M               [Size Guide] │
│  │                                  │  │  [XS] [S] [ M ] [L] [XL] (0px)      │
│  │                                  │  │                                     │
│  └──────────────────────────────────┘  │  QUANTITY:  [-]  1  [+]             │
│                                        │                                     │
│  [Thumb 1]  [Thumb 2]  [Thumb 3]       │  ┌────────────────────────────────┐ │
│                                        │  │ ADD TO BAG                     │ │
│                                        │  └────────────────────────────────┘ │
│                                        │  Details & Craftsmanship (Scroll)   │
└────────────────────────────────────────┴─────────────────────────────────────┘

================================================================================
MOBILE (< 768px) — Slide-Up Editorial Sheet with Sticky Bottom Action Bar
================================================================================
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ═════ [Drag Handle] ═════                           │
│  AURA APPAREL                                                           [X] │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ 3:4 Gallery Image ]                                                      │
│  [Thumb 1] [Thumb 2]                                                        │
│                                                                             │
│  THE OVERSIZED WOOL TRENCH                                                  │
│  $580 USD                                                                   │
│  COLOR: OBSIDIAN BLACK  [■] [■] [■]                                         │
│  SIZE: [XS] [S] [M] [L] [XL]                                                │
│  QUANTITY: [-] 1 [+]                                                        │
│  Craftsmanship description & bulleted specifications...                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Sticky Bottom Bar]                                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ADD TO BAG • $580                                                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Layout Specifications Comparison Matrix

| Property | Desktop Viewport (`>= 768px`) | Mobile Viewport (`< 768px`) |
|---|---|---|
| **Container Geometry** | Centered floating card, `max-w-4xl` (~896px-960px) | Full-width slide-up sheet, anchored to bottom (`inset-x-0 bottom-0`) |
| **Max Height** | `max-h-[85vh]` or `max-h-[90vh]` | `max-h-[92dvh]` or `max-h-[95dvh]` |
| **Borders** | 1px border on all 4 sides (`border border-[#E5E5E5]`) | 1px border on top edge (`border-t border-[#E5E5E5]`) |
| **Border Radius** | Sharp 0px (`rounded-none !important`) | Sharp 0px (`rounded-none !important`) |
| **Columns** | 2 Columns (`grid grid-cols-2`) | 1 Column vertical scroll (`flex flex-col`) |
| **Left Column (Gallery)** | Sticky or fixed aspect 3:4 with thumbnail row | Top scrollable media section with compact thumbnails |
| **Right Column (Details)** | Independent vertical scrolling (`overflow-y-auto`) | Continuous single-page scroll |
| **Add to Bag CTA** | Inlined inside details pane | Fixed/Sticky bottom action bar (`sticky bottom-0`) with white blur |
| **Close Button** | Top right of details column or absolute card corner | Top right of sheet header bar |

---

## 7. Visual Tokens, Sharp 0px Geometry & Luxury Styling Specification

Aura Apparel adheres to high-fashion atelier aesthetics. Every visual detail must reinforce permanence, restraint, and structural clarity.

### 7.1 Palette Integration
- **Obsidian (`#0D0D0D`)**:
  - Used for the primary "ADD TO BAG" button, active size chip fill, primary headings, and selected colorway borders.
- **Pale Gold (`#D4AF37`)**:
  - Used for the active color swatch indicator ring (`ring-2 ring-[#D4AF37] ring-offset-2`), button hover states, "ADDED TO BAG" checkmark confirmation fill, and subtle editorial rule lines (`w-6 h-[1px] bg-[#D4AF37]`).
- **Cloud White (`#FBF9F9`)**:
  - Modal card background and sheet canvas.
- **Surface Low (`#F5F5F3`)**:
  - Gallery background and product details drawer/tabs.
- **Error Red (`#BA1A1A`)**:
  - Size validation warning banner with 1px border accent and assertive text.
- **Border Subtle (`#E5E5E5`)**:
  - 1px crisp borders separating grid columns, swatches, and size chips.

### 7.2 Strict 0px Geometry & Shadow Elimination
- `border-radius: 0px !important;` applies unconditionally to buttons, thumbnail cards, swatches, input steppers, and modal containers.
- `box-shadow: none !important;` ensures zero soft shadows. Elevation is achieved through:
  - Deep dimming backdrop: `bg-black/70 backdrop-blur-xs`
  - Crisp 1px borders: `border border-[#E5E5E5]`
  - Distinct tone layering: Surface white against Cloud White against black overlay.

---

## 8. Complete Implementation Blueprint for `src/components/modal/ProductModal.tsx`

The following production-ready component blueprint encapsulates all accessibility, focus trapping, scroll locking, multi-channel dismissal, and responsive layout requirements.

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { Product, ProductColor } from '../../types/product';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { LuxuryBadge } from '../common/LuxuryBadge';
import { formatPrice, Currency } from '../../data/products';

export interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  initialColor?: ProductColor | null;
  currentCurrency?: Currency;
  onClose: () => void;
  onAddToCart?: (item: {
    product: Product;
    color: ProductColor;
    size: string;
    quantity: number;
  }) => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  initialColor,
  currentCurrency = 'USD',
  onClose,
  onAddToCart,
}) => {
  // 1. Variant & Interaction State
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // 0 = primary, 1 = secondary
  const [validationError, setValidationError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // 2. Accessibility & DOM Refs
  const modalCardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const backdropMouseDownRef = useRef<EventTarget | null>(null);

  // Synchronize initial color and reset states when product opens
  useEffect(() => {
    if (isOpen && product) {
      if (initialColor && product.colors) {
        const idx = product.colors.findIndex((c) => c.name === initialColor.name);
        setSelectedColorIndex(idx !== -1 ? idx : 0);
      } else {
        setSelectedColorIndex(0);
      }
      setSelectedSize(null);
      setQuantity(1);
      setActiveImageIndex(0);
      setValidationError(false);
      setIsAdded(false);
    }
  }, [isOpen, product, initialColor]);

  // 3. Layout-Shift-Free Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  // 4. Focus Trap & Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;

    // Record previous active element to restore focus on close
    triggerElementRef.current = document.activeElement as HTMLElement;

    // Initial focus on close button or modal container
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalCardRef.current) {
        const focusable = Array.from(
          modalCardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalCardRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalCardRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Derive active color and images
  const colors = product.colors && product.colors.length > 0 ? product.colors : [];
  const activeColor = colors[selectedColorIndex] || {
    name: 'Classic',
    hex: '#0D0D0D',
    image: '',
    secondaryImage: '',
  };

  const images = [activeColor.image, activeColor.secondaryImage].filter(Boolean);
  const currentDisplayImage = images[activeImageIndex] || images[0] || '';

  // Stepper handlers
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrement = () => setQuantity((prev) => Math.min(10, Math.min(product.stock || 10, prev + 1)));

  // Add to Bag action
  const handleAddToBag = () => {
    if (!selectedSize) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    if (onAddToCart) {
      onAddToCart({
        product,
        color: activeColor,
        size: selectedSize,
        quantity,
      });
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // Drag-safe backdrop dismiss
  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    backdropMouseDownRef.current = e.target;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && backdropMouseDownRef.current === e.currentTarget) {
      onClose();
    }
    backdropMouseDownRef.current = null;
  };

  return createPortal(
    <div
      role="presentation"
      data-testid="product-modal-root"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden"
    >
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onMouseDown={handleBackdropMouseDown}
        onClick={handleBackdropClick}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />

      {/* 2. Responsive Modal Dialog Card */}
      <div
        ref={modalCardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
        aria-describedby="modal-product-subtitle"
        tabIndex={-1}
        data-testid="product-modal-dialog"
        className="relative z-10 w-full md:max-w-4xl lg:max-w-[960px] bg-[#FBF9F9] border-t md:border border-[#E5E5E5] rounded-none shadow-none flex flex-col md:grid md:grid-cols-2 max-h-[92dvh] md:max-h-[88vh] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Sharp Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          data-testid="modal-close-button"
          className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 md:bg-white text-[#0D0D0D] hover:text-[#D4AF37] border border-[#E5E5E5] hover:border-[#0D0D0D] rounded-none transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D0D0D]"
        >
          <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
        </button>

        {/* ============================================================= */}
        {/* LEFT COLUMN: High-Resolution Gallery & Thumbnails              */}
        {/* ============================================================= */}
        <div className="relative bg-[#181818] flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-[#E5E5E5]">
          {/* Main Portrait Media Frame */}
          <div className="relative aspect-[3/4] md:h-full w-full overflow-hidden">
            <ImageWithFallback
              src={currentDisplayImage}
              alt={`${product.title} in ${activeColor.name}`}
              aspectRatioClass="aspect-[3/4]"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              fallbackText="AURA"
              fallbackSubtext={product.category}
              priority="high"
            />

            {/* Luxury Status Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-20">
                <LuxuryBadge badge={product.badge} />
              </div>
            )}
          </div>

          {/* Clickable Sharp Thumbnail Selector Row */}
          {images.length > 1 && (
            <div
              className="p-3 bg-white/95 border-t border-[#E5E5E5] flex items-center gap-3 overflow-x-auto"
              role="radiogroup"
              aria-label="Product image angles"
            >
              {images.map((imgSrc, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`View angle ${idx + 1}`}
                    onClick={() => setActiveImageIndex(idx)}
                    data-testid={`modal-thumbnail-${idx}`}
                    className={`relative w-14 h-18 flex-shrink-0 border rounded-none overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0D0D0D] ring-1 ring-[#0D0D0D]'
                        : 'border-[#E5E5E5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* RIGHT COLUMN: Product Details, Matrix, Stepper & Add to Bag   */}
        {/* ============================================================= */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header: Subtitle, Title, Price */}
            <div className="space-y-2 border-b border-[#E5E5E5] pb-5 pr-10">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
                <p id="modal-product-subtitle" className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#707070] font-medium">
                  {product.subtitle || product.category.replace('-', ' ')}
                </p>
              </div>

              <h2
                id="modal-product-title"
                data-testid="modal-title"
                className="font-serif text-2xl sm:text-3xl text-[#0D0D0D] font-normal uppercase tracking-tight"
              >
                {product.title}
              </h2>

              <p
                data-testid="modal-price"
                className="font-sans text-lg font-medium text-[#0D0D0D] tracking-wider pt-1"
              >
                {formatPrice(product.price, currentCurrency)}
              </p>
            </div>

            {/* Colorway Swatches with Pale Gold Active Ring */}
            {colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] font-semibold">
                    Color: <span className="font-normal text-[#707070]">{activeColor.name}</span>
                  </span>
                </div>
                <div
                  className="flex items-center gap-2.5"
                  role="radiogroup"
                  aria-label="Color selections"
                >
                  {colors.map((c, idx) => {
                    const isSelected = idx === selectedColorIndex;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Select ${c.name} color`}
                        onClick={() => {
                          setSelectedColorIndex(idx);
                          setActiveImageIndex(0);
                        }}
                        data-testid={`modal-color-${idx}`}
                        className={`w-7 h-7 rounded-none border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0D0D0D] ring-2 ring-[#D4AF37] ring-offset-2 scale-105'
                            : 'border-[#D1D1D1] hover:border-[#0D0D0D]'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector Matrix (XS, S, M, L, XL) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] font-semibold">
                  Size: <span className="font-normal text-[#707070]">{selectedSize || 'Select a size'}</span>
                </span>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#707070] underline cursor-pointer hover:text-[#0D0D0D]">
                  Size Guide
                </span>
              </div>

              <div
                className="grid grid-cols-5 gap-2"
                role="radiogroup"
                aria-label="Available sizes"
              >
                {(product.sizes || ['XS', 'S', 'M', 'L', 'XL']).map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Select size ${sz}`}
                      onClick={() => {
                        setSelectedSize(sz);
                        setValidationError(false);
                      }}
                      data-testid={`modal-size-${sz}`}
                      className={`py-3 text-xs font-sans font-medium uppercase tracking-widest border rounded-none transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                          : 'bg-white text-[#0D0D0D] border-[#E5E5E5] hover:border-[#0D0D0D]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper (1 to 10) & Stock Indicator */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] font-semibold">
                  Quantity
                </span>
                <span className="text-[11px] font-sans tracking-widest uppercase text-[#707070]">
                  {product.stock <= 5 ? (
                    <span className="text-[#D4AF37] font-semibold">Only {product.stock} Remaining</span>
                  ) : (
                    'In Stock'
                  )}
                </span>
              </div>

              <div className="inline-flex items-center border border-[#E5E5E5] bg-white">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  data-testid="stepper-decrement"
                  className="p-3 text-[#0D0D0D] hover:bg-[#F5F5F3] disabled:opacity-30 disabled:hover:bg-transparent rounded-none transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  data-testid="stepper-value"
                  className="px-5 text-xs font-mono font-medium text-[#0D0D0D]"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= 10 || quantity >= product.stock}
                  aria-label="Increase quantity"
                  data-testid="stepper-increment"
                  className="p-3 text-[#0D0D0D] hover:bg-[#F5F5F3] disabled:opacity-30 disabled:hover:bg-transparent rounded-none transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Missing Size Validation Alert */}
            {validationError && (
              <div
                role="alert"
                aria-live="assertive"
                data-testid="modal-validation-error"
                className="p-3 bg-[#BA1A1A]/5 border border-[#BA1A1A] text-[#BA1A1A] flex items-center gap-2 text-xs font-sans font-medium"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Please select a size to proceed.</span>
              </div>
            )}

            {/* Primary Action Button: ADD TO BAG */}
            <div>
              <button
                type="button"
                onClick={handleAddToBag}
                data-testid="modal-add-to-bag-btn"
                className={`w-full py-4 px-6 text-xs font-sans font-semibold tracking-[0.25em] uppercase rounded-none flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                  isAdded
                    ? 'bg-[#D4AF37] text-[#0D0D0D] border border-[#D4AF37]'
                    : 'bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] border border-[#0D0D0D] hover:border-[#D4AF37]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    <span>Add to Bag • {formatPrice(product.price * quantity, currentCurrency)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Editorial Description & Details */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-3 text-xs text-[#707070] font-sans leading-relaxed">
              <p>{product.description}</p>
              {product.details && product.details.length > 0 && (
                <ul className="space-y-1.5 list-disc list-inside pt-2 text-[#0D0D0D]/80">
                  {product.details.map((detail, dIdx) => (
                    <li key={dIdx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
```

---

## 9. Integration Blueprint with `src/App.tsx` and `ProductCard.tsx`

Currently in `App.tsx`:
- `handleOpenProductModal` is a placeholder logging to console (`console.log('Open product modal:', product.title, color.name)`).
- `ProductGrid` passes `onSelectProduct` to `ProductCard`.
- `ProductCard` fires `onSelectProduct(product, activeColor)` when the card is clicked or activated with Enter/Space.

### Integration Steps for Implementer:
1. In `src/App.tsx`:
   - Declare modal state:
     ```tsx
     const [modalProduct, setModalProduct] = useState<Product | null>(null);
     const [modalColor, setModalColor] = useState<ProductColor | null>(null);
     ```
   - Wire `handleOpenProductModal`:
     ```tsx
     const handleOpenProductModal = (product: Product, color: ProductColor) => {
       setModalProduct(product);
       setModalColor(color);
     };
     ```
   - Wire `handleAddToCart` from modal:
     ```tsx
     const handleAddToCartFromModal = (item: { product: Product; color: ProductColor; size: string; quantity: number }) => {
       setCartCount((prev) => prev + item.quantity);
       // M4 CartContext integration will invoke cart dispatch here
     };
     ```
   - Render `ProductModal` at the root of `App.tsx`:
     ```tsx
     <ProductModal
       isOpen={!!modalProduct}
       product={modalProduct}
       initialColor={modalColor}
       currentCurrency={currency}
       onClose={() => setModalProduct(null)}
       onAddToCart={handleAddToCartFromModal}
     />
     ```

---

## 10. Test Strategy & Verification Matrix

The test suite must exhaustively verify the five core accessibility and interaction pillars:

| Test Scenario | Verification Target | Assertion Method |
|---|---|---|
| **1. Accessibility Semantics** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` | `screen.getByRole('dialog')`, verifying attribute values match DOM heading IDs |
| **2. Escape Dismissal** | Pressing `{Escape}` dismisses modal | `fireEvent.keyDown(window, { key: 'Escape' })` calls `onClose` mock |
| **3. Backdrop Dismissal** | Clicking backdrop overlay triggers `onClose` | `fireEvent.click(screen.getByTestId('modal-backdrop'))` calls `onClose` |
| **4. Drag-Safe Protection** | Mousedown inside card + mouseup on backdrop does NOT dismiss | Mousedown on dialog, mouseup on backdrop -> `expect(onClose).not.toHaveBeenCalled()` |
| **5. Focus Trapping** | Tab cycles within modal, Shift+Tab wraps back | Asserting `document.activeElement` stays confined between first and last focusable elements |
| **6. Focus Restoration** | Trigger element regains focus on close | Asserting `triggerButton.focus` was invoked upon unmount |
| **7. Body Scroll Lock** | `document.body.style.overflow` becomes `'hidden'` | `expect(document.body.style.overflow).toBe('hidden')`; reverts to `''` on close |
| **8. Scrollbar Compensation** | Padding right added when scrollbar width > 0 | Testing calculation logic and style mutation |
| **9. Responsive Sheet vs 2-Col** | Layout renders with proper grid and mobile sheet styling | Checking classes `md:grid-cols-2`, `rounded-none`, `max-h-[92dvh]` |
