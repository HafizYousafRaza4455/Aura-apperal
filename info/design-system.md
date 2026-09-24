# Luxury Design System & Visual Identity — Aura Apparel

## 1. Aesthetic Philosophy

Aura Apparel is grounded in **architectural minimalism** and **high-fashion editorial typography**. Inspired by European ateliers in Milan and Paris, the interface treats every garment as an objet d'art.

Core tenets of the visual identity:
1. **Uncompromising Geometry:** Strict 0px border radius across all elements (`rounded-none`). Every button, modal, card, and input features razor-sharp architectural edges.
2. **Generous Whitespace:** Breathable layouts allow photography and garment silhouettes to command attention without visual clutter.
3. **Restrained Luxury Palette:** Deep Obsidian contrast anchored by subtle Pale Gold accents and pure Cloud White backdrops.

---

## 2. Color Palette & Design Tokens

```text
┌───────────────────────┬───────────┬──────────────────────────────────────────┐
│ Token Name            │ Hex Value │ Semantic Role                            │
├───────────────────────┼───────────┼──────────────────────────────────────────┤
│ Obsidian (Primary)    │ #0D0D0D   │ Wordmark, primary buttons, dark canvases │
│ Pale Gold (Accent)    │ #D4AF37   │ Exclusive badges, VIP highlights, hover  │
│ Cloud White (Base)    │ #FBFBFB   │ Primary storefront background canvas     │
│ Pure White            │ #FFFFFF   │ Product card backgrounds, image mounts   │
│ Slate Gray (Muted)    │ #707070   │ Secondary metadata, subtitles, labels    │
│ Hairline Border       │ #E5E5E5   │ 1px subtle divider lines (light mode)    │
│ Obsidian Border       │ #1F1F1F   │ 1px architectural borders (dark mode)    │
└───────────────────────┴───────────┴──────────────────────────────────────────┘
```

### CSS Variables Definition (`app/globals.css`)
```css
:root {
  --color-obsidian: #0D0D0D;
  --color-pale-gold: #D4AF37;
  --color-cloud-white: #FBFBFB;
  --color-slate-gray: #707070;
  --color-border-hairline: #E5E5E5;
  --font-display: "Bodoni Moda", serif;
  --font-body: "Hanken Grotesk", sans-serif;
}
```

---

## 3. Typography Hierarchy

| Role | Font Family | Size / Leading | Weight | Letter Spacing | Example Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | *Bodoni Moda* | `4.5rem` / `1.1` | Light / 300 | `-0.02em` | Campaign headline ("The Autumn Capsule") |
| **Section Title** | *Bodoni Moda* | `2.5rem` / `1.2` | Regular / 400 | `-0.01em` | "Curated Outerwear" |
| **Brand Wordmark** | *Bodoni Moda* | `1.75rem` | Medium / 500 | `0.15em` | "A U R A" navigation logo |
| **Subheadings** | *Hanken Grotesk* | `1.125rem` / `1.4`| Regular / 400 | `0.02em` | Product subtitles, narrative intros |
| **Body Text** | *Hanken Grotesk* | `0.938rem` / `1.6`| Light / 300 | `0.01em` | Garment descriptions, care guides |
| **Micro / Badges** | *Hanken Grotesk* | `0.688rem` / `1.0`| SemiBold / 600 | `0.18em` | `EXCLUSIVE`, `NEW ARRIVAL` |
| **Numeric & SKU** | *Hanken Grotesk* | `0.875rem` / `1.0`| Regular / 400 | `0.05em` | Price points (`$890.00`), SKU codes |

---

## 4. UI Component Specifications

### A. Architectural Buttons
- **Shape:** 0px radius (`rounded-none`).
- **Primary Action (Obsidian):**
  - Background: `#0D0D0D`
  - Text: `#FBFBFB`, uppercase, letter-spacing `0.12em`
  - Hover: Background shifts to `#262626` with smooth 200ms transition.
- **Secondary Action (Wireframe):**
  - Background: Transparent
  - Border: 1px solid `#0D0D0D`
  - Hover: Inverts to solid `#0D0D0D` with `#FFFFFF` text.

### B. Product Cards
- **Structure:** Vertical stack with image container top, minimal text details bottom.
- **Aspect Ratio:** `3:4` portrait ratio optimal for human silhouette and full-length tailoring.
- **Hover Micro-interaction:** Image scales up by `1.03x` over 400ms cubic-bezier transition, revealing the secondary lookbook angle if available.
- **Price Presentation:** Clean monetary display without currency symbols cluttering the layout (`890 USD` or `$890`).

### C. Luxury Status Badges
- Displayed in the top-left or top-right corner of garment cards.
- **Styling:** Minimalist pill border (1px solid `#D4AF37`), uppercase text in Pale Gold, no heavy filled backgrounds.

### D. Cart Drawer
- **Dimensions:** Fixed 480px width on desktop; 100vw on mobile.
- **Overlay Backdrop:** `rgba(0, 0, 0, 0.65)` with CSS backdrop-blur (`backdrop-blur-sm`).
- **Dividers:** Crisp 1px `#E5E5E5` hairline borders separating line items.
- **Checkout CTA:** Pinned full-width Obsidian button at drawer bottom.

---

## 5. Responsive Breakpoint Standards

```text
┌───────────────┬───────────────────────────────┐
│ Breakpoint    │ Viewport Dimensions           │
├───────────────┼───────────────────────────────┤
│ Mobile (sm)   │ < 640px (1-column grid)       │
│ Tablet (md)   │ 640px – 1023px (2-column)     │
│ Desktop (lg)  │ 1024px – 1439px (3-column)    │
│ Cinema (xl)   │ 1440px+ (4-column wide grid)  │
└───────────────┴───────────────────────────────┘
```
