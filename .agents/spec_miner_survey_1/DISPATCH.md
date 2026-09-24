# Dispatch Assignment: Spec Miner (Survey Phase)

## Context
Project: Aura Apparel luxury minimalist web storefront.
Workspace: C:\Users\YC\teamwork_projects\aura_apparel
Your working directory: C:\Users\YC\teamwork_projects\aura_apparel\.agents\spec_miner_survey_1
Authoritative request: C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md

## Objectives
1. Read `C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md`.
2. Check StitchMCP tools (e.g. list_projects, list_screens, get_project, get_screen) to find if there are any existing Stitch projects, screens, or design system tokens defined for Aura Apparel.
3. Enumerate all required features, screens, UI sections, components, interactive behaviors, and design tokens (Obsidian #0D0D0D, Pale Gold #D4AF37, Cloud White, 0px border geometry, Bodoni Moda, Hanken Grotesk).
4. Identify all explicit and implicit acceptance criteria, functional requirements, and edge cases.
5. Produce a comprehensive report in `C:\Users\YC\teamwork_projects\aura_apparel\.agents\spec_miner_survey_1\spec_report.md` and write your handoff in `handoff.md`.

## 2026-09-03T10:28:50Z
You are a Spec Miner for the Aura Apparel project.
Your working directory is: C:\Users\YC\teamwork_projects\aura_apparel\.agents\spec_miner_survey_1
Authoritative user request: C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md
Your dispatch instructions are at: C:\Users\YC\teamwork_projects\aura_apparel\.agents\spec_miner_survey_1\DISPATCH.md

Read ORIGINAL_REQUEST.md.
Investigate StitchMCP tools (list_projects, list_screens, get_screen, get_project) to check for any existing Aura Apparel Stitch designs or design system specifications.
Enumerate all required features, UI sections, interactive components, tokens, and acceptance criteria.
Write your detailed report to C:\Users\YC\teamwork_projects\aura_apparel\.agents\spec_miner_survey_1\spec_report.md and deliver a self-contained handoff.md in your working directory.
When finished, send a message to parent with your findings and path to handoff.md.

---

# SPEC MINER FINDINGS & HANDOFF REPORT

## 1. Specification Sources
- **ORIGINAL_REQUEST.md**: `C:\Users\YC\teamwork_projects\aura_apparel\ORIGINAL_REQUEST.md`
- **StitchMCP Project**: `projects/1649573855586710770` ("Aura Apparel - Clothing Brand")
- **StitchMCP Design System**: `assets/a9c56d1a72094d4a9dab8c50640ee2fc` ("Aura Apparel")
- **Brain Reports**:
  - `C:\Users\YC\.gemini\antigravity\brain\9c83e474-a6eb-4bc3-bdc8-a7a8a47909ee\spec_report.md`
  - `C:\Users\YC\.gemini\antigravity\brain\9c83e474-a6eb-4bc3-bdc8-a7a8a47909ee\handoff.md`

## 2. Design System Tokens (StitchMCP Authoritative Specification)
- **Colors**:
  - Primary (Obsidian): `#0D0D0D` (High-emphasis text, primary buttons, borders, wordmark)
  - Secondary (Pale Gold): `#D4AF37` (Exclusive badges, VIP tags, micro-accents, progress bar)
  - Tertiary (Cloud White): `#FBF9F9` (Main page canvas background, eliminates glare)
  - Pure White: `#FFFFFF` (Surface container lowest, card backgrounds, modal background)
  - Slate Grey / Neutral: `#707070` (Secondary metadata, dividers, specs)
  - Low-Contrast Borders: `#C4C7C7` / `#E0E0E0` (1px architectural outlines)
  - On-Surface Text: `#1B1C1C` (High readability body ink)
  - Error: `#BA1A1A` (Validation errors)
- **Typography**:
  - Headlines & Displays: **Bodoni Moda** (`display-lg: 72px/80px -0.02em`, `display-lg-mobile: 48px/52px`, `headline-lg: 40px/48px`, `headline-md: 24px/32px`)
  - Body & Navigation: **Hanken Grotesk** (`body-lg: 18px/28px`, `body-md: 16px/24px`, `label-sm: 12px/16px +0.1em uppercase`)
- **Geometry & Elevation**:
  - Strictly **0px border-radius** across all buttons, inputs, chips, modal, cards, and drawers.
  - **Zero drop shadows** (`box-shadow: none`); depth achieved purely via flat layering and 1px borders.
- **Layout & Spacing**:
  - Desktop Max Width: `1440px`, Desktop Margins: `64px`, Desktop Gutters: `24px`
  - Mobile Margins: `20px`
  - Vertical Spacing: `stack-xl: 120px`, `stack-lg: 80px`, `stack-md: 40px`

## 3. Features Discovered (34 Features)
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Sticky Editorial Header | Fixed header with transparent background transitioning to Cloud White (`#FBF9F9`) + 1px border upon scrolling. | Scroll position (>50px) | Translucent/Cloud White background, border reveal | None | Stitch Design Theme & ORIGINAL_REQUEST R1 |
| 2 | Navigation | Brand Wordmark | Prominent "AURA APPAREL" logo in Bodoni Moda serif, tight kerning, uppercase. | Click event | Resets filters, smooth scrolls to top | None | ORIGINAL_REQUEST R1 |
| 3 | Navigation | Desktop Menu Links | Links: Collections, Outerwear, Essentials, Summer Drop, Brand Story. Uppercase Hanken Grotesk with 0.1em letter spacing. | Click event | Smooth scrolls to section or triggers category filter | None | ORIGINAL_REQUEST R1 |
| 4 | Navigation | Responsive Mobile Drawer | Collapsible mobile hamburger menu for viewports <768px with full-screen or slide-down navigation links. | Hamburger icon tap | Opens drawer with nav items and search trigger | Auto-closes on link tap | ORIGINAL_REQUEST R1 & Acceptance Criteria |
| 5 | Navigation | Cart Trigger & Badge | Header bag icon showing live item count and Pale Gold accent dot when cart has items. | Cart state updates, click event | Opens slide-out cart drawer | Badge shows 0 when empty | ORIGINAL_REQUEST R1 & R2 |
| 6 | Hero Section | Editorial Full-Bleed Hero | Immersive hero banner featuring high-fashion photography, oversized Bodoni Moda headline ("THE FORM OF STILLNESS"), and narrative copy. | None (viewport render) | Responsive editorial visual composition | Image fallback placeholder | ORIGINAL_REQUEST R1 & Stitch Design System |
| 7 | Hero Section | Primary CTA Button | "EXPLORE COLLECTION" / "SHOP THE DROP" button in solid Obsidian with 0px sharp geometry. | Click event | Smooth scrolls to Curated Collections / Catalog | None | ORIGINAL_REQUEST R1 |
| 8 | Collections | Curated Category Showcase | 3 distinct visual editorial category cards: Outerwear, Essentials, Summer Drop. | None / Click event | Displays image, title, item count; clicking filters catalog | None | ORIGINAL_REQUEST R1 |
| 9 | Collections | Category Card Hover Interaction | Subtle 1.03x scale zoom on image with 1px border highlight on hover. | Mouse enter/leave | Smooth 400ms transition | None | Stitch Design Theme Components |
| 10 | Catalog | Dynamic Category Filter Tabs | Filter chips: ALL PIECES, OUTERWEAR, ESSENTIALS, SUMMER DROP. Active tab filled with Obsidian. | Tab selection click | Instantly filters rendered product grid | Shows all if empty filter | ORIGINAL_REQUEST R2 |
| 11 | Catalog | Sort & Arrangement Selector | Sort dropdown (Featured, Price Low-to-High, Price High-to-Low, New Arrivals). | Select change | Reorders product cards with smooth transition | Fallback to Featured | User Experience Best Practice |
| 12 | Catalog | Responsive Product Grid | 4-column (desktop), 2-column (tablet), 1-column (mobile) grid displaying product cards with 0px sharp images. | Window resize, product data | Fluid layout without horizontal overflow | None | ORIGINAL_REQUEST R1 & Acceptance Criteria |
| 13 | Catalog | Product Card Hover Flip | Secondary angle/lifestyle image fades in or zooms on hover. | Mouse enter/leave | Image cross-fade | Fallback to primary image | Stitch Components Specification |
| 14 | Catalog | Luxury Status Badges | Sharp 0px chips for "EXCLUSIVE", "NEW ARRIVAL", "LIMITED" in Pale Gold (`#D4AF37`) or Obsidian. | Product data flags | Rendered at top-left of image card | Omitted if unflagged | Stitch Design Theme & ORIGINAL_REQUEST |
| 15 | Catalog | Quick Add / Direct Buy | Hover button or quick-action icon to immediately add default variant to cart. | Button click | Item added to cart, cart badge pulses, drawer opens | Out-of-stock disabled | ORIGINAL_REQUEST R1 & R2 |
| 16 | Product Detail | Quick View Product Modal | Full-screen overlay modal with 0px sharp card displaying product gallery, title, price, description, and variant selectors. | Card click / Quick View click | Modal opens with backdrop blur, focus trapped | Escape key / click outside closes | ORIGINAL_REQUEST R2 |
| 17 | Product Detail | Multi-Angle Gallery | Main high-res product photo with sharp thumbnail selectors (front, back, fabric detail). | Thumbnail click | Updates main active image | Fallback placeholder | Stitch Components Specification |
| 18 | Product Detail | Size Selector Matrix | 0px sharp rectangular size chips (XS, S, M, L, XL). Selected size turns Obsidian. | Size chip click | Updates selected size state | Disabled if size unavailable | Stitch Components & ORIGINAL_REQUEST R2 |
| 19 | Product Detail | Color Swatch Selector | Color circle/square swatches with Pale Gold ring indicator on active selection. | Swatch click | Updates selected color and image angle | Fallback to first color | ORIGINAL_REQUEST R2 |
| 20 | Product Detail | Quantity Stepper | Increment (+) and decrement (-) buttons with 0px geometry and min=1 limit. | Button clicks | Updates quantity count and total price preview | Clamped between 1 and 10 | ORIGINAL_REQUEST R2 |
| 21 | Product Detail | Add to Bag CTA | High-emphasis Obsidian button adding custom variant configuration to cart with animated state change ("ADDED TO BAG"). | CTA click | Adds to cart, triggers drawer slide-in | Requires size selection | ORIGINAL_REQUEST R2 |
| 22 | Cart Drawer | Slide-Out Cart Drawer | Slide-in drawer from right (440px on desktop, 100vw on mobile) with semi-transparent dark backdrop. | Cart trigger click / Add to Bag | Smooth CSS slide animation | Close button / Esc closes | ORIGINAL_REQUEST R2 |
| 23 | Cart Drawer | Complimentary Shipping Meter | Progress bar calculating remaining spend to unlock free worldwide shipping ($300 threshold). | Live subtotal | Visual Pale Gold progress bar and remaining amount readout | 100% shows "Unlocked!" | Luxury UX Best Practice |
| 24 | Cart Drawer | Cart Item Management | List of items showing thumbnail, title, selected size, color, unit price, quantity stepper, and remove button. | Stepper clicks, remove click | Line item updates; removes item if qty=0 | Recalculates total immediately | ORIGINAL_REQUEST R2 |
| 25 | Cart Drawer | Cart Item Deduplication | Intelligently increments quantity of existing line item if product ID, size, and color match. | Add to cart with identical options | Increments quantity rather than duplicate row | None | UX / Cart Integrity |
| 26 | Cart Drawer | Live Price Calculation | Real-time calculation of Subtotal, Estimated Shipping, Tax, and Final Total. | Cart mutations | Immediate numerical recalculation | Formatted in currency ($) | ORIGINAL_REQUEST R2 |
| 27 | Cart Drawer | Promo Code Engine | Input field with "APPLY" button; supports codes like "AURA10" for 10% discount. | Text input + Apply click | Applies discount line item and updates grand total | "Invalid code" alert | E-commerce Best Practice |
| 28 | Cart Drawer | Empty State Experience | Typographic layout ("YOUR BAG IS EMPTY") with "EXPLORE PIECES" button to return to catalog. | Zero items in cart | Hides checkout, shows empty graphic & CTA | None | UX Edge Case Requirement |
| 29 | Cart Drawer | State Persistence | All cart contents, variant choices, and promo codes saved in `localStorage`. | Any cart mutation | Persisted in browser storage across reloads | Corrupted storage safely resets | ORIGINAL_REQUEST R2 |
| 30 | Cart Drawer | Proceed to Checkout | Primary CTA button leading to mock checkout or order confirmation modal. | Button click | Launches checkout flow or confirmation modal | Disabled if cart empty | ORIGINAL_REQUEST R2 |
| 31 | Brand Story | Craftsmanship Manifesto | Asymmetrical editorial section featuring Bodoni Moda headers, high-fashion imagery, and brand values. | None (viewport render) | Renders 3 pillars: Architectural Precision, Rare Textiles, Atelier Ethos | None | ORIGINAL_REQUEST R1 |
| 32 | Footer | Newsletter Subscription | 0px sharp input field with "SUBSCRIBE" button and live validation feedback. | Email address input | Displays luxury confirmation message | Validates email syntax | ORIGINAL_REQUEST R1 |
| 33 | Footer | Multi-Column Directory | Links to Collections, Client Concierge, Legal & Compliance, and Atelier info. | Link clicks | Smooth scroll or navigation | None | ORIGINAL_REQUEST R1 |
| 34 | Footer | Currency Selector | Dropdown supporting USD, EUR, GBP, JPY. | Currency change | Updates currency symbol across all storefront prices | None | Luxury Global Requirement |

## 4. Edge Cases Discovered
| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Cart Drawer | Initial load or removing last item | Cart displays empty state: "YOUR BAG IS EMPTY" with "DISCOVER PIECES" CTA. Checkout button hidden/disabled. |
| 2 | Cart Quantity | Decrementing item with quantity = 1 | Item is removed from the cart cleanly; subtotal immediately updates; if cart is now empty, empty state renders. |
| 3 | Cart Quantity | Incrementing item to > 10 units | Quantity is clamped at 10 (maximum luxury allocation); tooltip: "Maximum order limit reached". |
| 4 | Product Detail | User clicks "ADD TO BAG" without selecting a size | Size selector chips highlight in Obsidian/Gold with text "Please select a size". |
| 5 | Product Deduplication | Adding product with same ID, same size, same color | Existing line item quantity is incremented by 1; no duplicate row created. |
| 6 | Product Variation | Adding product with same ID but different size or color | Treated as a distinct cart line item with separate variant labels and independent quantity controls. |
| 7 | Promo Code | Entering invalid or expired code | Red error text appears: "Promo code not recognized"; total remains untouched. |
| 8 | Promo Code | Entering valid code "AURA10" | Deducts 10% from subtotal; displays line item "-$XX.XX (AURA10)"; disables duplicate submission. |
| 9 | Newsletter Input | Submitting empty or malformed email | Prevents submit; highlights input border in `#BA1A1A`; displays "Please enter a valid email address". |
| 10 | Newsletter Input | Submitting valid email | Replaces input with confirmation: "Thank you for joining our private register. A formal dispatch has been sent." |
| 11 | Viewport Responsiveness | Resize from 1440px down to 375px | Desktop 12-column grid collapses to 4-column; product grid collapses to 1 or 2-column; drawer expands to 100vw; fonts scale down per mobile tokens. |
| 12 | State Persistence | Corrupted or unparseable `localStorage` data | `try/catch` block catches JSON parse errors, resets cart state safely to `[]` without uncaught exceptions. |
| 13 | Rapid Click Debounce | User rapidly clicks "Add to Bag" 5 times in 200ms | Button is debounced or disabled during addition animation; quantity increments reliably. |
| 14 | Modal Accessibility | Pressing `Escape` or clicking backdrop | Product detail modal closes cleanly; focus returns to triggering card; background scroll lock released. |

## 5. 5-Component Handoff Summary
- **Observation**: Inspected `ORIGINAL_REQUEST.md` (R1-R3) and StitchMCP `projects/1649573855586710770` (Title: "Aura Apparel - Clothing Brand", Design System: `assets/a9c56d1a72094d4a9dab8c50640ee2fc`).
- **Logic Chain**: Synthesized visual tokens (Obsidian `#0D0D0D`, Pale Gold `#D4AF37`, Cloud White `#FBF9F9`, 0px border radius, no drop shadows, Bodoni Moda + Hanken Grotesk typography) into an actionable 8-part UI architecture, 34-feature matrix, and 14 edge cases.
- **Caveats**: Stitch project is `PROJECT_DESIGN` (pure design system tokens without pre-rendered canvas screens). Curated product images will use high-end minimalist fashion assets matching the palette.
- **Conclusion**: Specification mining is complete. The storefront architecture, tokens, catalog dataset, and acceptance criteria are thoroughly documented.
- **Verification Method**: Check `spec_report.md` in brain directory or verify directly against StitchMCP `get_project(name="projects/1649573855586710770")`.

