import React from 'react';
import { Compass, Sparkles, Award } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export interface CraftsmanshipPillar {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
}

export const CRAFTSMANSHIP_PILLARS: CraftsmanshipPillar[] = [
  {
    icon: Compass,
    badge: '0.5mm Tolerance',
    title: 'Architectural Precision',
    subtitle: 'Geometric rigor applied to tailoring',
    description:
      'Every seam, lapel, and vent is drafted against strict geometric proportions. By stripping away decorative hardware, each line serves a structural purpose, yielding garments that hold silhouette through effortless movement.',
    specs: [
      'Single-needle tailored construction',
      'Internal horsehair canvas chest piece',
      'Zero-tension shoulder line',
    ],
  },
  {
    icon: Sparkles,
    badge: '720 GSM Density',
    title: 'Rare Textiles',
    subtitle: 'Heritage mills in Biella & Kyoto',
    description:
      'We commission bespoke yarns directly from century-old family mills. Our signature 720gsm virgin wools, double-faced Mongolian cashmere, and air-spun Japanese cottons develop a richer patina with each decade of wear.',
    specs: [
      'Biella 720gsm Virgin Wool',
      'Grade-A Mongolian Cashmere',
      'Kyoto Raw Mulberry Silk',
    ],
  },
  {
    icon: Award,
    badge: '150 Pieces Max',
    title: 'Atelier Ethos',
    subtitle: 'Numbered editions, zero mass production',
    description:
      'Rejecting industrial volume, every Aura piece is crafted in limited editions of no more than 150 numbered pieces worldwide. Each garment arrives with an archival certificate of provenance and artisan signature.',
    specs: [
      'Hand-stamped edition numbering',
      'Master artisan provenance',
      'Complimentary lifetime repair',
    ],
  },
];

export const BrandStory: React.FC = () => {
  return (
    <section
      id="story"
      aria-label="Brand Story and Craftsmanship Manifesto"
      className="w-full bg-[#FBF9F9] py-24 md:py-36 border-b border-[#E5E5E5]"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16">
        {/* Section Manifesto Eyebrow & Title */}
        <div className="max-w-4xl space-y-6 mb-20 md:mb-28">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
              The Brand Manifesto
            </p>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[48px] lg:leading-[56px] text-[#0D0D0D] font-normal">
            &ldquo;We believe true luxury is the quiet confidence of subtraction.&rdquo;
          </h2>

          <p className="font-sans text-base sm:text-lg text-[#707070] font-light leading-relaxed max-w-2xl">
            Founded between Milan and Tokyo, Aura Apparel operates at the intersection of brutalist architecture
            and time-honored garment construction. We do not design for passing seasons; we engineer silhouettes for permanence.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start" data-testid="brand-story-grid">
          {/* Left Column: Two Stacked Primary Pillars (7 Columns) */}
          <div className="lg:col-span-7 space-y-12">
            {CRAFTSMANSHIP_PILLARS.slice(0, 2).map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="bg-white p-8 sm:p-10 border border-[#E5E5E5] rounded-none space-y-6 relative hover:border-[#0D0D0D] transition-colors"
                  data-testid={`craftsmanship-pillar-${idx + 1}`}
                >
                  {/* Top Row: Icon, Title & Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 border border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D]">
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase font-semibold">
                          Pillar 0{idx + 1}
                        </span>
                        <h3 className="font-serif text-2xl text-[#0D0D0D] font-normal uppercase tracking-tight">
                          {pillar.title}
                        </h3>
                      </div>
                    </div>

                    <span className="bg-[#F5F3F3] text-[#0D0D0D] text-[10px] font-sans tracking-[0.2em] uppercase font-semibold px-3 py-1 border border-[#E5E5E5]">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Subtitle & Narrative */}
                  <p className="font-sans text-xs uppercase tracking-[0.15em] text-[#707070] font-medium">
                    {pillar.subtitle}
                  </p>
                  <p className="font-sans text-sm text-[#444748] font-light leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Technical Specifications */}
                  <div className="pt-4 border-t border-[#E5E5E5]">
                    <ul className="space-y-2">
                      {pillar.specs.map((spec) => (
                        <li key={spec} className="flex items-center space-x-2 font-sans text-xs text-[#707070]">
                          <span className="w-1.5 h-1.5 bg-[#D4AF37]" aria-hidden="true" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Column: Editorial Photography + Third Pillar Inverted Card (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Editorial Photography Aspect Frame */}
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#E5E5E5] bg-neutral-100">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop"
                alt="Aura Atelier Craftsmanship - Textile Drapery and Cutting Table"
                fallbackText="ATELIER PROVENANCE"
                fallbackSubtext="HAND-FINISHED IN MILAN"
                aspectRatioClass="aspect-[4/5]"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                  The Milan Cutting Room
                </span>
                <p className="font-serif text-lg font-light italic mt-1">
                  &ldquo;A millimeter of restraint is worth a meter of ornament.&rdquo;
                </p>
              </div>
            </div>

            {/* Pillar 03: Atelier Ethos (High-Contrast Obsidian Inverted Card) */}
            {(() => {
              const pillar = CRAFTSMANSHIP_PILLARS[2];
              const IconComponent = pillar.icon;
              return (
                <article
                  className="bg-[#0D0D0D] text-white p-8 sm:p-10 border border-neutral-800 rounded-none space-y-6 relative"
                  data-testid="craftsmanship-pillar-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 border border-white/30 flex items-center justify-center text-[#D4AF37]">
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase font-semibold">
                          Pillar 03
                        </span>
                        <h3 className="font-serif text-2xl text-white font-normal uppercase tracking-tight">
                          {pillar.title}
                        </h3>
                      </div>
                    </div>

                    <span className="bg-neutral-900 text-[#D4AF37] text-[10px] font-sans tracking-[0.2em] uppercase font-semibold px-3 py-1 border border-neutral-700">
                      {pillar.badge}
                    </span>
                  </div>

                  <p className="font-sans text-xs uppercase tracking-[0.15em] text-neutral-400 font-medium">
                    {pillar.subtitle}
                  </p>
                  <p className="font-sans text-sm text-neutral-300 font-light leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="pt-4 border-t border-neutral-800">
                    <ul className="space-y-2">
                      {pillar.specs.map((spec) => (
                        <li key={spec} className="flex items-center space-x-2 font-sans text-xs text-neutral-400">
                          <span className="w-1.5 h-1.5 bg-[#D4AF37]" aria-hidden="true" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};
