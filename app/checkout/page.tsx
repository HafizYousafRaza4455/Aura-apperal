'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  ArrowLeft,
  Lock,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  imageUrl?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCancelled = searchParams.get('cancelled') === 'true';

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY'>('USD');
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    isCancelled ? 'Previous checkout was cancelled. Your atelier hold has been reset.' : null
  );

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'United States',
    shippingMethod: 'white-glove',
    tailoringNotes: '',
    paymentMethod: 'card',
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '•••',
  });

  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage & set mounted flag
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem('aura_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        } else {
          // Default luxury demo item if cart was empty
          setCartItems([
            {
              id: 'aura-01',
              name: 'The Structured Cashmere Overcoat',
              price: 2450,
              quantity: 1,
              selectedColor: 'Obsidian Noir',
              selectedSize: 'M',
              imageUrl:
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop',
            },
          ]);
        }
      } else {
        setCartItems([
          {
            id: 'aura-01',
            name: 'The Structured Cashmere Overcoat',
            price: 2450,
            quantity: 1,
            selectedColor: 'Obsidian Noir',
            selectedSize: 'M',
            imageUrl:
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop',
          },
        ]);
      }

      const savedCurrency = localStorage.getItem('aura_currency');
      if (savedCurrency && ['USD', 'EUR', 'GBP', 'JPY'].includes(savedCurrency)) {
        setCurrency(savedCurrency as any);
      }
    } catch {
      // Fallback
    }
  }, []);

  // 10-Minute Hold Countdown Timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = formData.shippingMethod === 'express' ? 120 : 0;
  const estimatedDuties = Math.round(subtotal * 0.08); // 8% luxury sales & duties
  const total = subtotal + shippingFee + estimatedDuties;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            variantId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.selectedColor,
            size: item.selectedSize,
            image: item.imageUrl,
          })),
          customerEmail: formData.email || 'client@aura-apparel.com',
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout initialization failed');
      }

      if (data.url) {
        // Clear cart and redirect
        try {
          localStorage.removeItem('aura_cart');
        } catch {}
        window.location.href = data.url;
      } else {
        router.push(
          `/checkout/success?session_id=${data.sessionId}&reservation_id=${data.reservationId}`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FBF9F9] font-sans antialiased">
      {/* Top Luxury Banner */}
      <header className="border-b border-[#222222] bg-[#111111]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Boutique</span>
          </Link>

          <Link href="/" className="text-center">
            <span className="font-serif text-2xl tracking-[0.25em] text-[#FBF9F9] font-bold">
              AURA
            </span>
            <span className="block text-[9px] uppercase tracking-[0.4em] text-[#D4AF37]">
              ATELIER CHECKOUT
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline tracking-wider">256-BIT ENCRYPTED</span>
          </div>
        </div>
      </header>

      {/* 10-Minute Hold Reservation Banner */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] py-2.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#A3A3A3]">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>
              Luxury inventory allocated. Stock held exclusively for your session.
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[#D4AF37] font-semibold bg-[#111111] px-3 py-1 border border-[#333333]">
            <Clock className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>HOLD EXPIRES: {formatTimer(secondsRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Client Details & Payment Form (7 Cols) */}
          <section className="lg:col-span-7 space-y-10">
            <form onSubmit={handleCheckoutSubmit} className="space-y-10">
              {/* Client Information */}
              <div>
                <h2 className="font-serif text-lg tracking-[0.15em] text-[#D4AF37] uppercase mb-4 flex items-center gap-2">
                  <span>01</span>
                  <span className="text-[#FBF9F9]">Client Dossier</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkout-email" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                      Email Address for Order Conformation & Tracking
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="client@luxury.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Destination */}
              <div>
                <h2 className="font-serif text-lg tracking-[0.15em] text-[#D4AF37] uppercase mb-4 flex items-center gap-2">
                  <span>02</span>
                  <span className="text-[#FBF9F9]">Private Delivery Address</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-first-name" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                      First Name
                    </label>
                    <input
                      id="checkout-first-name"
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      placeholder="Victoria"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-last-name" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                      Last Name
                    </label>
                    <input
                      id="checkout-last-name"
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      required
                      placeholder="Sterling"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-address" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                      Street Address & Suite / Residence
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      name="address"
                      autoComplete="street-address"
                      required
                      placeholder="740 Park Avenue, Penthouse B"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-city" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                      City
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      name="city"
                      autoComplete="address-level2"
                      required
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-postal-code" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                      Postal Code / Zip
                    </label>
                    <input
                      id="checkout-postal-code"
                      type="text"
                      name="postalCode"
                      autoComplete="postal-code"
                      required
                      placeholder="10021"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* White Glove Service Options */}
              <div>
                <h2 className="font-serif text-lg tracking-[0.15em] text-[#D4AF37] uppercase mb-4 flex items-center gap-2">
                  <span>03</span>
                  <span className="text-[#FBF9F9]">Dispatch Protocol</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    htmlFor="shipping-white-glove"
                    className={`p-4 border cursor-pointer transition-colors block ${
                      formData.shippingMethod === 'white-glove'
                        ? 'border-[#D4AF37] bg-[#1A1A1A]'
                        : 'border-[#2B2B2B] bg-[#141414]'
                    }`}
                  >
                    <input
                      id="shipping-white-glove"
                      type="radio"
                      name="shippingMethod"
                      value="white-glove"
                      checked={formData.shippingMethod === 'white-glove'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#FBF9F9]">White-Glove Courier</span>
                      <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-mono">
                        Complimentary
                      </span>
                    </div>
                    <p className="text-xs text-[#888888]">
                      Delivered in branded bespoke garment garment bags. 2-3 business days.
                    </p>
                  </label>

                  <label
                    htmlFor="shipping-express"
                    className={`p-4 border cursor-pointer transition-colors block ${
                      formData.shippingMethod === 'express'
                        ? 'border-[#D4AF37] bg-[#1A1A1A]'
                        : 'border-[#2B2B2B] bg-[#141414]'
                    }`}
                  >
                    <input
                      id="shipping-express"
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#FBF9F9]">Milan Atelier Express</span>
                      <span className="text-xs text-[#FBF9F9] font-mono">
                        {currencySymbols[currency]}120
                      </span>
                    </div>
                    <p className="text-xs text-[#888888]">
                      Direct air courier with dedicated concierge tracking. Next-day arrival.
                    </p>
                  </label>
                </div>
              </div>

              {/* Bespoke Tailoring & Alteration Notes */}
              <div>
                <label htmlFor="checkout-tailoring-notes" className="block text-[11px] uppercase tracking-wider text-[#A3A3A3] mb-1.5">
                  Bespoke Atelier Instructions (Optional)
                </label>
                <textarea
                  id="checkout-tailoring-notes"
                  name="tailoringNotes"
                  rows={2}
                  placeholder="E.g., Custom sleeve hem -1.5cm, monogramming initials E.V. in pale gold..."
                  value={formData.tailoringNotes}
                  onChange={handleInputChange}
                  className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#D4AF37] px-4 py-3 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none resize-none"
                />
              </div>

              {/* Payment Section */}
              <div>
                <h2 className="font-serif text-lg tracking-[0.15em] text-[#D4AF37] uppercase mb-4 flex items-center gap-2">
                  <span>04</span>
                  <span className="text-[#FBF9F9]">Settlement Protocol</span>
                </h2>
                <div className="border border-[#2B2B2B] bg-[#141414] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-sm text-[#FBF9F9]">Stripe Encrypted Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#707070] uppercase tracking-widest font-mono">
                      <span>VISA</span>
                      <span>•</span>
                      <span>MC</span>
                      <span>•</span>
                      <span>AMEX</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="sm:col-span-3">
                      <label htmlFor="checkout-card-number" className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">
                        Card Number
                      </label>
                      <input
                        id="checkout-card-number"
                        type="text"
                        name="cardNumber"
                        autoComplete="cc-number"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-[#333333] px-3.5 py-2.5 text-sm font-mono text-[#FBF9F9] outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-card-expiry" className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">
                        Expires
                      </label>
                      <input
                        id="checkout-card-expiry"
                        type="text"
                        name="cardExpiry"
                        autoComplete="cc-exp"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-[#333333] px-3.5 py-2.5 text-sm font-mono text-[#FBF9F9] outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-card-cvc" className="block text-[10px] uppercase tracking-wider text-[#888888] mb-1">
                        CVC
                      </label>
                      <input
                        id="checkout-card-cvc"
                        type="text"
                        name="cardCvc"
                        autoComplete="cc-csc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        className="w-full bg-[#1A1A1A] border border-[#333333] px-3.5 py-2.5 text-sm font-mono text-[#FBF9F9] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading || secondsRemaining <= 0}
                className="w-full bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0D0D0D] font-sans font-medium uppercase tracking-[0.25em] text-xs py-5 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>
                  AUTHORIZE PRIVATE ACQUISITION — {currencySymbols[currency]}
                  {total.toLocaleString()}
                </span>
              </button>
            </form>
          </section>

          {/* Right Column: Order Summary & Luxury Guarantee (5 Cols) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#141414] border border-[#262626] p-6 lg:sticky lg:top-28">
              <h2 suppressHydrationWarning className="font-serif text-sm uppercase tracking-[0.2em] text-[#D4AF37] border-b border-[#222222] pb-4 mb-6">
                Curated Selection ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 divide-y divide-[#222222]">
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="pt-4 first:pt-0 flex gap-4">
                    {item.imageUrl && (
                      <div className="w-16 h-20 bg-[#1F1F1F] overflow-hidden shrink-0 border border-[#2B2B2B]">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-serif text-[#FBF9F9] line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#888888] mt-0.5">
                        {item.selectedColor} • {item.selectedSize}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-[#666666]">Qty: {item.quantity}</span>
                        <span className="font-mono text-[#D4AF37]">
                          {currencySymbols[currency]}
                          {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#222222] pt-6 mt-6 space-y-3 text-xs">
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#FBF9F9]">
                    {currencySymbols[currency]}
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Atelier White-Glove Dispatch</span>
                  <span className="font-mono text-[#D4AF37]">
                    {shippingFee === 0 ? 'Complimentary' : `${currencySymbols[currency]}${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#A3A3A3]">
                  <span>Luxury Tariffs & Duties (8%)</span>
                  <span className="font-mono text-[#FBF9F9]">
                    {currencySymbols[currency]}
                    {estimatedDuties.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-[#2B2B2B] pt-4 flex justify-between text-sm font-medium">
                  <span className="text-[#FBF9F9] font-serif uppercase tracking-wider">Total</span>
                  <span className="font-mono text-[#D4AF37] text-base">
                    {currencySymbols[currency]}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Atelier Guarantees */}
              <div className="mt-8 pt-6 border-t border-[#222222] space-y-3 text-[11px] text-[#707070]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>30-Day Complimentary White-Glove Returns</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Complimentary Bespoke Alteration Service</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Carbon-Neutral Global Dispatch</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-xs text-[#D4AF37] tracking-[0.2em] uppercase">
          Initializing Atelier Secure Checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
