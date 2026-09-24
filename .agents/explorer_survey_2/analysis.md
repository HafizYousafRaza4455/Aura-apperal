# Product Catalog Schema, Cart State Architecture & Responsive UX Analysis

**Project**: Aura Apparel — Luxury Minimalist Web Storefront  
**Author**: `explorer_survey_2`  
**Date**: 2026-09-03  
**Status**: Comprehensive Architectural Specification & Survey  

---

## 1. Executive Summary & Design System Foundations

Aura Apparel is an ultra-curated, luxury minimalist clothing brand inspired by high-end Scandinavian and Japanese architectural fashion houses (reminiscent of Jil Sander, The Row, Lemaire, and Fear of God). The storefront must convey restraint, exclusivity, and structural refinement.

### 1.1 Core Visual Identity & Design Tokens

Every component in the catalog, cart, and responsive layout must strictly adhere to the following design tokens:

| Token Category | Value | Application / Rationale |
| :--- | :--- | :--- |
| **Primary Color** | Obsidian `#0D0D0D` (`rgb(13, 13, 13)`) | Primary text, primary CTA buttons, dark overlays, brand wordmark |
| **Accent Color** | Pale Gold `#D4AF37` (`rgb(212, 175, 55)`) | Exclusive badges, hover highlights, active selection indicators, subtle borders |
| **Background Color** | Cloud White `#FAFAFA` / `#FFFFFF` | Main background, modal surface, crisp contrast against Obsidian |
| **Muted Grayscale** | Stone `#737373`, Border `#E5E5E5`, Warm Neutral `#F5F5F3` | Secondary text, subtle dividers, empty state backgrounds |
| **Geometry** | **Strict 0px Border Radius** (`rounded-none` / `border-radius: 0px`) | Non-negotiable architectural minimalism; all buttons, cards, modals, swatches, and inputs must have razor-sharp 90-degree corners. No rounded pill buttons. |
| **Display Typography** | `Bodoni Moda` (Serif, italic accents) | Hero headlines, collection titles, product modal titles, section headers |
| **Body Typography** | `Hanken Grotesk` (Geometric Sans-Serif) | Navigation links, pricing, body copy, size selectors, cart details, utility labels |
| **Motion Curve** | `cubic-bezier(0.16, 1, 0.3, 1)` (300ms - 400ms) | Luxury ease-out: brisk start with long, graceful deceleration |

---

## 2. Product Catalog Schema & Data Architecture

The product catalog requires a resilient, extensible TypeScript data model supporting multi-variant selection (size, color), curated luxury imagery, category categorization, stock badges, and pricing tiers.

### 2.1 TypeScript Type Definitions

```typescript
// ==========================================
// Category & Variant Domain Types
// ==========================================

export type CategoryId = 'all' | 'outerwear' | 'essentials' | 'summer-drop';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  description: string;
  heroImage: string;
}

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface ProductColor {
  name: string;      // e.g. 'Obsidian Black', 'Oatmeal Beige'
  hex: string;       // e.g. '#0D0D0D', '#E8E3DC'
}

export type ProductBadge = 'NEW' | 'EXCLUSIVE' | 'LOW STOCK' | 'BESTSELLER';

export interface ProductVariant {
  id: string;             // Unique variant SKU, e.g. "coat-01-obsidian-m"
  size: ProductSize;
  colorName: string;
  inStock: boolean;
  inventoryCount: number; // For stock-limit validation
}

// ==========================================
// Product Entity Definition
// ==========================================

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: 'outerwear' | 'essentials' | 'summer-drop';
  price: number;
  originalPrice?: number;      // Optional comparison price for sales/archive
  description: string;
  details: string[];           // Bulleted specifications (fabric, tailoring, origin)
  careInstructions: string[];  // Luxury care (e.g. Dry clean only)
  badge?: ProductBadge;
  featured: boolean;           // Displayed in trending/hero quick-buy showcase
  images: {
    primary: string;           // High-resolution editorial portrait (3:4 ratio)
    secondary: string;         // Hover / detail / alternate angle
    gallery?: string[];        // Additional modal gallery views
  };
  colors: ProductColor[];
  sizes: ProductSize[];
  variants: ProductVariant[];
  defaultColor: string;
  defaultSize?: ProductSize;
}
```

### 2.2 Curated Product Inventory Dataset

Below is the complete, production-ready dataset of 12 luxury items spanning all three mandatory categories, using reliable high-resolution Unsplash editorial fashion imagery:

