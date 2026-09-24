'use client';

// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { CartItem, CartTotals } from '../types/cart';

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  applyPromo: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Helper to calculate totals
function calculateTotals(items: CartItem[], promoCode?: string): CartTotals {
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingThreshold = 250;
  const freeShippingUnlocked = subtotal >= shippingThreshold;
  const shippingCost = freeShippingUnlocked || subtotal === 0 ? 0 : 15;
  const discountAmount = promoCode === 'AURA10' ? subtotal * 0.1 : 0;
  const tax = (subtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shippingCost : 0) + tax);

  return {
    subtotal,
    shippingThreshold,
    freeShippingUnlocked,
    shippingRemaining: Math.max(0, shippingThreshold - subtotal),
    shippingCost,
    discountAmount,
    promoCodeApplied: promoCode,
    tax,
    grandTotal,
  };
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with SSR-safe defaults to ensure 100% hydration match
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage once mounted on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cartState');
      if (stored) {
        const parsed = JSON.parse(stored) as { items?: CartItem[]; promoCode?: string };
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items);
        }
        if (parsed.promoCode) {
          setPromoCode(parsed.promoCode);
        }
      }
    } catch (_) {}
    setIsLoaded(true);
  }, []);

  // Calculate totals purely as derived state via useMemo
  const totals = useMemo(() => {
    return calculateTotals(items, promoCode);
  }, [items, promoCode]);

  // Sync state to localStorage on modification only after initial mount
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const state = JSON.stringify({ items, promoCode });
      localStorage.setItem('cartState', state);
    } catch (_) {}
  }, [items, promoCode, isLoaded]);

  // Sync cross-tab changes (native browser 'storage' event only fires in other tabs)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'cartState' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as { items?: CartItem[]; promoCode?: string };
          if (Array.isArray(parsed.items)) {
            setItems(parsed.items);
          }
          setPromoCode(parsed.promoCode);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) => (i.key === item.key ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const applyPromo = (code: string) => {
    setPromoCode(code === 'AURA10' ? code : undefined);
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(undefined);
    try {
      localStorage.removeItem('cartState');
    } catch (_) {}
  };

  const value: CartContextValue = {
    items,
    totals,
    addItem,
    removeItem,
    updateQuantity,
    applyPromo,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
