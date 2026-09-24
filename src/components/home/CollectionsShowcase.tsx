'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Category } from '../../types/product';

export interface CollectionCardData {
  id: Category;
  title: string;
  subtitle: string;
  countLabel: string;
  image: string;
  alt: string;
}

export interface CollectionsShowcaseProps {
  onSelectCategory?: (category: Category) => void;
  selectedCategory?: string;
}

export const COLLECTIONS_DATA: CollectionCardData[] = [
  {
    id: 'outerwear',
    title: 'Outerwear',
    subtitle: 'Sculptural wool coats, storm capes & double-faced cashmere overcoats.',
    countLabel: '4 Editions',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
    alt: 'Aura Outerwear - Virgin Wool Trench Coat',
  },
  {
    id: 'essentials',
    title: 'Essentials',
    subtitle: 'Heavyweight jersey tees, architectural trousers & structured knitwear.',
    countLabel: '4 Editions',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    alt: 'Aura Essentials - Foundational Tailored Garments',
  },
  {
    id: 'summer-drop',
    title: 'Summer Drop',
    subtitle: 'Air-spun Belgian linens, raw silk shirting & fluid coastal drapery.',
    countLabel: '4 Editions',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Aura Summer Drop - Breathable Linen Shirting',
  },
];

export const CollectionsShowcase: React.FC<CollectionsShowcaseProps> = ({
  onSelectCategory,
}) => {
  const handleCardClick = (categoryId: Category) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="collections"
      aria-label="Curated Collections Showcase"
      className="w-full bg-[#FBF9F9] py-20 md:py-32 border-b border-[#E5E5E5]"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 pb-6 border-b border-[#E5E5E5]">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Curated Showcase
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[40px] md:leading-[48px] text-[#0D0D0D] font-normal uppercase">
              Three Architectural Movements
            </h2>
          </div>
          <p className="font-sans text-sm text-[#707070] max-w-md mt-4 md:mt-0 leading-relaxed font-light">
            Each collection is produced in small, numbered editions. Filter the catalog by selecting a movement below.
          </p>
        </div>

        {/* 3-Column Curated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" data-testid="collections-grid">
          {COLLECTIONS_DATA.map((col) => (
            <div
              key={col.id}
              onClick={() => handleCardClick(col.id)}
              className="group relative cursor-pointer overflow-hidden rounded-none border border-[#E5E5E5] bg-white transition-colors hover:border-[#0D0D0D]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(col.id);
                }
              }}
              aria-label={`View ${col.title} Collection (${col.countLabel})`}
              data-testid={`collection-card-${col.id}`}
            >
              {/* Image Container with Exact 1.03x Scale Zoom */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#181818]">
                <ImageWithFallback
                  src={col.image}
                  alt={col.alt}
                  fallbackText={col.title}
                  fallbackSubtext={col.countLabel}
                  aspectRatioClass="aspect-[3/4]"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />

                {/* Ambient dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge: Piece Count */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-block bg-white/95 text-[#0D0D0D] font-sans text-[10px] tracking-[0.2em] font-semibold uppercase px-3 py-1 rounded-none border border-white/30 backdrop-blur-xs">
                    {col.countLabel}
                  </span>
                </div>

                {/* Bottom Overlay Card Details */}
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 z-10 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl md:text-3xl font-normal uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors duration-300">
                      {col.title}
                    </h3>
                    <div className="w-8 h-8 rounded-none border border-white/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-white group-hover:text-[#0D0D0D] transition-all duration-300">
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <p className="font-sans text-xs text-neutral-300 font-light leading-relaxed line-clamp-2">
                    {col.subtitle}
                  </p>

                  <div className="pt-2 flex items-center space-x-2 text-[11px] font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
                    <span>Explore Movement</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