```typescript
export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'all',
    label: 'All Collections',
    description: 'The complete architectural wardrobe for discerning minimalists.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'outerwear',
    label: 'Outerwear',
    description: 'Architectural silhouettes crafted from double-faced wool, cashmere, and technical gabardine.',
    heroImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'essentials',
    label: 'Essentials',
    description: 'Foundational garments tailored with exacting proportions and heavyweight natural fibers.',
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop'
  },
  {
    id: 'summer-drop',
    label: 'Summer Drop',
    description: 'Air-permeable raw silks, lightweight Italian linen, and effortless coastal drapery.',
    heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop'
  }
];

export const PRODUCTS: Product[] = [
  // ----------------------------------------
  // OUTERWEAR (4 items)
  // ----------------------------------------
  {
    id: 'out-001',
    slug: 'oversized-wool-trench',
    name: 'The Oversized Wool Trench',
    subtitle: 'Double-breasted virgin wool with horn buttons',
    category: 'outerwear',
    price: 580,
    badge: 'EXCLUSIVE',
    featured: true,
    description: 'A monument to understated tailoring. Cut from dense 720gsm virgin wool with sharp drop shoulders, extended storm flaps, and unlacquered buffalo horn buttons.',
    details: [
      '100% Virgin Italian Wool (720gsm)',
      'Full cupro lining with interior ticket pocket',
      'Removable self-tie belt with pale gold hardware buckle',
      'Generous back storm flap and center vent',
      'Hand-finished in Milan, Italy'
    ],
    careInstructions: ['Specialist dry clean only', 'Store on broad wooden coat hanger'],
    images: {
      primary: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Camel Tan', hex: '#B89778' },
      { name: 'Slate Grey', hex: '#4A4E51' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultColor: 'Obsidian Black',
    defaultSize: 'M',
    variants: [
      { id: 'out-001-obs-xs', size: 'XS', colorName: 'Obsidian Black', inStock: true, inventoryCount: 4 },
      { id: 'out-001-obs-s', size: 'S', colorName: 'Obsidian Black', inStock: true, inventoryCount: 7 },
      { id: 'out-001-obs-m', size: 'M', colorName: 'Obsidian Black', inStock: true, inventoryCount: 12 },
      { id: 'out-001-obs-l', size: 'L', colorName: 'Obsidian Black', inStock: true, inventoryCount: 5 },
      { id: 'out-001-obs-xl', size: 'XL', colorName: 'Obsidian Black', inStock: false, inventoryCount: 0 },
      { id: 'out-001-cam-s', size: 'S', colorName: 'Camel Tan', inStock: true, inventoryCount: 3 },
      { id: 'out-001-cam-m', size: 'M', colorName: 'Camel Tan', inStock: true, inventoryCount: 6 },
      { id: 'out-001-sla-m', size: 'M', colorName: 'Slate Grey', inStock: true, inventoryCount: 2 }
    ]
  },
  {
    id: 'out-002',
    slug: 'structured-cashmere-blazer',
    name: 'Structured Cashmere Blazer',
    subtitle: 'Single-breasted architectural tailored jacket',
    category: 'outerwear',
    price: 640,
    badge: 'NEW',
    featured: true,
    description: 'Impeccable proportions meet featherweight warmth. Tailored with a clean peak lapel, jetted flap pockets, and subtle canvas shoulder padding.',
    details: [
      '85% Mongolian Cashmere, 15% Mulberry Silk',
      'Half-canvas construction for natural drape',
      'Concealed double vent at posterior hem',
      'Hand-sewn pick stitching along lapels'
    ],
    careInstructions: ['Dry clean with petroleum solvent only', 'Steam lightly with distilled water'],
    images: {
      primary: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Bone White', hex: '#EBE9E4' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    defaultColor: 'Obsidian Black',
    defaultSize: 'L',
    variants: [
      { id: 'out-002-obs-s', size: 'S', colorName: 'Obsidian Black', inStock: true, inventoryCount: 5 },
      { id: 'out-002-obs-m', size: 'M', colorName: 'Obsidian Black', inStock: true, inventoryCount: 8 },
      { id: 'out-002-obs-l', size: 'L', colorName: 'Obsidian Black', inStock: true, inventoryCount: 4 },
      { id: 'out-002-bon-m', size: 'M', colorName: 'Bone White', inStock: true, inventoryCount: 3 }
    ]
  },
  {
    id: 'out-003',
    slug: 'technical-minimal-parka',
    name: 'Technical Minimalist Parka',
    subtitle: 'Waterproof bonded nylon with matte brass trims',
    category: 'outerwear',
    price: 490,
    badge: 'BESTSELLER',
    featured: false,
    description: 'A utilitarian silhouette refined down to essential lines. Features thermo-welded waterproof seams, an ergonomic collar hood, and two-way concealed YKK metal zippers.',
    details: [
      '3-layer bonded Japanese technical nylon (20,000mm hydrostatic head)',
      'Breathable microporous membrane',
      'Dual concealed fleece-lined handwarmer pockets',
      'Pale Gold brushed metal snap closures'
    ],
    careInstructions: ['Gentle machine wash cold', 'Line dry in shade; do not iron'],
    images: {
      primary: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Forest Moss', hex: '#3B4136' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    defaultColor: 'Obsidian Black',
    variants: [
      { id: 'out-003-obs-s', size: 'S', colorName: 'Obsidian Black', inStock: true, inventoryCount: 6 },
      { id: 'out-003-obs-m', size: 'M', colorName: 'Obsidian Black', inStock: true, inventoryCount: 10 }
    ]
  },
  {
    id: 'out-004',
    slug: 'cropped-shearling-jacket',
    name: 'Cropped Shearling Aviator',
    subtitle: 'Suede-finished lambskin with plush merino interior',
    category: 'outerwear',
    price: 780,
    originalPrice: 890,
    badge: 'LOW STOCK',
    featured: false,
    description: 'Luxurious warmth in an uncompromising boxy crop. Crafted from Spanish lambskin with an ultra-soft natural shearling collar, buckled throat latch, and heavy antique gold zip.',
    details: [
      '100% Spanish Entrefino shearling lambskin',
      'Antiqued pale gold roller buckles',
      'Reinforced welt pockets with internal brass rivets',
      'Sculptural boxy silhouette'
    ],
    careInstructions: ['Professional leather cleaner only'],
    images: {
      primary: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Espresso Brown', hex: '#2A1F1D' },
      { name: 'Obsidian Black', hex: '#0D0D0D' }
    ],
    sizes: ['S', 'M', 'L'],
    defaultColor: 'Espresso Brown',
    variants: [
      { id: 'out-004-esp-s', size: 'S', colorName: 'Espresso Brown', inStock: true, inventoryCount: 2 },
      { id: 'out-004-esp-m', size: 'M', colorName: 'Espresso Brown', inStock: true, inventoryCount: 1 }
    ]
  },

  // ----------------------------------------
  // ESSENTIALS (4 items)
  // ----------------------------------------
  {
    id: 'ess-001',
    slug: 'merino-wool-ribbed-knit',
    name: 'Merino Wool Ribbed Knit',
    subtitle: 'Extra-fine 19.5 micron seamless crewneck',
    category: 'essentials',
    price: 240,
    badge: 'BESTSELLER',
    featured: true,
    description: 'An elevated daily staple engineered with zero side-seams. Spun from Australian extra-fine merino wool in a substantial 7-gauge half-cardigan stitch.',
    details: [
      '100% Extra-fine Merino Wool (19.5 micron)',
      'Seamless 3D whole-garment circular knit',
      'Ribbed neckline, elongated cuffs, and straight hem',
      'Naturally thermoregulating and odor-resistant'
    ],
    careInstructions: ['Hand wash in cold water with wool detergent', 'Dry flat on a towel'],
    images: {
      primary: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Cloud White', hex: '#FAFAFA' },
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Oatmeal', hex: '#E3DAC9' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultColor: 'Cloud White',
    defaultSize: 'M',
    variants: [
      { id: 'ess-001-cld-s', size: 'S', colorName: 'Cloud White', inStock: true, inventoryCount: 15 },
      { id: 'ess-001-cld-m', size: 'M', colorName: 'Cloud White', inStock: true, inventoryCount: 18 },
      { id: 'ess-001-obs-m', size: 'M', colorName: 'Obsidian Black', inStock: true, inventoryCount: 12 }
    ]
  },
  {
    id: 'ess-002',
    slug: 'tailored-pleated-trousers',
    name: 'Tailored Pleated Trousers',
    subtitle: 'Double forward pleat in high-twist tropical wool',
    category: 'essentials',
    price: 320,
    badge: 'NEW',
    featured: true,
    description: 'Exacting sartorial discipline. Features a relaxed high rise, deep forward twin pleats, an extended waistband tab, and a fluid wide-straight leg.',
    details: [
      '100% Tropical High-Twist Wool (crease-resistant)',
      'Extended tab waistband with concealed hook-and-eye closure',
      'Slanted front slash pockets and rear button-through jetted pockets',
      'Unfinished hem ready for personalized tailoring'
    ],
    careInstructions: ['Dry clean only', 'Press with damp cloth on medium heat'],
    images: {
      primary: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Sand Taupe', hex: '#C2B69D' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultColor: 'Obsidian Black',
    defaultSize: 'M',
    variants: [
      { id: 'ess-002-obs-s', size: 'S', colorName: 'Obsidian Black', inStock: true, inventoryCount: 9 },
      { id: 'ess-002-obs-m', size: 'M', colorName: 'Obsidian Black', inStock: true, inventoryCount: 14 },
      { id: 'ess-002-snd-m', size: 'M', colorName: 'Sand Taupe', inStock: true, inventoryCount: 7 }
    ]
  },
  {
    id: 'ess-003',
    slug: 'heavyweight-organic-tee',
    name: 'Heavyweight Organic Cotton Tee',
    subtitle: '280gsm combed organic jersey with ribbed collar',
    category: 'essentials',
    price: 95,
    featured: false,
    description: 'The archetype of the minimalist tee. Spun from 280gsm combed organic cotton jersey that holds its sculptural silhouette through countless washes.',
    details: [
      '100% GOTS Certified Organic Combed Cotton',
      'Dense 280gsm heavyweight jersey',
      'Reinforced twin-needle stitching at hem and sleeves',
      'Pre-shrunk to retain dimensional stability'
    ],
    careInstructions: ['Machine wash 30°C inside out', 'Do not tumble dry'],
    images: {
      primary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Cloud White', hex: '#FAFAFA' },
      { name: 'Washed Black', hex: '#222222' },
      { name: 'Sage Grey', hex: '#8F9779' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultColor: 'Cloud White',
    defaultSize: 'L',
    variants: [
      { id: 'ess-003-cld-m', size: 'M', colorName: 'Cloud White', inStock: true, inventoryCount: 25 },
      { id: 'ess-003-cld-l', size: 'L', colorName: 'Cloud White', inStock: true, inventoryCount: 30 }
    ]
  },
  {
    id: 'ess-004',
    slug: 'relaxed-poplin-shirt',
    name: 'Relaxed Poplin Button-Down',
    subtitle: '120/2 Egyptian Giza cotton with mother-of-pearl buttons',
    category: 'essentials',
    price: 185,
    badge: 'NEW',
    featured: false,
    description: 'Crisp, feather-light, and exquisitely detailed. Designed with an easy drop-shoulder cut, sharp semi-spread collar, and genuine Australian mother-of-pearl buttons.',
    details: [
      '100% Long-Staple Egyptian Giza Cotton',
      'Ultra-fine 120/2 two-ply yarn poplin weave',
      'Cross-stitched natural mother-of-pearl buttons',
      'Slightly curved split hem'
    ],
    careInstructions: ['Machine wash cold on delicate', 'Warm iron while slightly damp'],
    images: {
      primary: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Optical White', hex: '#FFFFFF' },
      { name: 'Sky Azure', hex: '#D2E2EC' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    defaultColor: 'Optical White',
    variants: [
      { id: 'ess-004-opt-s', size: 'S', colorName: 'Optical White', inStock: true, inventoryCount: 8 },
      { id: 'ess-004-opt-m', size: 'M', colorName: 'Optical White', inStock: true, inventoryCount: 11 }
    ]
  },

  // ----------------------------------------
  // SUMMER DROP (4 items)
  // ----------------------------------------
  {
    id: 'sum-001',
    slug: 'raw-silk-resort-shirt',
    name: 'Raw Silk Resort Shirt',
    subtitle: 'Slub-textured noil silk with open camp collar',
    category: 'summer-drop',
    price: 210,
    badge: 'EXCLUSIVE',
    featured: true,
    description: 'Sensory luxury for high summer. Woven from undyed raw mulberry noil silk displaying organic slub textures, featuring an open camp collar and French placket.',
    details: [
      '100% Raw Mulberry Silk Noil (Matte finish)',
      'Breathable, airy open weave with rich tactile character',
      'Camp cuban collar and straight square hem with side slits',
      'Pale Gold branded button shank stitching'
    ],
    careInstructions: ['Dry clean or delicate cold hand wash', 'Dry in shade away from direct sunlight'],
    images: {
      primary: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Dune Ecru', hex: '#EAE5D9' },
      { name: 'Olive Silk', hex: '#585C4F' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    defaultColor: 'Dune Ecru',
    defaultSize: 'M',
    variants: [
      { id: 'sum-001-dune-s', size: 'S', colorName: 'Dune Ecru', inStock: true, inventoryCount: 7 },
      { id: 'sum-001-dune-m', size: 'M', colorName: 'Dune Ecru', inStock: true, inventoryCount: 12 },
      { id: 'sum-001-dune-l', size: 'L', colorName: 'Dune Ecru', inStock: true, inventoryCount: 5 }
    ]
  },
  {
    id: 'sum-002',
    slug: 'linen-wide-leg-culottes',
    name: 'Linen Wide-Leg Culottes',
    subtitle: 'Pure Normandy flax with elasticated back waist',
    category: 'summer-drop',
    price: 260,
    badge: 'NEW',
    featured: true,
    description: 'Effortless volume calibrated for summer breezes. Spun from certified Normandy long-staple flax, pre-washed for exceptional softness with zero stiffness.',
    details: [
      '100% Normandy Flax Linen (230gsm)',
      'Flat front tailored waistband with hidden elastic back insert',
      'Deep side-seam pockets and double rear welt pockets',
      'Ultra-wide fluid leg silhouette'
    ],
    careInstructions: ['Machine wash 30°C gentle cycle', 'Hang dry; embrace natural wrinkles'],
    images: {
      primary: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Natural Flax', hex: '#DDD6C6' },
      { name: 'Obsidian Black', hex: '#0D0D0D' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    defaultColor: 'Natural Flax',
    defaultSize: 'S',
    variants: [
      { id: 'sum-002-flx-xs', size: 'XS', colorName: 'Natural Flax', inStock: true, inventoryCount: 4 },
      { id: 'sum-002-flx-s', size: 'S', colorName: 'Natural Flax', inStock: true, inventoryCount: 8 },
      { id: 'sum-002-flx-m', size: 'M', colorName: 'Natural Flax', inStock: true, inventoryCount: 10 }
    ]
  },
  {
    id: 'sum-003',
    slug: 'minimalist-slip-dress',
    name: 'Minimalist Bias-Cut Slip Dress',
    subtitle: 'FSC-certified fluid viscose with delicate spaghetti straps',
    category: 'summer-drop',
    price: 310,
    badge: 'LOW STOCK',
    featured: false,
    description: 'An ode to 90s minimalism. Cut on the bias to skim the body seamlessly without clinging, featuring an architectural square neckline and ultra-fine rouleau straps.',
    details: [
      '100% FSC-Certified Heavyweight Viscose Twill',
      'Cut on true 45-degree bias for liquid drape',
      'Adjustable internal strap sliders in Pale Gold',
      'Ankle grazing length with side walking vent'
    ],
    careInstructions: ['Hand wash cold or dry clean', 'Low iron on reverse'],
    images: {
      primary: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Obsidian Black', hex: '#0D0D0D' },
      { name: 'Pale Gold Lustre', hex: '#D4AF37' }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    defaultColor: 'Pale Gold Lustre',
    variants: [
      { id: 'sum-003-gld-xs', size: 'XS', colorName: 'Pale Gold Lustre', inStock: true, inventoryCount: 2 },
      { id: 'sum-003-gld-s', size: 'S', colorName: 'Pale Gold Lustre', inStock: true, inventoryCount: 3 }
    ]
  },
  {
    id: 'sum-004',
    slug: 'woven-raffia-leather-tote',
    name: 'Woven Raffia & Leather Tote',
    subtitle: 'Madagascar raffia with Italian calfskin trim',
    category: 'summer-drop',
    price: 280,
    badge: 'NEW',
    featured: false,
    description: 'The architectural companion for warm excursions. Hand-braided natural raffia contrasted with sharp Obsidian Italian box calfskin handles and an embossed Pale Gold foil emblem.',
    details: [
      'Hand-woven sustainable Madagascar palm raffia',
      'Full-grain Italian calfskin handles and base corners',
      'Magnetic bridge closure with interior zippered drop pocket',
      'Generous 45cm x 35cm x 15cm dimensions'
    ],
    careInstructions: ['Wipe leather with soft damp cloth', 'Keep raffia dry and brush off debris'],
    images: {
      primary: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
      secondary: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop'
    },
    colors: [
      { name: 'Natural Honey / Obsidian', hex: '#BCA888' }
    ],
    sizes: ['M'], // Accessories use single size (One Size / M)
    defaultColor: 'Natural Honey / Obsidian',
    variants: [
      { id: 'sum-004-nat-m', size: 'M', colorName: 'Natural Honey / Obsidian', inStock: true, inventoryCount: 15 }
    ]
  }
];
```

