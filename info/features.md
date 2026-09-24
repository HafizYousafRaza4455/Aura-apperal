# Features & Functional Specifications — Aura Apparel

This document details every major user-facing and administrative feature within Aura Apparel, outlining user journeys, behavior, and technical execution.

---

## 1. Editorial Storefront

The storefront embodies modern high-fashion luxury minimalism, blending clean editorial grids with reactive e-commerce elements.

### A. Full-Bleed Hero Section
- **Visuals:** High-resolution editorial photography highlighting signature runway pieces.
- **Copy:** High-contrast serif headlines in *Bodoni Moda*, minimalist sub-headlines, and dual calls-to-action:
  - *Explore Curated Drops* (scrolls to catalog).
  - *Read Brand Story* (navigates to craftsmanship module).
- **Responsive Treatment:** Fluid aspect ratio scaling from ultra-wide 4K displays down to compact mobile viewports without image distortion.

### B. Curated Category Filters
- **Categories Supported:**
  - `OUTERWEAR`: Italian wool topcoats, tailored trench coats, sculptural blazers.
  - `ESSENTIALS`: Heavyweight organic pima cotton tees, cashmere crewnecks, structured trousers.
  - `SUMMER_DROP`: Breathable linen sets, silk resort shirts, lightweight poplin shorts.
- **Filtering Behavior:** Instant client-side state filtering without page reload. URL parameter synchronization allows direct deep-linking (e.g., `/?category=outerwear`).

### C. Trending Product Cards
- **Luxury Badges:** Contextual pill badges rendered in Pale Gold or Obsidian:
  - `EXCLUSIVE`: Limited release atelier drops.
  - `NEW ARRIVAL`: Fresh additions to the current collection.
  - `BESTSELLER`: High-demand staple pieces.
  - `SUMMER DROP`: Seasonal capsule collection items.
- **Card Interactions:** Subtle image zoom on hover, secondary photo flip on hover, clear monetary display in USD, and a 1-click **Quick Buy** action that opens the sizing modal.

### D. Brand Story & Craftsmanship Showcase
- Architectural layout featuring atelier photography and narrative copy focusing on:
  - Ethically sourced Mongolian cashmere and Japanese selvedge denim.
  - Hand-finished seam construction in Milanese workshops.
  - Zero-waste packaging and carbon-neutral express delivery.

---

## 2. Interactive Product Detail Modal

Clicking any product card or quick-buy trigger summons the luxury product inspection modal:

- **Colorway Swatches:** Circular swatches reflecting physical garment dyes (e.g., Obsidian Black, Raw Titanium, Alabaster White, Camel). Clicking a swatch dynamically switches the displayed photograph.
- **Size Selector:** Architectural square buttons (`XS`, `S`, `M`, `L`, `XL`, `ONE SIZE`). Unavailable sizes are visibly struck-through and disabled based on real-time stock.
- **Fabrication & Care Accordion:** Expanding specifications covering fabric composition, model sizing benchmarks, and atelier dry-cleaning guidance.
- **Cart Handoff:** Adding to cart triggers subtle micro-animations and automatically opens the Cart Drawer.

---

## 3. Persistent Slide-Out Cart Drawer

The cart drawer resides on the right edge of the screen, accessible from any route via the persistent navigation header.

- **Persistent Local State:** Cart contents are saved in `localStorage` (`aura_cart_v1`), preserving user selections across sessions.
- **Quantity Adjustments:** Steppers to increase, decrease, or remove items with automatic quantity clamping.
- **Luxury Shipping Progress:** Visual threshold tracker displaying remaining cart value needed to unlock complimentary worldwide white-glove shipping.
- **Real-Time Price Breakdown:**
  - `Subtotal`: Sum of all line items.
  - `Estimated Tax`: Calculated automatically.
  - `Shipping`: Free or flat-rate luxury courier based on threshold.
  - `Estimated Total`: Final payable amount.
- **Atomic Checkout Trigger:** Initiates the 10-minute inventory hold and routes directly to the Stripe checkout pipeline.

---

## 4. Instant Command Palette Search (`Cmd + K`)

- **Trigger:** Accessible via the keyboard shortcut `Cmd + K` (macOS) / `Ctrl + K` (Windows/Linux) or the magnifying glass icon in the header.
- **Debounced Fetch:** Submits debounced queries to `/api/search` (250ms debounce) to prevent unnecessary database load.
- **Faceted Matching:** Matches across product titles, subtitles, luxury fabrication details, categories, and SKU identifiers.
- **Keyboard Navigation:** Full arrow-key navigation, `Enter` to select, and `Escape` to close.

---

## 5. Stripe Checkout & Order Fulfillment

- **Session Creation:** Calls `/api/checkout/session` which secures the 10-minute inventory reservation before redirecting to Stripe.
- **Hosted Payment Elements:** Supports Credit Cards, Apple Pay, Google Pay, and regional payment methods.
- **Success Page (`/checkout/success`):** Displays unique order numbers (e.g., `AUR-2026-9481`), line item recaps, delivery timelines, and customer support links.
- **Webhook Processing:** Automatic stock decrement upon receiving `payment_intent.succeeded`.

---

## 6. Atelier Admin Portal (`/admin` & `/atelier-admin`)

Designed specifically for atelier managers, merchandisers, and fulfillment coordinators:

- **Staff Authentication:** Dedicated login barrier with JWT session cookies and brute-force lockout defense.
- **Inventory Matrix:**
  - View physical units in stock vs. active customer checkout reservations.
  - Real-time stock updater with instant database synchronization via `/api/admin/inventory`.
  - Multi-warehouse tracking (defaulting to `MILAN_ATELIER`).
- **Order Lifecycle Management:**
  - Status updates: `PENDING` ➔ `PAID` ➔ `FULFILLED` ➔ `CANCELLED`.
  - Customer shipping details and order item inspections.

---

## 7. Customer Account & Bespoke Measurements (`/account`)

- **Profile Management:** Name, contact email, and avatar customization.
- **Address Book:** Primary and secondary delivery locations with default selection toggles.
- **Bespoke Atelier Sizing:** Custom storage for tailored measurements (Chest, Waist, Sleeve Length, Inseam) used by atelier tailors for complimentary alterations.
- **Order History:** Historical archive of completed purchases with downloadable receipts.
