import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product, ProductColor } from '../../types/product';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { LuxuryBadge } from '../common/LuxuryBadge';
import { formatPrice, Currency } from '../../data/products';

export type CurrencyCode = Currency;
export { formatPrice };

export interface ProductCardProps {
  product: Product;
  currentCurrency?: CurrencyCode;
  onSelectProduct?: (product: Product, selectedColor: ProductColor) => void;
  onProductClick?: (product: Product, selectedColor?: ProductColor) => void;
  onQuickBuy?: (product: Product, selectedColor: ProductColor, defaultSize: string) => void;
  priority?: 'high' | 'low' | 'auto';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentCurrency = 'USD',
  onSelectProduct,
  onProductClick,
  onQuickBuy,
  priority = 'auto',
  className = '',
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quickBuyState, setQuickBuyState] = useState<'idle' | 'added'>('idle');

  // Defensive fallback for colorways
  const colors =
    product.colors && product.colors.length > 0
      ? product.colors
      : [
          {
            name: 'Classic',
            hex: '#0D0D0D',
            image: '',
            secondaryImage: '',
          },
        ];

  const activeColor = colors[selectedColorIndex] || colors[0];
  const primaryImage = activeColor.image || '';
  const secondaryImage = activeColor.secondaryImage || primaryImage;
  const defaultSize = product.sizes?.[0] || 'M';

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product, activeColor);
    }
    if (onProductClick) {
      onProductClick(product, activeColor);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleSwatchClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedColorIndex(index);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quickBuyState === 'added') return;

    if (onQuickBuy) {
      onQuickBuy(product, activeColor, defaultSize);
    }

    setQuickBuyState('added');
    setTimeout(() => {
      setQuickBuyState('idle');
    }, 1200);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`${product.title}, ${product.subtitle} - ${formatPrice(product.price, currentCurrency)}`}
      data-testid={`product-card-${product.id}`}
      className={`group relative flex flex-col cursor-pointer overflow-hidden rounded-none border border-[#E5E5E5] bg-white transition-colors duration-300 hover:border-[#0D0D0D] focus:outline-none focus:ring-1 focus:ring-[#0D0D0D] select-none ${className}`}
    >
      {/* 1. 3:4 Portrait Editorial Media Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F3EF]">
        {/* Primary Image with 1.05x Subtle Zoom */}
        <ImageWithFallback
          src={primaryImage}
          alt={`${product.title} in ${activeColor.name}`}
          aspectRatioClass="aspect-[3/4]"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          fallbackText="AURA"
          fallbackSubtext={product.category}
          priority={priority}
        />

        {/* Secondary Angle / Lifestyle Hover Flip (Cross-Fade) */}
        {secondaryImage && secondaryImage !== primaryImage && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
            aria-hidden="true"
          >
            <img
              src={secondaryImage}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Luxury Status Badge Chip */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <LuxuryBadge badge={product.badge} />
          </div>
        )}

        {/* Subtle Ambient Shadow for Quick Buy CTA Contrast */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Quick Buy Trigger Button */}
        <div className="absolute bottom-3 inset-x-3 z-20">
          <button
            type="button"
            onClick={handleQuickBuy}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={`Quick buy ${product.title} in ${activeColor.name} size ${defaultSize}`}
            data-testid={`quick-buy-btn-${product.id}`}
            className={`w-full py-2.5 px-4 text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] uppercase rounded-none flex items-center justify-center space-x-2 transition-all duration-300 transform ${
              quickBuyState === 'added'
                ? 'bg-[#D4AF37] text-[#0D0D0D] border border-[#D4AF37]'
                : 'bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] border border-[#0D0D0D] hover:border-[#D4AF37]'
            } opacity-100 md:opacity-0 md:translate-y-2 md:group-hover:translate-y-0 md:group-hover:opacity-100 cursor-pointer`}
          >
            {quickBuyState === 'added' ? (
              <>
                <Check size={14} className="stroke-[2.5]" aria-hidden="true" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} aria-hidden="true" />
                <span>Quick Add • {defaultSize}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Editorial Metadata Section */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] text-[#707070] font-medium">
              {product.subtitle || product.category.replace('-', ' ')}
            </p>
            <span className="text-[10px] font-sans tracking-widest text-[#707070] uppercase">
              {product.stock <= 5 && product.stock > 0 ? (
                <span className="text-[#D4AF37] font-semibold">Low Stock</span>
              ) : null}
            </span>
          </div>

          <h3
            data-testid={`product-title-${product.id}`}
            className="font-serif text-base sm:text-lg font-normal text-[#0D0D0D] tracking-tight group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1"
          >
            {product.title}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#E5E5E5]/60">
          <p
            data-testid={`product-price-${product.id}`}
            className="font-sans text-xs sm:text-sm font-medium text-[#0D0D0D] tracking-wider"
          >
            {formatPrice(product.price, currentCurrency)}
          </p>

          {/* Colorway Swatch Indicators */}
          {colors.length > 0 && (
            <div
              className="flex items-center space-x-1.5"
              role="radiogroup"
              aria-label={`${product.title} color options`}
            >
              {colors.map((c, idx) => {
                const isSelected = idx === selectedColorIndex;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${c.name} colorway`}
                    onClick={(e) => handleSwatchClick(e, idx)}
                    onKeyDown={(e) => e.stopPropagation()}
                    data-testid={`swatch-${product.id}-${idx}`}
                    title={c.name}
                    className={`w-3.5 h-3.5 rounded-none border transition-all duration-200 focus:outline-none cursor-pointer ${
                      isSelected
                        ? 'border-[#0D0D0D] ring-1 ring-[#0D0D0D] ring-offset-1 scale-110'
                        : 'border-[#D1D1D1] hover:border-[#0D0D0D]'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
