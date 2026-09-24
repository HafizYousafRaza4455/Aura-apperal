import { Product, FilterCategory, SortOption, Category } from '../types/product';

export const PRODUCTS: Product[] = [
  // =========================================================================
  // 1. OUTERWEAR (4 Items)
  // =========================================================================
  {
    id: 'out-001',
    title: 'The Oversized Wool Trench',
    subtitle: 'Double-breasted virgin wool with horn buttons',
    price: 580,
    category: 'outerwear',
    badge: 'EXCLUSIVE',
    featured: true,
    stock: 18,
    description:
      'A monument to understated tailoring. Cut from dense 720gsm virgin wool with sharp drop shoulders, extended storm flaps, and unlacquered buffalo horn buttons.',
    details: [
      '100% Virgin Italian Wool (720gsm)',
      'Full cupro lining with interior ticket pocket',
      'Removable self-tie belt with pale gold hardware buckle',
      'Generous back storm flap and deep center vent',
      'Hand-finished in Milan, Italy',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Camel Tan',
        hex: '#B89778',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Slate Grey',
        hex: '#4A4E51',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'out-002',
    title: 'Structured Cashmere Blazer',
    subtitle: 'Single-breasted architectural tailored jacket',
    price: 640,
    category: 'outerwear',
    badge: 'NEW ARRIVAL',
    featured: true,
    stock: 12,
    description:
      'Impeccable proportions meet featherweight warmth. Tailored with a clean peak lapel, jetted flap pockets, and subtle canvas shoulder padding.',
    details: [
      '85% Mongolian Cashmere, 15% Mulberry Silk',
      'Half-canvas construction for natural drape',
      'Concealed double vent at posterior hem',
      'Hand-sewn pick stitching along lapels',
      'Horn button closure with Pale Gold shank stitching',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Bone White',
        hex: '#EBE9E4',
        image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'out-003',
    title: 'Technical Minimalist Parka',
    subtitle: 'Waterproof bonded nylon with matte brass trims',
    price: 490,
    category: 'outerwear',
    badge: 'BESTSELLER',
    featured: false,
    stock: 15,
    description:
      'A utilitarian silhouette refined down to essential lines. Features thermo-welded waterproof seams, an ergonomic collar hood, and two-way concealed metal zippers.',
    details: [
      '3-layer bonded Japanese technical nylon (20,000mm hydrostatic head)',
      'Breathable microporous membrane',
      'Dual concealed fleece-lined handwarmer pockets',
      'Pale Gold brushed metal snap closures',
      'Internal storm cuffs with thumbholes',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Forest Moss',
        hex: '#3B4136',
        image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'out-004',
    title: 'Cropped Shearling Aviator',
    subtitle: 'Suede-finished lambskin with plush merino interior',
    price: 780,
    category: 'outerwear',
    badge: 'EXCLUSIVE',
    featured: false,
    stock: 5,
    description:
      'Luxurious warmth in an uncompromising boxy crop. Crafted from Spanish lambskin with an ultra-soft natural shearling collar, buckled throat latch, and heavy antique gold zip.',
    details: [
      '100% Spanish Entrefino shearling lambskin',
      'Antiqued pale gold roller buckles',
      'Reinforced welt pockets with internal brass rivets',
      'Sculptural boxy silhouette with dropped shoulders',
      'Specialist leather atelier craft',
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      {
        name: 'Espresso Brown',
        hex: '#2A1F1D',
        image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },

  // =========================================================================
  // 2. ESSENTIALS (4 Items)
  // =========================================================================
  {
    id: 'ess-001',
    title: 'Merino Wool Ribbed Knit',
    subtitle: 'Extra-fine 19.5 micron seamless crewneck',
    price: 240,
    category: 'essentials',
    badge: 'BESTSELLER',
    featured: true,
    stock: 24,
    description:
      'An elevated daily staple engineered with zero side-seams. Spun from Australian extra-fine merino wool in a substantial 7-gauge half-cardigan stitch.',
    details: [
      '100% Extra-fine Merino Wool (19.5 micron)',
      'Seamless 3D whole-garment circular knit',
      'Ribbed neckline, elongated cuffs, and straight hem',
      'Naturally thermoregulating and odor-resistant',
      'Hand-linked collar join',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Cloud White',
        hex: '#FAFAFA',
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Oatmeal',
        hex: '#E3DAC9',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'ess-002',
    title: 'Tailored Pleated Trousers',
    subtitle: 'Double forward pleat in high-twist tropical wool',
    price: 320,
    category: 'essentials',
    badge: 'NEW ARRIVAL',
    featured: true,
    stock: 16,
    description:
      'Exacting sartorial discipline. Features a relaxed high rise, deep forward twin pleats, an extended waistband tab, and a fluid wide-straight leg.',
    details: [
      '100% Tropical High-Twist Wool (crease-resistant)',
      'Extended tab waistband with concealed hook-and-eye closure',
      'Slanted front slash pockets and rear button-through jetted pockets',
      'Unfinished hem ready for personalized tailoring',
      'Natural horn side-adjusters',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Sand Taupe',
        hex: '#C2B69D',
        image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'ess-003',
    title: 'Heavyweight Organic Cotton Tee',
    subtitle: '280gsm combed organic jersey with ribbed collar',
    price: 95,
    category: 'essentials',
    featured: false,
    stock: 40,
    description:
      'The archetype of the minimalist tee. Spun from 280gsm combed organic cotton jersey that holds its sculptural silhouette through countless washes.',
    details: [
      '100% GOTS Certified Organic Combed Cotton',
      'Dense 280gsm heavyweight jersey',
      'Reinforced twin-needle stitching at hem and sleeves',
      'Pre-shrunk to retain dimensional stability',
      'Subtle tonal embroidery at nape',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Cloud White',
        hex: '#FAFAFA',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Washed Black',
        hex: '#222222',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Sage Grey',
        hex: '#8F9779',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'ess-004',
    title: 'Relaxed Poplin Button-Down',
    subtitle: '120/2 Egyptian Giza cotton with mother-of-pearl buttons',
    price: 185,
    category: 'essentials',
    badge: 'NEW ARRIVAL',
    featured: false,
    stock: 14,
    description:
      'Crisp, feather-light, and exquisitely detailed. Designed with an easy drop-shoulder cut, sharp semi-spread collar, and genuine Australian mother-of-pearl buttons.',
    details: [
      '100% Long-Staple Egyptian Giza Cotton',
      'Ultra-fine 120/2 two-ply yarn poplin weave',
      'Cross-stitched natural mother-of-pearl buttons',
      'Slightly curved split hem with gusset reinforcement',
      'Single needle tailoring throughout',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Optical White',
        hex: '#FFFFFF',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Sky Azure',
        hex: '#D2E2EC',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },

  // =========================================================================
  // 3. SUMMER DROP (4 Items)
  // =========================================================================
  {
    id: 'sum-001',
    title: 'Raw Silk Resort Shirt',
    subtitle: 'Slub-textured noil silk with open camp collar',
    price: 210,
    category: 'summer-drop',
    badge: 'SUMMER DROP',
    featured: true,
    stock: 20,
    description:
      'Sensory luxury for high summer. Woven from undyed raw mulberry noil silk displaying organic slub textures, featuring an open camp collar and French placket.',
    details: [
      '100% Raw Mulberry Silk Noil (Matte finish)',
      'Breathable, airy open weave with rich tactile character',
      'Camp cuban collar and straight square hem with side slits',
      'Pale Gold branded button shank stitching',
      'Pre-washed for ultra-soft lived-in texture',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Dune Ecru',
        hex: '#EAE5D9',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Olive Silk',
        hex: '#585C4F',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'sum-002',
    title: 'Linen Wide-Leg Culottes',
    subtitle: 'Pure Normandy flax with elasticated back waist',
    price: 260,
    category: 'summer-drop',
    badge: 'SUMMER DROP',
    featured: true,
    stock: 15,
    description:
      'Effortless volume calibrated for summer breezes. Spun from certified Normandy long-staple flax, pre-washed for exceptional softness with zero stiffness.',
    details: [
      '100% Normandy Flax Linen (230gsm)',
      'Flat front tailored waistband with hidden elastic back insert',
      'Deep side-seam pockets and double rear welt pockets',
      'Ultra-wide fluid leg silhouette',
      'Hand-pressed architectural creases',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Natural Flax',
        hex: '#DDD6C6',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'sum-003',
    title: 'Minimalist Bias-Cut Slip Dress',
    subtitle: 'FSC-certified fluid viscose with delicate spaghetti straps',
    price: 310,
    category: 'summer-drop',
    badge: 'EXCLUSIVE',
    featured: false,
    stock: 8,
    description:
      'An ode to 90s minimalism. Cut on the bias to skim the body seamlessly without clinging, featuring an architectural square neckline and ultra-fine rouleau straps.',
    details: [
      '100% FSC-Certified Heavyweight Viscose Twill',
      'Cut on true 45-degree bias for liquid drape',
      'Adjustable internal strap sliders in Pale Gold',
      'Ankle grazing length with side walking vent',
      'Concealed side zipper with hook and eye',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      {
        name: 'Pale Gold Lustre',
        hex: '#D4AF37',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1000&auto=format&fit=crop',
      },
      {
        name: 'Obsidian Black',
        hex: '#0D0D0D',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  {
    id: 'sum-004',
    title: 'Woven Raffia & Leather Tote',
    subtitle: 'Madagascar raffia with Italian calfskin trim',
    price: 280,
    category: 'summer-drop',
    badge: 'SUMMER DROP',
    featured: false,
    stock: 15,
    description:
      'The architectural companion for warm excursions. Hand-braided natural raffia contrasted with sharp Obsidian Italian box calfskin handles and an embossed Pale Gold foil emblem.',
    details: [
      'Hand-woven sustainable Madagascar palm raffia',
      'Full-grain Italian calfskin handles and base corners',
      'Magnetic bridge closure with interior zippered drop pocket',
      'Generous 45cm x 35cm x 15cm dimensions',
      'Embossed Pale Gold serial numbering inside',
    ],
    sizes: ['ONE SIZE'],
    colors: [
      {
        name: 'Natural Honey / Obsidian',
        hex: '#BCA888',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
        secondaryImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
];

// =========================================================================
// Helper Utilities & Query Functions
// =========================================================================

export const getProductsByCategory = (category: FilterCategory): Product[] => {
  if (category === 'all') {
    return PRODUCTS;
  }
  return PRODUCTS.filter((product) => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return PRODUCTS.filter((product) => product.featured === true);
};

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((product) => product.id === id);
};

export const sortProducts = (products: Product[], sort: SortOption): Product[] => {
  const cloned = [...products];
  switch (sort) {
    case 'price-asc':
      return cloned.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return cloned.sort((a, b) => b.price - a.price);
    case 'newest':
      return cloned.sort((a, b) => {
        const aNew = a.badge === 'NEW ARRIVAL' || a.badge === 'SUMMER DROP' ? 1 : 0;
        const bNew = b.badge === 'NEW ARRIVAL' || b.badge === 'SUMMER DROP' ? 1 : 0;
        if (bNew !== aNew) {
          return bNew - aNew;
        }
        return 0;
      });
    case 'featured':
    default:
      return cloned.sort((a, b) => {
        const aFeat = a.featured ? 1 : 0;
        const bFeat = b.featured ? 1 : 0;
        if (bFeat !== aFeat) {
          return bFeat - aFeat;
        }
        return 0;
      });
  }
};

export const filterAndSortProducts = (
  products: Product[],
  category: FilterCategory,
  sort: SortOption
): Product[] => {
  let filtered = products;
  if (category !== 'all') {
    filtered = products.filter((product) => product.category === category);
  }
  return sortProducts(filtered, sort);
};

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.0,
};

export const formatPrice = (amountUsd: number, currency: Currency = 'USD'): string => {
  const rate = CURRENCY_RATES[currency] ?? 1.0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';
  const converted = Math.round(amountUsd * rate);

  if (currency === 'JPY') {
    return `${symbol}${converted.toLocaleString()}`;
  }
  return `${symbol}${converted}`;
};

export interface CategoryMetadata {
  id: Category;
  title: string;
  subtitle: string;
  editionsLabel: string;
}

export const CATEGORY_METADATA: Record<Category, CategoryMetadata> = {
  outerwear: {
    id: 'outerwear',
    title: 'Outerwear',
    subtitle: 'Sculptural wool coats, storm capes & double-faced cashmere overcoats.',
    editionsLabel: '4 Editions',
  },
  essentials: {
    id: 'essentials',
    title: 'Essentials',
    subtitle: 'Heavyweight jersey tees, architectural trousers & structured knitwear.',
    editionsLabel: '4 Editions',
  },
  'summer-drop': {
    id: 'summer-drop',
    title: 'Summer Drop',
    subtitle: 'Air-spun Belgian linens, raw silk shirting & fluid coastal drapery.',
    editionsLabel: '4 Editions',
  },
};
