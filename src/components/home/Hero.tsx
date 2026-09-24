'use client';

import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export interface HeroProps {
  onExploreClick?: () => void;
  bannerImage?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  bannerImage = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
}) => {
  const handleScrollToCollections = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const target = document.getElementById('collections') || document.getElementById('catalog');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      aria-label="Editorial Hero Banner"
      className="relative w-full min-h-[90vh] md:min-h-screen flex items-end justify-start overflow-hidden bg-[#0D0D0D]"
    >
      {/* Editorial Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        <ImageWithFallback
          src={bannerImage}
          alt="Aura Apparel Editorial Campaign - The Form of Stillness"
          fallbackText="AURA APPAREL"
          fallbackSubtext="THE FORM OF STILLNESS"
          aspectRatioClass="h-full w-full"
          containerClassName="h-full w-full"
          className="w-full h-full object-cover object-top filter brightness-[0.92]"
          priority="high"
        />

        {/* Multi-layered cinematic gradients for contrast & mood */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/40 to-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Editorial Content Frame */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 pb-16 md:pb-24 pt-32">
        <div className="max-w-3xl space-y-6">
          {/* Eyebrow / Season Tag */}
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
            <p className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-[#D4AF37] font-medium">
              Edition 01 / Autumn-Winter 2026
            </p>
          </div>

          {/* Bodoni Moda Display Headline (72px desktop / 48px mobile) */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[80px] tracking-[-0.02em] text-white font-normal uppercase">
            The Form of Stillness
          </h1>

          {/* Narrative Subcopy */}
          <p className="font-sans text-base sm:text-lg text-neutral-200 font-light leading-relaxed max-w-xl">
            An architectural study in pure form, unhurried tailoring, and heavyweight natural textiles.
            Designed for permanent poise in a world of transient noise.
          </p>

          {/* Solid Obsidian 0px CTA Button */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={handleScrollToCollections}
              className="group inline-flex items-center justify-between sm:justify-center gap-4 px-8 py-4 bg-[#0D0D0D] text-white font-sans text-xs uppercase tracking-[0.2em] font-medium rounded-none border border-white/30 hover:border-[#D4AF37] hover:bg-black transition-all duration-300 cursor-pointer w-full sm:w-auto"
            >
              <span>Explore Collection</span>
              <ArrowRight
                size={16}
                className="text-[#D4AF37] group-hover:translate-x-1.5 transition-transform duration-300"
                aria-hidden="true"
              />
            </button>

            <span className="hidden sm:inline-block text-[11px] uppercase tracking-[0.2em] text-white/50 pl-2">
              Limited Edition Runs
            </span>
          </div>
        </div>

        {/* Bottom Sub-bar / Coordinates & Scroll Indicator */}
        <div className="mt-16 md:mt-24 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white/60">
          <div className="font-sans text-[10px] uppercase tracking-[0.3em]">
            Milan <span className="text-[#D4AF37]">•</span> Tokyo <span className="text-[#D4AF37]">•</span> Paris
          </div>

          <button
            type="button"
            onClick={handleScrollToCollections}
            className="group flex items-center space-x-2 font-sans text-[10px] uppercase tracking-[0.25em] text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <span>Scroll To Explore</span>
            <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};