---

## 3. Shopping Cart Architecture & Persistence Engine

The cart state must be fast, synchronous, predictable, and completely reactive across page navigation and browser sessions.

### 3.1 Cart State Model & Entity Definitions

```typescript
export interface CartItem {
  id: string;               // Compound ID: `${productId}__${colorName}__${size}`
  productId: string;
  name: string;
  price: number;
  image: string;
  size: ProductSize;
  colorName: string;
  quantity: number;
  maxStock: number;         // Enforce inventory limit
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;          // Slide-out drawer open/close
  isHydrated: boolean;       // True once localStorage has been read
}

export interface CartTotals {
  itemCount: number;         // Total items in cart (sum of quantities)
  subtotal: number;          // Sum of (price * quantity)
  shippingThreshold: number; // e.g., $250 for complimentary luxury shipping
  shippingCost: number;      // $0 if subtotal >= $250, otherwise $15
  estimatedTax: number;      // Fixed 8% sales tax calculation
  grandTotal: number;        // subtotal + shippingCost + estimatedTax
  freeShippingProgress: number; // 0 to 100% progress
  freeShippingRemainder: number; // Dollars needed for free shipping
}
```

### 3.2 Action Types & Reducer Logic

```typescript
export type CartAction =
  | { type: 'HYDRATE'; payload: CartItem[] }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'ADD_ITEM'; payload: { product: Product; size: ProductSize; colorName: string; quantity?: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' };

export const CART_STORAGE_KEY = 'aura_apparel_cart_v1';
export const FREE_SHIPPING_THRESHOLD = 250;
export const STANDARD_SHIPPING_FEE = 15;
export const TAX_RATE = 0.08;

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingRemainder = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingCost = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const estimatedTax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((subtotal + shippingCost + estimatedTax) * 100) / 100;

  return {
    itemCount,
    subtotal,
    shippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingCost,
    estimatedTax,
    grandTotal,
    freeShippingProgress,
    freeShippingRemainder
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload, isHydrated: true };

    case 'OPEN_DRAWER':
      return { ...state, isOpen: true };

    case 'CLOSE_DRAWER':
      return { ...state, isOpen: false };

    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: !state.isOpen };

    case 'ADD_ITEM': {
      const { product, size, colorName, quantity = 1 } = action.payload;
      const compoundId = `${product.id}__${colorName}__${size}`;
      
      const existingIndex = state.items.findIndex(item => item.id === compoundId);
      const variant = product.variants.find(v => v.size === size && v.colorName === colorName);
      const maxStock = variant?.inventoryCount ?? 10;

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = [...state.items];
        const existing = newItems[existingIndex];
        const updatedQty = Math.min(existing.quantity + quantity, maxStock);
        newItems[existingIndex] = { ...existing, quantity: updatedQty, maxStock };
      } else {
        const newItem: CartItem = {
          id: compoundId,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images.primary,
          size,
          colorName,
          quantity: Math.min(quantity, maxStock),
          maxStock
        };
        newItems = [newItem, ...state.items];
      }

      // Automatically open drawer on add-to-cart for seamless feedback
      return { ...state, items: newItems, isOpen: true };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        };
      }
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id === id) {
            return { ...item, quantity: Math.min(quantity, item.maxStock) };
          }
          return item;
        })
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}
```

