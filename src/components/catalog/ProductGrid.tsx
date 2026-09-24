import React from 'react';
import { Product, ProductColor } from '../../types/product';
import { ProductCard, CurrencyCode } from './ProductCard';
import { RefreshCw } from 'lucide-react';

export interface ProductGridProps {
  products: Product[];
  currentCurrency?: CurrencyCode;
  onSelectProduct?: (product: Product, selectedColor: ProductColor) => void;
  onProductClick?: (product: Product, selectedColor?: ProductColor) => void;
  onQuickBuy?: (product: Product, selectedColor: ProductColor, defaultSize: string) => void;
  onResetFilter?: () => void;
  activeCategoryName?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currentCurrency = 'USD',
  onSelectProduct,
  onProductClick,
  onQuickBuy,
  onResetFilter,
  activeCategoryName,
  className = '',
}) => {
  // 1. Empty State Handling
  if (products.length === 0) {
    return (
      <div
        data-testid="product-grid-empty"
        className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 py-20"
      >
        <div className="border border-[#E5E5E5] bg-white p-12 sm:p-20 text-center flex flex-col items-center justify-center space-y-6 rounded-none">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
              Archive Filter
            </p>
            <span className="w-6 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0D0D0D] font-normal uppercase tracking-tight">
            No Archival Pieces Found
          </h3>

          <p className="font-sans text-sm text-[#707070] max-w-md mx-auto leading-relaxed font-light">
            There are currently no editions matching{' '}
            <span className="text-[#0D0D0D] font-medium uppercase">
              {activeCategoryName || 'the selected criteria'}
            </span>
            . Clear filters to explore the permanent collection.
          </p>

          {onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              data-testid="empty-state-reset-btn"
              className="inline-flex items-center space-x-2 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] px-8 py-3.5 text-xs font-sans font-semibold uppercase tracking-[0.2em] rounded-none transition-colors duration-300 cursor-pointer"
            >
              <RefreshCw size={13} className="stroke-[2.5]" aria-hidden="true" />
              <span>View All Editions</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Responsive 4-Col / 2-Col / 1-Col Grid Layout
  return (
    <section
      aria-label="Curated Product Catalog"
      className={`w-full max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 py-8 md:py-12 ${className}`}
    >
      <div
        data-testid="product-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 xl:gap-8"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            currentCurrency={currentCurrency}
            onSelectProduct={onSelectProduct}
            onProductClick={onProductClick}
            onQuickBuy={onQuickBuy}
            priority={index < 4 ? 'high' : 'auto'}
          />
        ))}
      </div>
    </section>
  );
};
