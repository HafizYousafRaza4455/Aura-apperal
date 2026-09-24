'use client';

// src/components/admin/AdminPanel.tsx
import React, { useState } from 'react';
import {
  X,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useAdmin, Order } from '../../context/AdminContext';
import { Product, Category, ProductBadge } from '../../types/product';

export const AdminPanel: React.FC = () => {
  const {
    isAdminOpen,
    closeAdmin,
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    analytics,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('analytics');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form state for new / edit product
  const [productForm, setProductForm] = useState<{
    title: string;
    subtitle: string;
    price: number;
    category: Category;
    stock: number;
    badge: ProductBadge | '';
    description: string;
    imageUrl: string;
  }>({
    title: '',
    subtitle: '',
    price: 350,
    category: 'outerwear',
    stock: 15,
    badge: 'NEW ARRIVAL',
    description: 'Bespoke tailoring constructed from ultra-fine natural fibres.',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
  });

  if (!isAdminOpen) return null;

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      subtitle: '',
      price: 290,
      category: 'outerwear',
      stock: 12,
      badge: 'NEW ARRIVAL',
      description: 'Architectural silhouette engineered with minimalist precision.',
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop',
    });
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      title: p.title,
      subtitle: p.subtitle,
      price: p.price,
      category: p.category,
      stock: p.stock,
      badge: p.badge || '',
      description: p.description,
      imageUrl: p.colors?.[0]?.image || '',
    });
    setIsEditingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title) return;

    if (editingProductId) {
      updateProduct(editingProductId, {
        title: productForm.title,
        subtitle: productForm.subtitle,
        price: Number(productForm.price),
        category: productForm.category,
        stock: Number(productForm.stock),
        badge: (productForm.badge as ProductBadge) || undefined,
        description: productForm.description,
        colors: [
          {
            name: 'Obsidian Black',
            hex: '#0D0D0D',
            image: productForm.imageUrl,
            secondaryImage: productForm.imageUrl,
          },
        ],
      });
    } else {
      addProduct({
        title: productForm.title,
        subtitle: productForm.subtitle,
        price: Number(productForm.price),
        category: productForm.category,
        stock: Number(productForm.stock),
        badge: (productForm.badge as ProductBadge) || undefined,
        description: productForm.description,
        details: [
          'Archival cut and finish',
          'Concealed horn hardware',
          'Limited numbered atelier edition',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          {
            name: 'Obsidian Black',
            hex: '#0D0D0D',
            image: productForm.imageUrl,
            secondaryImage: productForm.imageUrl,
          },
        ],
      });
    }
    setIsEditingProduct(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-panel-title"
      className="fixed inset-0 z-[100] flex bg-[#0D0D0D]/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full h-full bg-[#FBF9F9] flex flex-col md:flex-row overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#0D0D0D] text-white flex flex-col justify-between border-r border-[#262626]">
          <div>
            {/* Brand Header */}
            <div className="p-6 border-b border-[#262626] flex items-center justify-between">
              <div>
                <span className="font-serif text-lg tracking-[0.25em] text-[#D4AF37] uppercase font-medium">
                  AURA
                </span>
                <p className="text-[10px] font-sans tracking-[0.2em] text-neutral-400 uppercase mt-0.5">
                  Atelier Executive Hub
                </p>
              </div>
              <button
                type="button"
                onClick={closeAdmin}
                className="md:hidden p-2 text-neutral-400 hover:text-white"
                aria-label="Close admin"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="p-4 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('analytics');
                  setIsEditingProduct(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer rounded-none text-left ${
                  activeTab === 'analytics'
                    ? 'bg-[#D4AF37] text-[#0D0D0D] font-semibold'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Executive Overview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('products');
                  setIsEditingProduct(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer rounded-none text-left ${
                  activeTab === 'products'
                    ? 'bg-[#D4AF37] text-[#0D0D0D] font-semibold'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Archival Inventory</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-white">
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setIsEditingProduct(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer rounded-none text-left ${
                  activeTab === 'orders'
                    ? 'bg-[#D4AF37] text-[#0D0D0D] font-semibold'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Client Orders</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-white">
                  {orders.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-[#262626] bg-[#141414]">
            <button
              type="button"
              onClick={closeAdmin}
              className="w-full py-3 border border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-sans uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </aside>

        {/* MAIN ADMIN WORKSPACE */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 px-6 sm:px-10 border-b border-[#E5E5E5] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              <h1 id="admin-panel-title" className="font-serif text-lg uppercase tracking-wide text-[#0D0D0D]">
                {activeTab === 'analytics' && 'Operational Analytics & Revenue'}
                {activeTab === 'products' && 'Archival Garment Catalog'}
                {activeTab === 'orders' && 'Bespoke Client Orders'}
              </h1>
            </div>

            <button
              type="button"
              onClick={closeAdmin}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#E5E5E5] hover:border-[#0D0D0D] text-xs font-sans uppercase tracking-widest text-[#707070] hover:text-[#0D0D0D] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </header>

          {/* TAB CONTENT CONTAINER */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FBF9F9]">
            {/* 1. OVERVIEW & ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 max-w-6xl mx-auto">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-6 border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between text-[#707070]">
                      <span className="text-xs uppercase tracking-[0.15em] font-medium">Total Revenue</span>
                      <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
                      {formatPrice(analytics.totalRevenue)}
                    </p>
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% from last drop
                    </span>
                  </div>

                  <div className="bg-white p-6 border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between text-[#707070]">
                      <span className="text-xs uppercase tracking-[0.15em] font-medium">Delivered Orders</span>
                      <ShoppingBag className="w-4 h-4 text-[#0D0D0D]" />
                    </div>
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
                      {analytics.totalOrders}
                    </p>
                    <span className="text-[11px] text-[#707070] uppercase tracking-wider">
                      100% Fulfilled
                    </span>
                  </div>

                  <div className="bg-white p-6 border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between text-[#707070]">
                      <span className="text-xs uppercase tracking-[0.15em] font-medium">Curated Pieces</span>
                      <Package className="w-4 h-4 text-[#0D0D0D]" />
                    </div>
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
                      {analytics.totalProducts}
                    </p>
                    <span className="text-[11px] text-[#707070] uppercase tracking-wider">
                      3 Active Movements
                    </span>
                  </div>

                  <div className="bg-white p-6 border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between text-[#707070]">
                      <span className="text-xs uppercase tracking-[0.15em] font-medium">Low Stock Alerts</span>
                      <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
                    </div>
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#BA1A1A]">
                      {analytics.lowStockCount}
                    </p>
                    <span className="text-[11px] text-[#BA1A1A] font-medium uppercase tracking-wider">
                      ≤ 5 units remaining
                    </span>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg uppercase tracking-wide text-[#0D0D0D]">
                      Recent Atelier Orders
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-sans uppercase tracking-widest text-[#D4AF37] hover:underline"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] text-[#707070] uppercase tracking-wider font-semibold">
                          <th className="pb-3">Reference</th>
                          <th className="pb-3">Client</th>
                          <th className="pb-3">Items</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {orders.slice(0, 4).map((o) => (
                          <tr key={o.id} className="hover:bg-[#FBF9F9] transition-colors">
                            <td className="py-3.5 font-mono font-medium text-[#0D0D0D]">{o.id}</td>
                            <td className="py-3.5 text-[#0D0D0D] font-medium">{o.customerName}</td>
                            <td className="py-3.5 text-[#707070]">{o.items.length} garments</td>
                            <td className="py-3.5 font-mono font-semibold text-[#0D0D0D]">
                              {formatPrice(o.grandTotal)}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`px-2 py-0.5 text-[10px] uppercase font-sans tracking-widest font-semibold ${
                                  o.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.status === 'Shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCT CATALOG MANAGEMENT TAB */}
            {activeTab === 'products' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
                      <input
                        id="admin-product-search"
                        name="productSearch"
                        type="search"
                        autoComplete="off"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search editions by title or subtitle..."
                        aria-label="Search editions by title or subtitle"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#0D0D0D] rounded-none"
                      />
                    </div>
                    <div className="flex items-center border border-[#E5E5E5] bg-white px-3 py-2">
                      <Filter className="w-3.5 h-3.5 text-[#707070] mr-2" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="text-xs bg-transparent focus:outline-none uppercase tracking-wider"
                      >
                        <option value="all">All Movements</option>
                        <option value="outerwear">Outerwear</option>
                        <option value="essentials">Essentials</option>
                        <option value="summer-drop">Summer Drop</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="px-5 py-2.5 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Edition</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white border border-[#E5E5E5]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] bg-[#FBF9F9] text-[#707070] uppercase tracking-wider font-semibold">
                          <th className="p-4">Piece</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Badge</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FBF9F8] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-12 bg-[#E5E5E5] overflow-hidden flex-shrink-0 border border-[#E5E5E5]">
                                  {p.colors?.[0]?.image ? (
                                    <img src={p.colors[0].image} alt="" className="w-full h-full object-cover" />
                                  ) : null}
                                </div>
                                <div>
                                  <p className="font-serif text-sm text-[#0D0D0D] font-medium">{p.title}</p>
                                  <p className="text-[11px] text-[#707070] line-clamp-1">{p.subtitle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-sans uppercase tracking-wider text-[#707070]">
                              {p.category}
                            </td>
                            <td className="p-4 font-mono font-semibold text-[#0D0D0D]">
                              {formatPrice(p.price)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`font-mono px-2 py-0.5 text-xs font-semibold ${
                                  p.stock <= 5
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'text-[#0D0D0D]'
                                }`}
                              >
                                {p.stock} units
                              </span>
                            </td>
                            <td className="p-4">
                              {p.badge ? (
                                <span className="px-2 py-0.5 bg-[#F5F4F0] text-[10px] font-sans tracking-widest uppercase font-semibold border border-[#E5E5E5]">
                                  {p.badge}
                                </span>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 text-[#707070] hover:text-[#0D0D0D] hover:bg-[#F5F5F3] transition-colors cursor-pointer"
                                  title="Edit piece"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-1.5 text-[#707070] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete piece"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CLIENT ORDERS MANAGEMENT TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-lg uppercase tracking-wide text-[#0D0D0D]">
                        All Client Orders ({orders.length})
                      </h2>
                      <p className="text-xs text-[#707070]">
                        Manage order statuses, courier tracking, and customer records.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] bg-[#FBF9F9] text-[#707070] uppercase tracking-wider font-semibold">
                          <th className="p-4">Reference</th>
                          <th className="p-4">Client Details</th>
                          <th className="p-4">Garments Ordered</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status & Dispatch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-[#FBF9F8] transition-colors">
                            <td className="p-4 font-mono font-medium text-[#0D0D0D]">
                              <div>{o.id}</div>
                              <div className="text-[10px] text-[#707070] mt-0.5">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-[#0D0D0D]">{o.customerName}</div>
                              <div className="text-[#707070] text-[11px]">{o.customerEmail}</div>
                              <div className="text-[#707070] text-[10px]">
                                {o.city}, {o.country}
                              </div>
                            </td>
                            <td className="p-4">
                              <ul className="space-y-1">
                                {o.items.map((item, i) => (
                                  <li key={i} className="text-[11px] text-[#0D0D0D]">
                                    {item.quantity}x {item.title} ({item.color}, {item.size})
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="p-4 font-mono font-bold text-[#0D0D0D]">
                              {formatPrice(o.grandTotal)}
                            </td>
                            <td className="p-4">
                              <select
                                value={o.status}
                                onChange={(e) =>
                                  updateOrderStatus(o.id, e.target.value as Order['status'])
                                }
                                className={`text-xs font-sans font-semibold uppercase tracking-wider px-2.5 py-1.5 border rounded-none focus:outline-none cursor-pointer ${
                                  o.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : o.status === 'Shipped'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : o.status === 'Processing'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* EDIT / CREATE PRODUCT MODAL OVERLAY */}
      {isEditingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-lg bg-white border border-[#E5E5E5] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <h3 className="font-serif text-lg uppercase tracking-wide text-[#0D0D0D]">
                {editingProductId ? 'Modify Archival Piece' : 'Add New Archival Piece'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingProduct(false)}
                className="p-1 text-[#707070] hover:text-[#0D0D0D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label htmlFor="admin-product-title" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                  Title
                </label>
                <input
                  id="admin-product-title"
                  name="title"
                  required
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Sculptural Cashmere Trench"
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                />
              </div>

              <div>
                <label htmlFor="admin-product-subtitle" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                  Subtitle
                </label>
                <input
                  id="admin-product-subtitle"
                  name="subtitle"
                  required
                  type="text"
                  value={productForm.subtitle}
                  onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                  placeholder="e.g. Double-faced virgin wool with horn buttons"
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-product-price" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                    Price (USD)
                  </label>
                  <input
                    id="admin-product-price"
                    name="price"
                    required
                    type="number"
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                  />
                </div>
                <div>
                  <label htmlFor="admin-product-stock" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                    Stock Units
                  </label>
                  <input
                    id="admin-product-stock"
                    name="stock"
                    required
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-product-category" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                    Movement Category
                  </label>
                  <select
                    id="admin-product-category"
                    name="category"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Category })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                  >
                    <option value="outerwear">Outerwear</option>
                    <option value="essentials">Essentials</option>
                    <option value="summer-drop">Summer Drop</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="admin-product-badge" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                    Luxury Badge
                  </label>
                  <select
                    id="admin-product-badge"
                    name="badge"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value as ProductBadge | '' })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                  >
                    <option value="">None</option>
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                    <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="SUMMER DROP">SUMMER DROP</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="admin-product-image-url" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                  Image URL
                </label>
                <input
                  id="admin-product-image-url"
                  name="imageUrl"
                  required
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                />
              </div>

              <div>
                <label htmlFor="admin-product-description" className="block text-[11px] uppercase tracking-wider font-semibold text-[#0D0D0D] mb-1">
                  Description
                </label>
                <textarea
                  id="admin-product-description"
                  name="description"
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] focus:outline-none focus:border-[#0D0D0D] bg-[#FBF9F9]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="px-5 py-2.5 text-xs uppercase tracking-widest text-[#707070] hover:text-[#0D0D0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D0D0D] text-white hover:bg-[#D4AF37] hover:text-[#0D0D0D] text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? 'Update Piece' : 'Create Piece'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
