export interface CartItem {
  key: string; // `${productId}__${colorName}__${size}`
  productId: string;
  title: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
}

export interface CartTotals {
  subtotal: number;
  shippingThreshold: number; // 250
  freeShippingUnlocked: boolean;
  shippingRemaining: number;
  shippingCost: number; // 0 if subtotal >= 250 or empty, 15 otherwise
  discountAmount: number;
  promoCodeApplied?: string;
  tax: number; // 8% of (subtotal - discountAmount)
  grandTotal: number;
}