### 3.3 Persistence & Multi-Tab Synchronization

To ensure resilience against SSR mismatches and multi-tab divergence:
1. **Initial Hydration**:
   On mount (`useEffect`), read `localStorage.getItem(CART_STORAGE_KEY)`. Wrap in `try/catch` to gracefully fall back to `[]` if storage is corrupted or blocked by privacy modes.
2. **Persistence on State Change**:
   Whenever `state.items` changes and `state.isHydrated === true`, execute `localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))`.
3. **Cross-Tab Synchronization**:
   Listen to the `window.addEventListener('storage', ...)` event. When another tab updates the cart, automatically re-hydrate the local cart state without page reload.

---

## 4. Responsive UX Architecture (1440px Desktop vs <768px Mobile)

The layout must provide an uncompromising luxury experience on both wide desktop displays (1440px viewport benchmark) and narrow mobile screens (375px - 768px viewport benchmark).

### 4.1 Responsive Comparison Matrix

| UI Component | Desktop Viewport (1440px Benchmark) | Tablet (768px - 1024px) | Mobile Viewport (<768px Benchmark) |
| :--- | :--- | :--- | :--- |
| **Top Navigation** | Centered Brand Wordmark (`text-2xl tracking-[0.25em]`), horizontal category links on left, Search/Account/Cart on right. Fixed or sticky with blur backdrop. | Compact links or collapsed menu; centered brand wordmark. | Hamburger menu button on left, centered brand wordmark (`text-lg tracking-[0.2em]`), Cart icon with count badge on right. Slide-in mobile menu drawer. |
| **Hero Section** | Full-bleed editorial split or centered overlay; `h-[90vh]` or `100vh`; Bodoni Moda headline at `text-6xl` to `text-7xl` (`tracking-tight`); subtle Pale Gold button border; generous `px-16`. | `h-[75vh]`; typography at `text-4xl` to `text-5xl`; `px-8`. | `h-[80vh]`; fluid typography at `text-3xl` to `text-4xl`; centered CTA with minimum 48px touch height; `px-4`. |
| **Category Filters** | Horizontal tabs with sharp underline active indicator; counts per category; hover text color shifts to Pale Gold. | Horizontally scrollable tab bar with hidden scrollbar (`no-scrollbar`). | Horizontally scrollable chip row with snap points or clean full-width pill tabs; touch-friendly 44px tap targets. |
| **Product Grid** | **4 columns** (`grid-cols-4 gap-8`); hover reveals secondary angle, price slides up, and Quick Buy button fades in from bottom. | **2 or 3 columns** (`grid-cols-2 md:grid-cols-3 gap-6`). | **1 or 2 columns** (`grid-cols-1 sm:grid-cols-2 gap-4`); Quick Buy action permanently accessible via bottom card button or direct tap into modal. |
| **Product Card** | Aspect ratio 3:4 portrait; sharp 0px corners; subtle zoom on image hover (`scale-[1.03]` with overflow hidden); gold badge top-left. | Aspect ratio 3:4 portrait; touch-optimized. | Aspect ratio 3:4 portrait; large tap area for whole card; high legibility pricing. |
| **Product Modal** | Dual-column modal (60% image gallery, 40% configuration); large Bodoni Moda title; side-by-side color swatches and size boxes; full description & accordion details. | Dual-column or stacked modal; scrollable viewport. | Full-screen or bottom-sheet modal (`h-[92vh]`); swipe down or top close button; sticky bottom "Add to Bag" action bar. |
| **Cart Drawer** | Slide-out drawer from right (`w-[440px]`); backdrop overlay with `backdrop-blur-sm`; ESC key listener; body scroll lock. | Slide-out drawer (`w-[400px]`). | Full-width slide-out drawer (`w-full` or `w-[92vw]`); sticky checkout button at thumb reach. |
| **Brand Story** | Asymmetrical editorial layout: large archival portrait on left, Bodoni Moda quote & typography manifesto on right. | Stacked 2-column or single column. | Single column stacked; full-bleed image followed by high-contrast typography block. |
| **Newsletter Footer** | 4-column layout: Brand manifesto, Navigation links, Legal/Customer care, and Sharp email input with Pale Gold submit button. | 2-column layout. | Single column accordion or stacked sections; full-width email input with 48px tap target. |

