'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { AuthUser } from '../../lib/auth';
import { PRODUCTS } from '../../src/data/products';
import { Product } from '../../src/types/product';

interface OrderRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  items: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  createdAt: string;
}

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'AURA-98210',
    customerName: 'Victoria Sterling',
    customerEmail: 'v.sterling@mayfair-london.co.uk',
    items: 'The Oversized Wool Trench (M), Structured Cashmere Blazer (L)',
    total: 1220,
    status: 'Processing',
    createdAt: 'Today, 10:14 AM',
  },
  {
    id: 'AURA-98211',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@geneva-private.ch',
    items: 'Cropped Shearling Aviator (L)',
    total: 780,
    status: 'Shipped',
    createdAt: 'Yesterday, 4:30 PM',
  },
  {
    id: 'AURA-98212',
    customerName: 'Hélène De Montmirail',
    customerEmail: 'helene@montmirail-paris.fr',
    items: 'Air-Spun Belgian Linen Shirt (M)',
    total: 320,
    status: 'Pending',
    createdAt: 'Today, 8:05 AM',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const adjustStock = (productId: string, delta: number) => {
    setCatalog((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const updateOrderStatus = (orderId: string, nextStatus: OrderRecord['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-[#D4AF37]">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const totalStockUnits = catalog.reduce((acc, p) => acc + p.stock, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="min-h-screen bg-[#FBF9F9] text-[#0D0D0D] flex flex-col">
      {/* Top Staff Navigation Bar */}
      <header className="bg-[#0D0D0D] text-[#FBF9F9] border-b border-[#262626] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-[#1A1A1A] border border-[#D4AF37]/50 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="font-serif text-lg tracking-[0.15em] uppercase font-normal">
              AURA APPAREL ATELIER
            </h1>
            <p className="font-sans text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase">
              Staff Portal • {currentUser?.role?.replace('_', ' ') || 'EXECUTIVE'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#FBF9F9] font-medium">{currentUser?.name || currentUser?.email}</p>
            <p className="text-[10px] text-[#A3A3A3]">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 border border-[#333333] hover:border-[#BA1A1A] hover:text-[#BA1A1A] text-[#A3A3A3] text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer rounded-none"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-white border border-[#E5E5E5] rounded-none">
            <div className="flex items-center justify-between text-[#707070] mb-2">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans">Active Vault Items</span>
              <Package className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="font-serif text-3xl font-medium text-[#0D0D0D]">{catalog.length} Styles</p>
            <p className="text-[11px] text-[#707070] mt-1">{totalStockUnits} physical units reserved</p>
          </div>

          <div className="p-6 bg-white border border-[#E5E5E5] rounded-none">
            <div className="flex items-center justify-between text-[#707070] mb-2">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans">Gross Revenue (Today)</span>
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="font-serif text-3xl font-medium text-[#0D0D0D]">${totalRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-[#D4AF37] mt-1">100% luxury settlement</p>
          </div>

          <div className="p-6 bg-white border border-[#E5E5E5] rounded-none">
            <div className="flex items-center justify-between text-[#707070] mb-2">
              <span className="text-[11px] uppercase tracking-[0.2em] font-sans">Pending Dispatch</span>
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="font-serif text-3xl font-medium text-[#0D0D0D]">
              {orders.filter((o) => o.status !== 'Delivered').length} Orders
            </p>
            <p className="text-[11px] text-[#707070] mt-1">Milan Atelier & Tokyo Hub</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E5E5] space-x-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-colors cursor-pointer relative ${
              activeTab === 'inventory' ? 'text-[#0D0D0D]' : 'text-[#707070] hover:text-[#0D0D0D]'
            }`}
          >
            Live Inventory Management
            {activeTab === 'inventory' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-sans font-medium transition-colors cursor-pointer relative ${
              activeTab === 'orders' ? 'text-[#0D0D0D]' : 'text-[#707070] hover:text-[#0D0D0D]'
            }`}
          >
            Fulfillment Queue
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
        </div>

        {/* Inventory View */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-[#E5E5E5] overflow-x-auto rounded-none">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F3] border-b border-[#E5E5E5] font-sans uppercase tracking-[0.15em] text-[#707070]">
                <tr>
                  <th className="p-4">Style</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Warehouse Stock</th>
                  <th className="p-4 text-right">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {catalog.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FBF9F9] transition-colors">
                    <td className="p-4">
                      <p className="font-serif font-medium text-sm text-[#0D0D0D]">{p.title}</p>
                      <p className="text-[11px] text-[#707070]">{p.subtitle}</p>
                    </td>
                    <td className="p-4 uppercase tracking-wider text-[10px] text-[#707070]">
                      {p.category}
                    </td>
                    <td className="p-4 font-mono font-medium">${p.price}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest ${
                          p.stock <= 5
                            ? 'bg-[#BA1A1A]/10 text-[#BA1A1A] border border-[#BA1A1A]/30'
                            : 'bg-[#F5F5F3] text-[#0D0D0D] border border-[#E5E5E5]'
                        }`}
                      >
                        {p.stock} Available
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          className="w-7 h-7 border border-[#E5E5E5] hover:border-[#0D0D0D] flex items-center justify-center transition-colors cursor-pointer"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          className="w-7 h-7 border border-[#E5E5E5] hover:border-[#D4AF37] flex items-center justify-center transition-colors cursor-pointer"
                          title="Increase Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Fulfillment View */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-[#E5E5E5] overflow-x-auto rounded-none">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F3] border-b border-[#E5E5E5] font-sans uppercase tracking-[0.15em] text-[#707070]">
                <tr>
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FBF9F9] transition-colors">
                    <td className="p-4 font-mono font-medium">{o.id}</td>
                    <td className="p-4">
                      <p className="font-serif font-medium text-[#0D0D0D]">{o.customerName}</p>
                      <p className="text-[11px] text-[#707070]">{o.customerEmail}</p>
                    </td>
                    <td className="p-4 text-xs text-[#707070] max-w-xs truncate">{o.items}</td>
                    <td className="p-4 font-mono font-medium">${o.total}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'Shipped'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : o.status === 'Processing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {o.status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'Processing')}
                          className="px-3 py-1.5 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Process
                        </button>
                      )}
                      {o.status === 'Processing' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'Shipped')}
                          className="px-3 py-1.5 bg-[#D4AF37] text-[#0D0D0D] text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}
                      {o.status === 'Shipped' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'Delivered')}
                          className="px-3 py-1.5 border border-[#E5E5E5] hover:border-[#0D0D0D] text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {o.status === 'Delivered' && (
                        <span className="text-[11px] text-emerald-600 font-medium">Fulfilled ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
