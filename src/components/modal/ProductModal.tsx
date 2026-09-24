'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { Product, ProductColor } from '../../types/product';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { LuxuryBadge } from '../common/LuxuryBadge';
import { formatPrice, Currency, CURRENCY_SYMBOLS, CURRENCY_RATES } from '../../data/products';

export type CurrencyCode = Currency;

export interface AddToCartPayload {
  product: Product;
  color: ProductColor | string;
  size: string;
  quantity: number;
}

export interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: AddToCartPayload) => void;
  currency?: string;
  currentCurrency?: CurrencyCode;
  initialColor?: ProductColor | string | null;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  currency,
  currentCurrency,
  initialColor,
}) => {
  const activeCurrency = (currency || currentCurrency || 'USD') as CurrencyCode;

  // 1. Variant & Interaction State
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // 0 = primary, 1 = secondary
  const [validationError, setValidationError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Accessibility & DOM Refs
  const modalCardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const backdropMouseDownRef = useRef<EventTarget | null>(null);

  // Synchronize initial color and reset states when product opens
  useEffect(() => {
    if (isOpen && product) {
      if (initialColor && product.colors && product.colors.length > 0) {
        const colorName = typeof initialColor === 'string' ? initialColor : initialColor.name;
        const idx = product.colors.findIndex(
          (c) => c.name.toLowerCase() === colorName.toLowerCase()
        );
        setSelectedColorIndex(idx !== -1 ? idx : 0);
      } else {
        setSelectedColorIndex(0);
      }
      setSelectedSize(null);
      setQuantity(1);
      setActiveImageIndex(0);
      setValidationError(false);
      setIsAdded(false);
    }
  }, [isOpen, product, initialColor]);

  // 3. Layout-Shift-Free Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  // 4. Focus Trap & Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;

    // Record previous active element to restore focus on close
    triggerElementRef.current = document.activeElement as HTMLElement;

    // Initial focus on close button
    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (modalCardRef.current) {
        modalCardRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalCardRef.current) {
        const focusable = Array.from(
          modalCardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => {
          return (
            !el.hasAttribute('disabled') &&
            el.getAttribute('aria-hidden') !== 'true' &&
            el.getAttribute('tabindex') !== '-1' &&
            el.style.display !== 'none' &&
            el.style.visibility !== 'hidden'
          );
        });

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalCardRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalCardRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

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

  const images = [activeColor.image, activeColor.secondaryImage].filter(Boolean);
  const currentDisplayImage = images[activeImageIndex] || images[0] || '';

  // Stepper handlers
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const maxStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : 10;
  const handleIncrement = () =>
    setQuantity((prev) => Math.min(10, Math.min(maxStock, prev + 1)));

  // Add to Bag action
  const handleAddToBag = () => {
    if (!selectedSize) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    if (onAddToCart) {
      onAddToCart({
        product,
        color: activeColor,
        size: selectedSize,
        quantity,
      });
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // Drag-safe backdrop dismiss
  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    backdropMouseDownRef.current = e.target;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && backdropMouseDownRef.current === e.currentTarget) {
      onClose();
    }
    backdropMouseDownRef.current = null;
  };

  const availableSizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL'];

  if (!mounted || typeof document === 'undefined' || !isOpen || !product) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      data-testid="product-modal"
      data-modal-root="true"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden"
    >
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onMouseDown={handleBackdropMouseDown}
        onClick={handleBackdropClick}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />

      {/* 2. Responsive Modal Dialog Card */}
      <div
        ref={modalCardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
        aria-describedby="modal-product-subtitle"
        tabIndex={-1}
        data-testid="product-modal-dialog"
        className="relative z-10 w-full md:max-w-4xl lg:max-w-[960px] bg-[#FBF9F9] border-t md:border border-[#E5E5E5] rounded-none shadow-none flex flex-col md:grid md:grid-cols-2 h-[92dvh] md:h-[85vh] max-h-[92dvh] md:max-h-[85vh] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-[#FBF9F9]">
          <div className="w-10 h-1 bg-[#D1D1D1] rounded-none" aria-hidden="true" />
        </div>

        {/* Top-Right Sharp Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          data-testid="modal-close-button"
          className="absolute top-4 right-4 z-30 p-2.5 bg-white/90 md:bg-white text-[#0D0D0D] hover:text-[#D4AF37] border border-[#E5E5E5] hover:border-[#0D0D0D] rounded-none transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D0D0D]"
        >
          <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
        </button>

        {/* ============================================================= */}
        {/* LEFT COLUMN: High-Resolution Gallery & Thumbnails              */}
        {/* ============================================================= */}
        <div className="relative bg-[#181818] flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-[#E5E5E5] min-h-0 h-44 sm:h-56 md:h-full">
          {/* Main Portrait Media Frame */}
          <div className="relative aspect-[3/4] md:h-full w-full overflow-hidden">
            <ImageWithFallback
              src={currentDisplayImage}
              alt={`${product.title} in ${activeColor.name}`}
              aspectRatioClass="aspect-[3/4]"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              fallbackText="AURA"
              fallbackSubtext={product.category}
              priority="high"
            />

            {/* Luxury Status Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-20">
                <LuxuryBadge badge={product.badge} />
              </div>
            )}
          </div>

          {/* Clickable Sharp Thumbnail Selector Row */}
          {images.length > 1 && (
            <div
              className="p-3 bg-white/95 border-t border-[#E5E5E5] flex items-center gap-3 overflow-x-auto"
              role="radiogroup"
              aria-label="Product image angles"
            >
              {images.map((imgSrc, idx) => {
                const isSelected = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`View angle ${idx + 1}`}
                    onClick={() => setActiveImageIndex(idx)}
                    data-testid={`modal-thumbnail-${idx}`}
                    className={`relative w-14 h-18 flex-shrink-0 border rounded-none overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0D0D0D] ring-1 ring-[#0D0D0D]'
                        : 'border-[#E5E5E5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* RIGHT COLUMN: Product Details, Matrix, Stepper & Add to Bag   */}
        {/* ============================================================= */}
        <div className="flex flex-col min-h-0 h-full overflow-hidden bg-[#FBF9F9]">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Header: Subtitle, Title, Price */}
            <div className="space-y-2 border-b border-[#E5E5E5] pb-5 pr-10">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-[1px] bg-[#D4AF37]" aria-hidden="true" />
                <p
                  id="modal-product-subtitle"
                  data-testid="modal-subtitle"
                  className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#707070] font-medium"
                >
                  {product.subtitle || product.category.replace('-', ' ')}
                </p>
              </div>

              <h2
                id="modal-product-title"
                data-testid="modal-title"
                className="font-serif text-2xl sm:text-3xl text-[#0D0D0D] font-normal uppercase tracking-tight"
              >
                {product.title}
              </h2>

              <p
                data-testid="modal-price"
                className="font-sans text-lg font-medium text-[#0D0D0D] tracking-wider pt-1"
              >
                {formatPrice(product.price, activeCurrency)}
              </p>
            </div>

            {/* Colorway Swatches with Pale Gold Active Ring */}
            {colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] font-semibold">
                    Color: <span className="font-normal text-[#707070]">{activeColor.name}</span>
                  </span>
                </div>
                <div
                  className="flex items-center gap-2.5"
                  role="radiogroup"
                  aria-label="Color selections"
                >
                  {colors.map((c, idx) => {
                    const isSelected = idx === selectedColorIndex;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Select ${c.name} color`}
                        onClick={() => {
                          setSelectedColorIndex(idx);
                          setActiveImageIndex(0);
                        }}
                        data-testid={`modal-color-${idx}`}
                        className={`w-7 h-7 rounded-none border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0D0D0D] ring-2 ring-[#D4AF37] ring-offset-2 scale-105'
                            : 'border-[#D1D1D1] hover:border-[#0D0D0D]'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector Matrix (XS, S, M, L, XL) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] font-semibold">
                  Size: <span className="font-normal text-[#707070]">{selectedSize || 'Select a size'}</span>
                </span>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#707070] underline cursor-pointer hover:text-[#0D0D0D]">
                  Size Guide
                </span>
              </div>

              <div
                className="grid grid-cols-5 gap-2"
                role="radiogroup"
                aria-label="Available sizes"
              >
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Select size ${sz}`}
                      onClick={() => {
                        setSelectedSize(sz);
                        setValidationError(false);
                      }}
                      data-testid={`modal-size-${sz}`}
                      className={`py-3 text-xs font-sans font-medium uppercase tracking-widest border rounded-none transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                          : 'bg-white text-[#0D0D0D] border-[#E5E5E5] hover:border-[#0D0D0D]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper (1 to 10) & Stock Indicator */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] font-semibold">
                  Quantity
                </span>
                <span className="text-[11px] font-sans tracking-widest uppercase text-[#707070]">
                  {maxStock <= 5 && maxStock > 0 ? (
                    <span className="text-[#D4AF37] font-semibold">Only {maxStock} Remaining</span>
                  ) : maxStock === 0 ? (
                    <span className="text-[#BA1A1A] font-semibold">Out of Stock</span>
                  ) : (
                    'In Stock'
                  )}
                </span>
              </div>

              <div className="inline-flex items-center border border-[#E5E5E5] bg-white">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  data-testid="stepper-decrement"
                  className="p-3 text-[#0D0D0D] hover:bg-[#F5F5F3] disabled:opacity-30 disabled:hover:bg-transparent rounded-none transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  data-testid="stepper-value"
                  className="px-5 text-xs font-mono font-medium text-[#0D0D0D]"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= 10 || quantity >= maxStock}
                  aria-label="Increase quantity"
                  data-testid="stepper-increment"
                  className="p-3 text-[#0D0D0D] hover:bg-[#F5F5F3] disabled:opacity-30 disabled:hover:bg-transparent rounded-none transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Missing Size Validation Alert */}
            {validationError && (
              <div
                role="alert"
                aria-live="assertive"
                data-testid="modal-validation-error"
                className="p-3 bg-[#BA1A1A]/5 border border-[#BA1A1A] text-[#BA1A1A] flex items-center gap-2 text-xs font-sans font-medium"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Please select a size to proceed</span>
              </div>
            )}

            {/* Editorial Description & Details */}
            <div className="pt-4 border-t border-[#E5E5E5] space-y-3 text-xs text-[#707070] font-sans leading-relaxed">
              <p>{product.description}</p>
              {product.details && product.details.length > 0 && (
                <ul className="space-y-1.5 list-disc list-inside pt-2 text-[#0D0D0D]/80">
                  {product.details.map((detail, dIdx) => (
                    <li key={dIdx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Primary Action Button: ADD TO BAG (Docked at bottom, ALWAYS VISIBLE on all viewports without scrolling or zoom) */}
          <div className="shrink-0 p-4 sm:p-6 bg-[#FBF9F9] border-t border-[#E5E5E5] z-20">
            <button
              type="button"
              onClick={handleAddToBag}
              data-testid="modal-add-to-bag-btn"
              className={`w-full py-4 px-6 text-xs font-sans font-semibold tracking-[0.25em] uppercase rounded-none flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                isAdded
                  ? 'bg-[#D4AF37] text-[#0D0D0D] border border-[#D4AF37]'
                  : 'bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] border border-[#0D0D0D] hover:border-[#D4AF37]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>
                    Add to Bag • {(() => {
                      const symbol = CURRENCY_SYMBOLS[activeCurrency] ?? '$';
                      const rate = CURRENCY_RATES[activeCurrency] ?? 1.0;
                      const converted = Math.round(product.price * quantity * rate);
                      return `${symbol}${converted.toLocaleString('en-US')}`;
                    })()}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
