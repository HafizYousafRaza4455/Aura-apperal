import React from 'react';
import { ProductBadge } from '../../types/product';

export type LuxuryBadgeType = ProductBadge;

export interface LuxuryBadgeProps {
  badge?: LuxuryBadgeType | string | null;
  className?: string;
}

export const LuxuryBadge: React.FC<LuxuryBadgeProps> = ({ badge, className = '' }) => {
  if (!badge) return null;

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'EXCLUSIVE':
        return 'bg-[#0D0D0D] text-[#D4AF37] border border-[#D4AF37]/50';
      case 'NEW ARRIVAL':
        return 'bg-[#0D0D0D] text-white border border-[#0D0D0D]';
      case 'BESTSELLER':
        return 'bg-white/95 text-[#0D0D0D] border border-[#0D0D0D]/30 backdrop-blur-xs';
      case 'SUMMER DROP':
        return 'bg-[#D4AF37] text-[#0D0D0D] border border-[#D4AF37] font-bold';
      default:
        return 'bg-[#0D0D0D] text-white border border-[#0D0D0D]';
    }
  };

  const testIdSlug = badge.toLowerCase().replace(/\s+/g, '-');

  return (
    <span
      data-testid={`badge-${testIdSlug}`}
      className={`inline-block px-2.5 py-1 text-[9px] sm:text-[10px] font-sans font-semibold tracking-[0.2em] uppercase rounded-none select-none ${getBadgeStyles(
        badge
      )} ${className}`}
    >
      {badge}
    </span>
  );
};