### 4.2 Slide-Out Cart Drawer Transition Architecture

```
[Screen Left: Dimmed Overlay]               [Screen Right: Drawer]
-----------------------------------------+-------------------------------------
opacity: 0 -> 100                        | transform: translateX(100%) -> translateX(0)
transition: opacity 300ms ease-out        | transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1)
bg-black/60 backdrop-blur-sm             | bg-white w-full sm:w-[440px] h-full
Click outside triggers CLOSE_DRAWER      | Focus trapped inside drawer
ESC key listener triggers CLOSE_DRAWER   | Body scroll locked (overflow: hidden)
```

**Drawer Layout Zones**:
1. **Header (Fixed)**: Title "SHOPPING BAG" (in Bodoni Moda / Hanken Grotesk tracking-widest), item count in parentheses, Close "✕" button with 44x44px touch target.
2. **Complimentary Shipping Progress Bar (Dynamic)**:
   - If subtotal < $250: "Add $[remainder] more for complimentary shipping."
   - If subtotal >= $250: "You have unlocked complimentary white-glove shipping."
   - Linear progress bar: sharp 0px height 2px, filled with Pale Gold `#D4AF37`.
3. **Item List (Scrollable `flex-1 overflow-y-auto`)**:
   - Each item row: 80px thumbnail (3:4 ratio), item title, variant details (Size, Color), unit price.
   - Quantity controls: `[-]` button, numeric counter, `[+]` button with disabled state at maxStock.
   - Remove item button (`✕` or "Remove" text link).
