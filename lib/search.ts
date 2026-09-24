import { PRODUCTS } from '@/data/products';
import { Product } from '@/types/product';
import { redis } from './redis';

export interface SearchOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
  limit?: number;
}

export interface SearchFacets {
  categories: Record<string, number>;
  priceRanges: {
    under500: number;
    '500to1000': number;
    '1000to2000': number;
    over2000: number;
  };
  inStockCount: number;
}

export interface SearchResponse {
  results: Product[];
  total: number;
  facets: SearchFacets;
  executionTimeMs: number;
  isCached: boolean;
}

/** Tokenize and normalize text for fuzzy searching */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/** Calculate relevance score for a product given search tokens */
function calculateScore(product: Product, tokens: string[]): number {
  if (tokens.length === 0) return 1;

  let score = 0;
  const titleTokens = tokenize(product.title);
  const descTokens = tokenize(product.description);
  const detailTokens = tokenize(product.details.join(' '));
  const categoryToken = product.category.toLowerCase();
  const colorTokens = product.colors.flatMap((c) => tokenize(c.name));

  for (const token of tokens) {
    // Exact title match gets highest weight
    if (titleTokens.some((t) => t === token)) {
      score += 10;
    } else if (titleTokens.some((t) => t.includes(token))) {
      score += 5;
    }

    // Category match
    if (categoryToken.includes(token)) {
      score += 4;
    }

    // Color match
    if (colorTokens.some((c) => c === token || c.includes(token))) {
      score += 3;
    }

    // Description match
    if (descTokens.some((d) => d.includes(token))) {
      score += 2;
    }

    // Detail/material match (e.g., "cashmere", "wool", "silk")
    if (detailTokens.some((dt) => dt.includes(token))) {
      score += 3;
    }
  }

  return score;
}

export async function searchCatalog(options: SearchOptions = {}): Promise<SearchResponse> {
  const startTime = performance.now();
  const cacheKey = `search:q:${JSON.stringify(options)}`;

  // 1. Try Redis cache only if connected and ready
  if (redis && redis.status === 'ready') {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          executionTimeMs: Math.round(performance.now() - startTime),
          isCached: true,
        };
      }
    } catch {
      // Redis error fallback
    }
  }

  const query = options.query?.trim() || '';
  const tokens = tokenize(query);

  // 2. Filter & Score
  let matches: Array<{ product: Product; score: number }> = [];

  for (const prod of PRODUCTS) {
    // Category filter
    if (options.category && options.category.toLowerCase() !== 'all') {
      if (prod.category.toLowerCase() !== options.category.toLowerCase()) {
        continue;
      }
    }

    // Min price filter
    if (options.minPrice !== undefined && prod.price < options.minPrice) {
      continue;
    }

    // Max price filter
    if (options.maxPrice !== undefined && prod.price > options.maxPrice) {
      continue;
    }

    // In-stock only filter
    if (options.inStockOnly && prod.stock <= 0) {
      continue;
    }

    const score = calculateScore(prod, tokens);
    if (query === '' || score > 0) {
      matches.push({ product: prod, score });
    }
  }

  // 3. Sorting
  if (options.sort === 'price_asc') {
    matches.sort((a, b) => a.product.price - b.product.price);
  } else if (options.sort === 'price_desc') {
    matches.sort((a, b) => b.product.price - a.product.price);
  } else if (options.sort === 'newest') {
    matches.sort((a, b) => (b.product.badge === 'NEW ARRIVAL' ? 1 : -1));
  } else {
    // Default: Sort by relevance score, then featured
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.product.featured ? 1 : 0) - (a.product.featured ? 1 : 0);
    });
  }

  // Limit
  const finalResults = options.limit ? matches.slice(0, options.limit).map((m) => m.product) : matches.map((m) => m.product);

  // 4. Compute Facets across all filtered results
  const facets: SearchFacets = {
    categories: {
      outerwear: 0,
      essentials: 0,
      'summer-drop': 0,
    },
    priceRanges: {
      under500: 0,
      '500to1000': 0,
      '1000to2000': 0,
      over2000: 0,
    },
    inStockCount: 0,
  };

  for (const { product } of matches) {
    // Categories
    const cat = product.category.toLowerCase();
    if (facets.categories[cat] !== undefined) {
      facets.categories[cat]++;
    }

    // Price ranges
    if (product.price < 500) {
      facets.priceRanges.under500++;
    } else if (product.price <= 1000) {
      facets.priceRanges['500to1000']++;
    } else if (product.price <= 2000) {
      facets.priceRanges['1000to2000']++;
    } else {
      facets.priceRanges.over2000++;
    }

    // Stock
    if (product.stock > 0) {
      facets.inStockCount++;
    }
  }

  const response: SearchResponse = {
    results: finalResults,
    total: matches.length,
    facets,
    executionTimeMs: Math.round(performance.now() - startTime),
    isCached: false,
  };

  // 5. Cache in Redis with 5-minute TTL
  if (redis && redis.status === 'ready') {
    try {
      await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);
    } catch {
      // ignore
    }
  }

  return response;
}
