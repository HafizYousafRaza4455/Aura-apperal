'use client';

// src/context/AdminContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/product';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

export interface OrderItem {
  key: string;
  productId: string;
  title: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  country: string;
  zip: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Refunded';
  createdAt: string;
}

interface AdminContextValue {
  isAdminOpen: boolean;
  openAdmin: () => void;
  closeAdmin: () => void;
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => string;
  analytics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
  };
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const SEED_ORDERS: Order[] = [
  {
    id: 'AURA-892104',
    customerName: 'Victoria Sterling',
    customerEmail: 'v.sterling@kensington-holdings.co.uk',
    shippingAddress: '42 Belgrave Square',
    city: 'London',
    country: 'United Kingdom',
    zip: 'SW1X 8PG',
    items: [
      {
        key: 'out-001__Obsidian Black__M',
        productId: 'out-001',
        title: 'The Oversized Wool Trench',
        price: 580,
        color: 'Obsidian Black',
        size: 'M',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
      },
    ],
    subtotal: 580,
    discount: 58,
    shipping: 0,
    tax: 41.76,
    grandTotal: 563.76,
    status: 'Shipped',
    paymentStatus: 'Paid',
    createdAt: '2026-09-04T18:24:00Z',
  },
  {
    id: 'AURA-749218',
    customerName: 'Kenji Takahashi',
    customerEmail: 'k.takahashi@omotesando-arch.jp',
    shippingAddress: '3-12-8 Jingumae, Shibuya-ku',
    city: 'Tokyo',
    country: 'Japan',
    zip: '150-0001',
    items: [
      {
        key: 'out-002__Obsidian Black__L',
        productId: 'out-002',
        title: 'Structured Cashmere Blazer',
        price: 640,
        color: 'Obsidian Black',
        size: 'L',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
      },
      {
        key: 'ess-002__Obsidian Black__L',
        productId: 'ess-002',
        title: 'Tailored Pleated Trousers',
        price: 320,
        color: 'Obsidian Black',
        size: 'L',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
      },
    ],
    subtotal: 960,
    discount: 0,
    shipping: 0,
    tax: 76.8,
    grandTotal: 1036.8,
    status: 'Processing',
    paymentStatus: 'Paid',
    createdAt: '2026-09-05T02:15:00Z',
  },
  {
    id: 'AURA-610283',
    customerName: 'Marcus Lindqvist',
    customerEmail: 'marcus@nordicminimal.se',
    shippingAddress: 'Strandvägen 14',
    city: 'Stockholm',
    country: 'Sweden',
    zip: '114 56',
    items: [
      {
        key: 'ess-001__Cloud White__S',
        productId: 'ess-001',
        title: 'Merino Wool Ribbed Knit',
        price: 240,
        color: 'Cloud White',
        size: 'S',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
      },
    ],
    subtotal: 480,
    discount: 48,
    shipping: 0,
    tax: 34.56,
    grandTotal: 466.56,
    status: 'Delivered',
    paymentStatus: 'Paid',
    createdAt: '2026-09-02T11:40:00Z',
  },
];

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Products state - initialized with static defaults to ensure 100% SSR match
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Orders state - initialized with static defaults to ensure 100% SSR match
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);

  // Synchronize from localStorage only after initial client mount
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('aura_admin_products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
      }
    } catch (_) {}

    try {
      const storedOrders = localStorage.getItem('aura_admin_orders');
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) setOrders(parsed);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aura_admin_products', JSON.stringify(products));
    } catch (_) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_admin_orders', JSON.stringify(orders));
    } catch (_) {}
  }, [orders]);

  const openAdmin = () => setIsAdminOpen(true);
  const closeAdmin = () => setIsAdminOpen(false);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const id = `custom-${Date.now()}`;
    const newProduct: Product = { ...productData, id };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): string => {
    const id = `AURA-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return id;
  };

  const analytics = {
    totalRevenue: orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + o.grandTotal, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockCount: products.filter((p) => p.stock <= 5).length,
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminOpen,
        openAdmin,
        closeAdmin,
        products,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        addOrder,
        analytics,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (!context) {
    return {
      isAdminOpen: false,
      openAdmin: () => {},
      closeAdmin: () => {},
      products: INITIAL_PRODUCTS,
      orders: [],
      addProduct: () => {},
      updateProduct: () => {},
      deleteProduct: () => {},
      updateOrderStatus: () => {},
      addOrder: () => 'AURA-FALLBACK',
      analytics: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: INITIAL_PRODUCTS.length,
        lowStockCount: 0,
      },
    };
  }
  return context;
};
