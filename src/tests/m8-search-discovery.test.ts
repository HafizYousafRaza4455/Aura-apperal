import { describe, it, expect } from 'vitest';
import { searchCatalog } from '../../lib/search';

describe('Phase 4: Search & Discovery Engine Suite', () => {
  describe('1. Baseline Catalog Discovery', () => {
    it('returns all products when no query or filters are provided', async () => {
      const resp = await searchCatalog();
      expect(resp.total).toBe(12);
      expect(resp.results.length).toBe(12);
      expect(resp.executionTimeMs).toBeLessThan(100);
    });

    it('generates accurate category and price facet counts', async () => {
      const resp = await searchCatalog();
      expect(resp.facets.categories.outerwear).toBe(4);
      expect(resp.facets.categories.essentials).toBe(4);
      expect(resp.facets.categories['summer-drop']).toBe(4);
      expect(resp.facets.inStockCount).toBeGreaterThan(0);
    });
  });

  describe('2. Fuzzy Full-Text Matching', () => {
    it('finds products by title keyword (e.g., "trench")', async () => {
      const resp = await searchCatalog({ query: 'trench' });
      expect(resp.total).toBeGreaterThanOrEqual(1);
      expect(resp.results[0].title).toContain('Trench');
    });

    it('matches textiles and materials in product details (e.g., "cashmere")', async () => {
      const resp = await searchCatalog({ query: 'cashmere' });
      expect(resp.total).toBeGreaterThanOrEqual(1);
      const hasCashmere = resp.results.some(
        (p) =>
          p.title.toLowerCase().includes('cashmere') ||
          p.description.toLowerCase().includes('cashmere') ||
          p.details.some((d) => d.toLowerCase().includes('cashmere'))
      );
      expect(hasCashmere).toBe(true);
    });

    it('matches colorway names (e.g., "obsidian")', async () => {
      const resp = await searchCatalog({ query: 'obsidian' });
      expect(resp.total).toBeGreaterThan(0);
    });
  });

  describe('3. Faceted Category & Price Filtering', () => {
    it('filters strictly by category', async () => {
      const resp = await searchCatalog({ category: 'outerwear' });
      expect(resp.total).toBe(4);
      expect(resp.results.every((p) => p.category === 'outerwear')).toBe(true);
    });

    it('filters by maximum price boundary', async () => {
      const resp = await searchCatalog({ maxPrice: 400 });
      expect(resp.total).toBeGreaterThan(0);
      expect(resp.results.every((p) => p.price <= 400)).toBe(true);
    });

    it('filters by minimum price boundary', async () => {
      const resp = await searchCatalog({ minPrice: 600 });
      expect(resp.total).toBeGreaterThan(0);
      expect(resp.results.every((p) => p.price >= 600)).toBe(true);
    });
  });

  describe('4. Deterministic Price & Relevance Sorting', () => {
    it('sorts ascending by price (price_asc)', async () => {
      const resp = await searchCatalog({ sort: 'price_asc' });
      for (let i = 0; i < resp.results.length - 1; i++) {
        expect(resp.results[i].price).toBeLessThanOrEqual(resp.results[i + 1].price);
      }
    });

    it('sorts descending by price (price_desc)', async () => {
      const resp = await searchCatalog({ sort: 'price_desc' });
      for (let i = 0; i < resp.results.length - 1; i++) {
        expect(resp.results[i].price).toBeGreaterThanOrEqual(resp.results[i + 1].price);
      }
    });
  });
});
