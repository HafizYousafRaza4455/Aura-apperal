'use client';

// src/components/cart/CartDrawer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAdmin } from '../../context/AdminContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, totals, removeItem, updateQuantity, applyPromo, clearCart } = useCart();
  const { addOrder } = useAdmin();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: 'Eleanor Vance',
    email: 'eleanor.vance@atelier-aura.com',
    address: 'Via Montenapoleone 8',
    city: 'Milan',
    country: 'Italy',
    zip: '20121',
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '•••',
  });

  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');

  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Free shipping threshold derived from context totals
  const shippingThreshold = totals.shippingThreshold || 250;
  const shippingProgress = Math.min(100, (totals.subtotal / shippingThreshold) * 100);

  // Total unit quantity count
  const totalUnitCount = items.reduce((acc, i) => acc + i.quantity, 0);

  // Focus trap + ESC key for Cart Drawer (when checkout modal not active)
  useEffect(() => {
    if (!isOpen || checkoutModalOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerPanelRef.current) {
        const focusable = Array.from(
          drawerPanelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !drawerPanelRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !drawerPanelRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, checkoutModalOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'AURA10') {
      applyPromo('AURA10');
      setPromoError('');
    } else {
      setPromoError('Invalid promotion code. Try AURA10.');
    }
  };

  const handleRemovePromo = () => {
    applyPromo('');
    setPromoInput('');
    setPromoError('');
  };

  const startCheckout = () => {
    setCheckoutStep('shipping');
    setCheckoutModalOpen(true);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = addOrder({
        customerName: formData.name,
        customerEmail: formData.email,
        shippingAddress: formData.address,
        city: formData.city,
        country: formData.country,
        zip: formData.zip,
        items: items.map((i) => ({
          key: i.key,
          productId: i.productId,
          title: i.title,
          price: i.price,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        shipping: totals.shippingCost,
        tax: totals.tax,
        grandTotal: totals.grandTotal,
        status: 'Processing',
        paymentStatus: 'Paid',
      });
      setConfirmedOrderId(orderId);
      setIsSubmitting(false);
      setCheckoutStep('confirmation');
      clearCart();
    }, 900);
  };

  const closeFullCheckout = () => {
    setCheckoutModalOpen(false);
    setCheckoutStep('shipping');
    onClose();
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {/* 1. CART SLIDE-OUT DRAWER */}
      <div
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-labelledby="cart-drawer-title"
        data-testid="cart-drawer"
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          isOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
          aria-hidden="true"
          data-testid="cart-drawer-backdrop"
        />

        {/* Drawer Panel */}
        <div
          ref={drawerPanelRef}
          className={`fixed inset-y-0 right-0 w-full max-w-[460px] bg-[#FBF9F9] border-l border-[#E5E5E5] flex flex-col z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          data-testid="cart-drawer-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5] bg-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 stroke-[1.5] text-[#0D0D0D]" aria-hidden="true" />
              <h2
                id="cart-drawer-title"
                className="font-serif text-base tracking-[0.15em] text-[#0D0D0D] uppercase font-medium"
              >
                Your Bag
              </h2>
              {items.length > 0 && (
                <span className="text-[11px] font-mono text-[#707070]" aria-label={`${totalUnitCount} items in cart`}>
                  ({totalUnitCount})
                </span>
              )}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 text-[#0D0D0D] hover:text-[#D4AF37] transition-colors focus:outline-none cursor-pointer"
              aria-label="Close cart"
              data-testid="cart-drawer-close"
            >
              <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F5F4F0]/70">
            {totals.freeShippingUnlocked ? (
              <p className="text-xs font-sans uppercase tracking-[0.2em] text-[#D4AF37] font-semibold flex items-center gap-2" data-testid="free-shipping-unlocked">
                <CheckCircle2 className="w-4 h-4 inline" />
                <span>Free shipping unlocked on your order!</span>
              </p>
            ) : (
              <>
                <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#707070] mb-2" data-testid="free-shipping-remaining">
                  Spend{' '}
                  <span className="text-[#0D0D0D] font-semibold">{formatPrice(totals.shippingRemaining)}</span>{' '}
                  more for free shipping
                </p>
                <div
                  className="w-full h-1 bg-[#E5E5E5] rounded-none overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(shippingProgress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Free shipping progress"
                  data-testid="free-shipping-bar"
                >
                  <div
                    className="h-full bg-[#D4AF37] transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                    data-testid="free-shipping-bar-fill"
                  />
                </div>
              </>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 gap-4" data-testid="cart-empty">
                <ShoppingBag className="w-12 h-12 stroke-[1] text-[#D1D1D1]" aria-hidden="true" />
                <p className="font-serif text-lg text-[#0D0D0D] uppercase tracking-widest">Your bag is empty</p>
                <p className="font-sans text-xs text-[#707070] tracking-wide">Add pieces from the collection to begin.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 text-xs font-sans uppercase tracking-[0.2em] text-[#0D0D0D] underline underline-offset-4 hover:text-[#D4AF37] transition-colors cursor-pointer inline-flex items-center gap-1"
                  data-testid="cart-continue-shopping"
                >
                  <span>Continue Shopping</span>
                  <ChevronRight className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E5E5]" data-testid="cart-item-list">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-4 px-6 py-5 bg-white hover:bg-[#FAF9F8] transition-colors" data-testid={`cart-item-${item.key}`}>
                    {/* Thumbnail */}
                    <div className="w-16 h-20 flex-shrink-0 bg-[#E5E5E5] overflow-hidden border border-[#E5E5E5]">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-sans uppercase tracking-widest text-[#707070]">
                          AURA
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-serif text-sm uppercase tracking-wider text-[#0D0D0D] leading-tight font-medium" data-testid={`item-title-${item.key}`}>
                            {item.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            aria-label={`Remove ${item.title}`}
                            className="p-1 text-[#707070] hover:text-[#BA1A1A] transition-colors cursor-pointer"
                            data-testid={`remove-item-${item.key}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="font-sans text-[11px] text-[#707070] mt-1 tracking-wide">
                          {item.color} · {item.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0F0F0]">
                        {/* Quantity stepper */}
                        <div
                          role="group"
                          aria-label={`Quantity selector for ${item.title}`}
                          className="flex items-center border border-[#E5E5E5] bg-white"
                          data-testid={`item-qty-${item.key}`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.title}`}
                            className="p-1.5 px-2 text-[#0D0D0D] hover:bg-[#F5F5F3] disabled:opacity-30 rounded-none transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </button>
                          <span
                            className="px-3 text-xs font-mono text-[#0D0D0D]"
                            aria-live="polite"
                            aria-label={`Current quantity: ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.title}`}
                            className="p-1.5 px-2 text-[#0D0D0D] hover:bg-[#F5F5F3] rounded-none transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>

                        <span className="font-sans text-sm font-semibold text-[#0D0D0D]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer: Promo Code + Totals + Checkout Button */}
          {items.length > 0 && (
            <div className="border-t border-[#E5E5E5] px-6 py-5 space-y-4 bg-white">
              {/* Promo Code Input */}
              <div data-testid="promo-section">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#707070]" aria-hidden="true" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      placeholder="PROMO CODE (AURA10)"
                      aria-label="Promo code input"
                      data-testid="promo-input"
                      className="w-full pl-8 pr-3 py-2.5 text-xs font-mono tracking-widest border border-[#E5E5E5] bg-[#FBF9F9] focus:outline-none focus:border-[#0D0D0D] uppercase placeholder:text-[#999999] rounded-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={!!totals.promoCodeApplied}
                    className="px-4 py-2.5 text-[11px] font-sans uppercase tracking-[0.2em] bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] disabled:opacity-50 transition-colors rounded-none cursor-pointer"
                    data-testid="promo-apply-btn"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-[#BA1A1A] mt-1 font-sans" data-testid="promo-error">{promoError}</p>
                )}
                {totals.promoCodeApplied && (
                  <div className="flex items-center justify-between mt-2 p-2 bg-[#F9F7F0] border border-[#D4AF37]/40" data-testid="promo-applied">
                    <p className="text-xs text-[#9B7D1E] font-sans font-semibold">
                      ✓ {totals.promoCodeApplied} applied — 10% off!
                    </p>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[10px] uppercase font-sans tracking-widest text-[#707070] underline hover:text-[#BA1A1A] cursor-pointer"
                      aria-label="Remove promo code"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="space-y-2 text-xs font-sans pt-2 border-t border-[#E5E5E5]" data-testid="order-summary">
                <div className="flex justify-between text-[#707070]">
                  <span className="uppercase tracking-[0.15em]">Subtotal</span>
                  <span className="font-mono" data-testid="summary-subtotal">{formatPrice(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-[#B28919] font-medium">
                    <span className="uppercase tracking-[0.15em]">Discount (AURA10)</span>
                    <span className="font-mono" data-testid="summary-discount">−{formatPrice(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#707070]">
                  <span className="uppercase tracking-[0.15em]">Shipping</span>
                  <span className="font-mono" data-testid="summary-shipping">
                    {totals.freeShippingUnlocked ? 'FREE' : formatPrice(totals.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-[#707070]">
                  <span className="uppercase tracking-[0.15em]">Estimated Tax (8%)</span>
                  <span className="font-mono" data-testid="summary-tax">{formatPrice(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-[#0D0D0D] font-semibold pt-2 border-t border-[#E5E5E5] text-sm">
                  <span className="uppercase tracking-[0.15em]">Total</span>
                  <span className="font-mono" data-testid="summary-total">{formatPrice(totals.grandTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={startCheckout}
                disabled={items.length === 0}
                aria-label="Proceed to checkout"
                className="w-full py-4 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-xs font-sans uppercase tracking-[0.25em] font-semibold transition-all duration-300 rounded-none cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 group shadow-sm"
                data-testid="checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. FULL CHECKOUT OVERLAY MODAL */}
      {checkoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl bg-white border border-[#E5E5E5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FBF9F9]">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg tracking-[0.2em] text-[#0D0D0D] uppercase font-semibold">
                  Aura Atelier Checkout
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="p-2 text-[#707070] hover:text-[#0D0D0D] transition-colors cursor-pointer"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-3 border-b border-[#E5E5E5] text-[11px] font-sans uppercase tracking-[0.15em] text-center">
              <div className={`py-3 font-semibold border-b-2 ${checkoutStep === 'shipping' ? 'border-[#0D0D0D] text-[#0D0D0D] bg-white' : 'border-transparent text-[#999999] bg-[#FBF9F9]'}`}>
                1. Delivery
              </div>
              <div className={`py-3 font-semibold border-b-2 ${checkoutStep === 'payment' ? 'border-[#0D0D0D] text-[#0D0D0D] bg-white' : 'border-transparent text-[#999999] bg-[#FBF9F9]'}`}>
                2. Payment
              </div>
              <div className={`py-3 font-semibold border-b-2 ${checkoutStep === 'confirmation' ? 'border-[#D4AF37] text-[#D4AF37] bg-white' : 'border-transparent text-[#999999] bg-[#FBF9F9]'}`}>
                3. Confirmed
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              {/* STEP 1: SHIPPING */}
              {checkoutStep === 'shipping' && (
                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 text-xs uppercase tracking-widest text-[#707070] font-semibold border-b border-[#E5E5E5]">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span>White-Glove Courier Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-[#FBF9F9]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Email Address</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-[#FBF9F9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Street Address</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-[#FBF9F9]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">City</label>
                      <input
                        required
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-[#FBF9F9]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Country</label>
                      <input
                        required
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-[#FBF9F9]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Postal Code</label>
                      <input
                        required
                        type="text"
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-[#FBF9F9]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#707070] block uppercase tracking-wider">Total Due</span>
                      <span className="font-mono text-base font-bold text-[#0D0D0D]">{formatPrice(totals.grandTotal)}</span>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PAYMENT */}
              {checkoutStep === 'payment' && (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 text-xs uppercase tracking-widest text-[#707070] font-semibold border-b border-[#E5E5E5]">
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>Secure Payment Encrypted</span>
                  </div>

                  <div className="p-4 bg-[#FBF9F9] border border-[#E5E5E5] space-y-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Card Number</label>
                      <input
                        required
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs font-mono border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">Expiry Date</label>
                        <input
                          required
                          type="text"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs font-mono border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">CVC Code</label>
                        <input
                          required
                          type="text"
                          value={formData.cardCvc}
                          onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                          className="w-full px-3 py-2.5 text-xs font-mono border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] rounded-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#707070]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit SSL End-to-End Encryption Guaranteed</span>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('shipping')}
                      className="text-xs uppercase tracking-widest text-[#707070] hover:text-[#0D0D0D] underline cursor-pointer"
                    >
                      Back to Delivery
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Processing Authorization...</span>
                      ) : (
                        <span>Authorize & Place Order ({formatPrice(totals.grandTotal)})</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: ORDER CONFIRMED */}
              {checkoutStep === 'confirmation' && (
                <div className="text-center py-6 space-y-5">
                  <div className="w-16 h-16 bg-[#D4AF37]/15 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-sans tracking-[0.25em] text-[#D4AF37] uppercase font-semibold">
                      Order Confirmed
                    </span>
                    <h3 className="font-serif text-2xl text-[#0D0D0D] uppercase tracking-wide">
                      Thank You for Your Order
                    </h3>
                    <p className="text-xs text-[#707070] font-mono">
                      Reference Number: <span className="font-bold text-[#0D0D0D]">{confirmedOrderId}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
                    A confirmation email and archival invoice have been dispatched to{' '}
                    <span className="font-semibold text-[#0D0D0D]">{formData.email}</span>. Your pieces will be packaged with white-glove archival care.
                  </p>

                  <div className="pt-4 border-t border-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={closeFullCheckout}
                      className="px-8 py-3.5 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer"
                    >
                      Return to Storefront
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default CartDrawer;