4. **Footer (Fixed at bottom)**:
   - Subtotal, Shipping (Free / $15), Estimated Tax (8%), Grand Total.
   - Obsidian primary button: "PROCEED TO CHECKOUT" (with Pale Gold hover border/glow).
   - Trust badge: "Complimentary returns within 30 days. Carbon neutral delivery."

---

## 5. Interaction Edge Cases & Validation Matrix

| Interaction / Scenario | Potential Failure / Pitfall | Robust Architectural Solution |
| :--- | :--- | :--- |
| **Empty Cart State** | User opens drawer with 0 items; awkward blank panel or broken subtotal calculation. | Render luxury editorial empty state: "Your shopping bag is empty.", a delicate Pale Gold icon or typography monogram, and a high-contrast CTA "EXPLORE THE COLLECTION" that closes drawer and smoothly scrolls to `#catalog`. |
| **Removing Last Item** | Cart transitions from 1 item to 0 items while drawer is open. | Animate item fade/collapse out, then seamlessly reveal the Empty Cart state without closing or jumping. |
| **Quantity Decrement to 0** | Decrementing from 1 to 0 could cause negative quantities or orphan states. | Decrementing `1 -> 0` triggers automatic item removal with optimistic UI update. Optional micro-toast: "Item removed from bag." |
| **Exceeding Stock Limit** | User repeatedly clicks `[+]` past available inventory. | Cap quantity at `item.maxStock`. Disable `[+]` button (`opacity-40 cursor-not-allowed`). Display inline notification: "Maximum available inventory reached." |
| **No Size Selected in Quick Buy / Modal** | User clicks "ADD TO BAG" without selecting a size. | Block action; highlight size selection boxes with subtle Pale Gold border shake animation; display message "Please select a size before adding to bag." |
| **Rapid Multiple Clicks ("Rage Clicks")** | User clicks "ADD TO BAG" 5 times rapidly. | Debounce action by 250ms or use optimistic reducer updates so rapid clicks increment quantity cleanly without spawning duplicate cart rows. |
| **Body Scroll Lock Jumping** | Setting `document.body.style.overflow = 'hidden'` causes desktop page layout shift as vertical scrollbar disappears. | Implement scrollbar width compensation (`paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px'`) or CSS `scrollbar-gutter: stable`. |
| **Escape Key & Backdrop Click** | User presses ESC or clicks dark backdrop while drawer or product modal is active. | Global `keydown` event listener checking `e.key === 'Escape'`. Backdrop has explicit `onClick` callback. Both cleanly dispatch `CLOSE_DRAWER` or `closeModal()`. |
| **Local Storage Full / Blocked** | Safari Private Browsing or quota exceeded throws `QuotaExceededError`. | Wrap all `localStorage` writes in defensive `try/catch`. If write fails, state continues in-memory with console warning rather than throwing fatal error. |
| **Out-of-Stock Variant Display** | Size or color variant has 0 inventory. | Render size button with diagonal strikethrough line (`relative overflow-hidden after:absolute after:w-full after:h-[1px] after:bg-neutral-400 after:rotate-45`), disabled styling, and "Sold Out" tooltip. |

