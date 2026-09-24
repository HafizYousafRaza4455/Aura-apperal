/**
 * Aura Apparel - Product Domain Types
 * Strict 0px geometry, luxury minimalism architecture.
 */

export type Category = 'outerwear' | 'essentials' | 'summer-drop';

export type FilterCategory = 'all' | Category;

export type ProductBadge = 'EXCLUSIVE' | 'NEW ARRIVAL' | 'BESTSELLER' | 'SUMMER DROP';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'ONE SIZE';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

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
  badge?: ProductBadge;
  stock: number;
  featured?: boolean;
}
