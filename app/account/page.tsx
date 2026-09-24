'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  MapPin,
  Scissors,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface CustomerOrder {
  id: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Tailoring';
  items: string[];
  trackingNumber: string;
  total: number;
}

const PAST_ORDERS: CustomerOrder[] = [
  {
    id: 'AURA-77192',
    date: 'August 18, 2026',
    status: 'In Transit',
    items: ['The Oversized Wool Trench — Obsidian Black (M)', 'Structured Cashmere Blazer — Bone White (M)'],
    trackingNumber: 'DHL-EXPRESS-99210482',
    total: 1220,
  },
  {
    id: 'AURA-65201',
    date: 'June 04, 2026',
    status: 'Delivered',
    items: ['Air-Spun Belgian Linen Shirt — Natural Sand (M)'],
    trackingNumber: 'DHL-EXPRESS-88120391',
    total: 320,
  },
];

export default function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'alterations'>('orders');
  const [alterationSent, setAlterationSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBF9F9] text-[#0D0D0D] flex flex-col">
      {/* Client Header */}
      <header className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#D4AF37] mb-1">
              <span className="w-4 h-[1px] bg-[#D4AF37]" />
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold">
                Private Client Concierge
              </span>
            </div>
            <h1 className="font-serif text-3xl uppercase tracking-tight text-[#0D0D0D]">
              Victoria Sterling
            </h1>
            <p className="text-xs text-[#707070] font-sans mt-0.5">
              Member of the Permanent Atelier Collection • Client #AURA-4921
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.15em] text-[#0D0D0D] hover:text-[#D4AF37] transition-colors border border-[#E5E5E5] hover:border-[#0D0D0D] px-4 py-2"
            >
              ← Back to Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Account Portal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E5E5] space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3.5 text-xs font-sans uppercase tracking-[0.2em] transition-colors cursor-pointer relative ${
              activeTab === 'orders' ? 'text-[#0D0D0D] font-semibold' : 'text-[#707070] hover:text-[#0D0D0D]'
            }`}
          >
            Order Archive & Tracking
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3.5 text-xs font-sans uppercase tracking-[0.2em] transition-colors cursor-pointer relative ${
              activeTab === 'addresses' ? 'text-[#0D0D0D] font-semibold' : 'text-[#707070] hover:text-[#0D0D0D]'
            }`}
          >
            Atelier Measurements & Addresses
            {activeTab === 'addresses' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('alterations')}
            className={`pb-3.5 text-xs font-sans uppercase tracking-[0.2em] transition-colors cursor-pointer relative ${
              activeTab === 'alterations' ? 'text-[#0D0D0D] font-semibold' : 'text-[#707070] hover:text-[#0D0D0D]'
            }`}
          >
            Bespoke Alteration Concierge
            {activeTab === 'alterations' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {PAST_ORDERS.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E5E5E5] p-6 space-y-4 rounded-none transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E5E5] gap-2">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                      {order.id}
                    </span>
                    <p className="text-xs text-[#707070]">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-[10px] uppercase tracking-widest font-semibold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#D4AF37]/10 text-[#0D0D0D] border border-[#D4AF37]'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-mono text-sm font-semibold">${order.total}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-[#0D0D0D] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#707070] gap-2 border-t border-[#F5F5F3]">
                  <p>
                    Courier: <span className="font-mono text-[#0D0D0D] font-medium">{order.trackingNumber}</span>
                  </p>
                  <a
                    href={`https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0D0D0D] hover:text-[#D4AF37] font-medium uppercase tracking-wider text-[11px] transition-colors"
                  >
                    Track Live Dispatch
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Measurements & Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Atelier Sizing Passport */}
            <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <h3 className="font-serif text-base uppercase tracking-wider text-[#0D0D0D]">
                  Bespoke Sizing Profile
                </h3>
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-xs text-[#707070] leading-relaxed">
                Archived by Master Tailor Giorgio Rossi at the Milan Flagship Atelier. Used for complimentary pre-dispatch adjustments.
              </p>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
                <div className="p-3 bg-[#FBF9F9] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#707070] uppercase">Jacket / Coat Size</p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">38R (IT 48)</p>
                </div>
                <div className="p-3 bg-[#FBF9F9] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#707070] uppercase">Sleeve Inseam</p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">33.5 in (85 cm)</p>
                </div>
                <div className="p-3 bg-[#FBF9F9] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#707070] uppercase">Trouser Waist</p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">30 in (76 cm)</p>
                </div>
                <div className="p-3 bg-[#FBF9F9] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#707070] uppercase">Trouser Hem</p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">No Break, 31 in</p>
                </div>
              </div>
            </div>

            {/* Saved Delivery Residences */}
            <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                <h3 className="font-serif text-base uppercase tracking-wider text-[#0D0D0D]">
                  Preferred Delivery Residence
                </h3>
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="p-4 bg-[#FBF9F9] border border-[#D4AF37] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[10px] uppercase tracking-widest text-[#D4AF37]">
                    Primary Residence (Default)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    White-Glove Verified
                  </span>
                </div>
                <p className="font-medium text-sm text-[#0D0D0D] pt-1">Victoria Sterling</p>
                <p className="text-[#707070]">14 Berkeley Square, Apt 4B</p>
                <p className="text-[#707070]">Mayfair, London, W1J 5AW</p>
                <p className="text-[#707070]">United Kingdom</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bespoke Alteration Concierge */}
        {activeTab === 'alterations' && (
          <div className="max-w-2xl bg-white border border-[#E5E5E5] p-8 space-y-6">
            <div>
              <h3 className="font-serif text-xl uppercase tracking-wide text-[#0D0D0D]">
                Request Atelier Alterations
              </h3>
              <p className="text-xs text-[#707070] mt-1 leading-relaxed">
                All garments from the Permanent Archive qualify for lifetime complimentary silhouette refinement and seasonal fabric refreshing.
              </p>
            </div>

            {alterationSent ? (
              <div className="p-6 bg-[#D4AF37]/10 border border-[#D4AF37] space-y-2">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-serif text-sm tracking-wider font-semibold">
                    DISPATCH COURIER NOTIFIED
                  </span>
                </div>
                <p className="text-xs text-[#0D0D0D]/80">
                  Our white-glove concierge will collect your garment from your Mayfair residence on Tuesday, September 8th. A private courier tracking SMS has been dispatched.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAlterationSent(true);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-[10px] text-[#707070]">
                    Select Archival Garment
                  </label>
                  <select className="w-full p-3 bg-white border border-[#E5E5E5] rounded-none focus:outline-none focus:border-[#0D0D0D]">
                    <option>The Oversized Wool Trench (AURA-77192)</option>
                    <option>Structured Cashmere Blazer (AURA-77192)</option>
                    <option>Air-Spun Belgian Linen Shirt (AURA-65201)</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold mb-1 text-[10px] text-[#707070]">
                    Desired Adjustment
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Shorten trench coat hem by 1.5 inches, preserve cupro lining pick-stitching..."
                    className="w-full p-3 bg-white border border-[#E5E5E5] rounded-none focus:outline-none focus:border-[#0D0D0D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#0D0D0D] hover:bg-[#D4AF37] text-white hover:text-[#0D0D0D] font-semibold text-xs tracking-[0.2em] uppercase transition-colors rounded-none cursor-pointer"
                >
                  Submit Concierge Dispatch Request
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
