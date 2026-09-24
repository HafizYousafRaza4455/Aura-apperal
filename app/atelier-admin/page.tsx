'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ShieldAlert,
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

export default function AtelierAdminDashboardPage() {
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
          return;
        }

        // Resilient fallback for third-party cookie restrictions
        const local = localStorage.getItem('aura_admin_session');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.role) {
            setCurrentUser(parsed);
            return;
          }
        }

        router.push('/atelier-admin/login');
      } catch (err) {
        const local = localStorage.getItem('aura_admin_session');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed && parsed.role) {
              setCurrentUser(parsed);
              return;
            }
          } catch {}
        }
        router.push('/atelier-admin/login');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('aura_admin_session');
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/atelier-admin/login';
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
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-[#D4AF37] font-mono text-xs tracking-[0.2em] uppercase">
        Verifying Atelier Executive Authorization...
      </div>
    );
  }

  const totalUnits = catalog.reduce((acc, p) => acc + p.stock, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FBF9F9] font-sans antialiased">
      {/* Top Navigation */}
      <header className="border-b border-[#222222] bg-[#141414] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-2xl tracking-[0.25em] text-[#FBF9F9] font-bold">
              AURA
            </Link>
            <span className="text-[#333333]">/</span>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-widest bg-[#1F1F1F] px-2.5 py-1 border border-[#D4AF37]/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ATELIER EXECUTIVE PORTAL</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-[#FBF9F9] font-medium">{currentUser?.name || 'Atelier Director'}</span>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{currentUser?.role || 'SUPER_ADMIN'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 border border-[#333333] hover:border-[#BA1A1A] hover:text-[#BA1A1A] text-[#A3A3A3] text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Terminate Session</span>
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#141414] border border-[#262626] p-6">
            <div className="flex items-center justify-between text-[#888888] mb-3">
              <span className="text-[11px] uppercase tracking-widest font-mono">Allocated Physical Stock</span>
              <Package className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-3xl font-mono text-[#FBF9F9]">{totalUnits} <span className="text-xs text-[#707070]">Units</span></p>
          </div>

          <div className="bg-[#141414] border border-[#262626] p-6">
            <div className="flex items-center justify-between text-[#888888] mb-3">
              <span className="text-[11px] uppercase tracking-widest font-mono">Active Dossier Queue</span>
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-3xl font-mono text-[#FBF9F9]">{orders.length} <span className="text-xs text-[#707070]">Orders</span></p>
          </div>

          <div className="bg-[#141414] border border-[#262626] p-6">
            <div className="flex items-center justify-between text-[#888888] mb-3">
              <span className="text-[11px] uppercase tracking-widest font-mono">Acquisition Volume</span>
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-3xl font-mono text-[#D4AF37]">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-4 mt-10 border-b border-[#222222] pb-px">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer border-b-2 ${
              activeTab === 'inventory'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#707070] hover:text-[#FBF9F9]'
            }`}
          >
            Archive Stock Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer border-b-2 ${
              activeTab === 'orders'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#707070] hover:text-[#FBF9F9]'
            }`}
          >
            Fulfillment Queue ({orders.filter((o) => o.status !== 'Delivered').length})
          </button>
        </div>

        {/* Tab 1: Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="mt-8 bg-[#141414] border border-[#262626] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] bg-[#111111] text-[10px] uppercase font-mono tracking-widest text-[#707070]">
                <tr>
                  <th className="py-4 px-6">Archive Silhouette</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Physical Units</th>
                  <th className="py-4 px-6 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {catalog.map((product) => (
                  <tr key={product.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      {product.colors[0]?.image && (
                        <div className="w-8 h-10 bg-[#222222] shrink-0 border border-[#333333] overflow-hidden">
                          <img src={product.colors[0].image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-serif text-sm text-[#FBF9F9]">{product.title}</p>
                        <p className="text-[10px] text-[#707070] font-mono">{product.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 uppercase font-mono text-[10px] text-[#A3A3A3]">
                      {product.category}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#D4AF37]">
                      ${product.price}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono text-sm ${product.stock <= 5 ? 'text-[#BA1A1A] font-bold' : 'text-[#FBF9F9]'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1 bg-[#1F1F1F] border border-[#333333] p-1">
                        <button
                          onClick={() => adjustStock(product.id, -1)}
                          className="p-1 hover:bg-[#333333] text-[#A3A3A3] hover:text-[#FBF9F9] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-xs text-[#D4AF37]">{product.stock}</span>
                        <button
                          onClick={() => adjustStock(product.id, 1)}
                          className="p-1 hover:bg-[#333333] text-[#A3A3A3] hover:text-[#FBF9F9] transition-colors cursor-pointer"
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

        {/* Tab 2: Orders Queue */}
        {activeTab === 'orders' && (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#141414] border border-[#262626] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#D4AF37] text-sm">{order.id}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest border ${
                      order.status === 'Delivered'
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                        : order.status === 'Shipped'
                        ? 'border-blue-500/30 text-blue-400 bg-blue-950/20'
                        : 'border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/10'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#FBF9F9]">{order.customerName} ({order.customerEmail})</p>
                  <p className="text-xs text-[#888888]">{order.items}</p>
                  <p className="text-[10px] text-[#666666] font-mono">{order.createdAt}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-base text-[#D4AF37] mr-4">${order.total}</span>
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Processing')}
                      className="px-3 py-1.5 bg-[#1F1F1F] border border-[#333333] hover:border-[#D4AF37] text-xs text-[#FBF9F9] cursor-pointer"
                    >
                      Mark Processing
                    </button>
                  )}
                  {order.status === 'Processing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Shipped')}
                      className="px-3 py-1.5 bg-[#1F1F1F] border border-[#333333] hover:border-[#D4AF37] text-xs text-[#FBF9F9] cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Dispatch Courier</span>
                    </button>
                  )}
                  {order.status === 'Shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="px-3 py-1.5 bg-emerald-950/50 border border-emerald-700 text-xs text-emerald-300 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm Delivery</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