---

## 6. Component Hierarchy & Recommended Architecture

To guide downstream workers, the recommended React component tree is structured as follows:

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx             // Brand wordmark, navigation links, cart badge
│   │   ├── MobileMenuDrawer.tsx   // Slide-in mobile menu
│   │   └── Footer.tsx             // Editorial story, newsletter signup, legal
│   ├── hero/
│   │   └── HeroSection.tsx        // Editorial hero, Bodoni Moda headline, primary CTA
│   ├── catalog/
│   │   ├── CategoryNav.tsx        // Filter tabs (All, Outerwear, Essentials, Summer Drop)
│   │   ├── ProductGrid.tsx        // 4-col desktop, 2-col tablet, 1-col mobile
│   │   ├── ProductCard.tsx        // 3:4 portrait, hover secondary image, quick buy
│   │   └── ProductDetailModal.tsx // Full product view, size/color selector, gallery
│   ├── cart/
│   │   ├── CartDrawer.tsx         // Slide-out panel, backdrop, body lock
│   │   ├── CartItemRow.tsx        // Individual item, quantity steppers, delete
│   │   ├── ShippingProgressBar.tsx// Complimentary shipping progress indicator
│   │   └── CartEmptyState.tsx     // Empty bag editorial graphics & CTA
│   └── brand/
│       └── BrandStorySection.tsx  // Architectural design philosophy statement
├── context/
│   └── CartContext.tsx            // React Context + useReducer + localStorage sync
├── types/
│   └── index.ts                   // TypeScript schemas for Product, Cart, Category
└── data/
    └── catalog.ts                 // Curated 12-product inventory with Unsplash assets
```

---

## 7. Verification & Testing Method

To independently verify catalog schema compliance, cart persistence, and responsive fidelity:
1. **Catalog Integrity**:
   Verify that all 12 items have unique IDs, valid category assignments, non-empty image URLs, and populated size/color variants.
2. **Cart Storage Test**:
   Execute `localStorage.setItem(CART_STORAGE_KEY, ...)` in browser console; refresh page; verify cart counter and drawer state reflect persisted items.
3. **Cart Arithmetic Test**:
   Verify subtotal calculation with items >= $250 yields $0 shipping; subtotal < $250 yields $15 shipping; tax strictly calculates 8%.
4. **Responsive Layout Check**:
   Resize browser viewport to `1440px` (verify 4 columns, full desktop nav) and `<768px` (verify hamburger icon, 1-2 columns, full-width cart drawer).
