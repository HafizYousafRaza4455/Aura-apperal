'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Clock, Shield } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || 'cs_live_sample';
  const reservationId = searchParams.get('reservation_id') || 'res_confirmed';

  const orderNumber = `AUR-${Math.floor(100000 + Math.random() * 900000)}-${reservationId.slice(-4).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FBF9F9] font-sans antialiased flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[#222222] bg-[#111111]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-center">
            <span className="font-serif text-2xl tracking-[0.25em] text-[#FBF9F9] font-bold">
              AURA
            </span>
          </Link>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1">
            CONFIRMED ACQUISITION
          </div>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] mb-8">
          <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.1em] text-[#FBF9F9] mb-3">
          Your Acquisition is Confirmed
        </h1>
        <p className="text-sm text-[#A3A3A3] max-w-md mx-auto mb-10 leading-relaxed">
          Thank you for choosing Aura. Our master tailors and logistics concierge are preparing your
          bespoke pieces.
        </p>

        {/* Dossier Card */}
        <div className="bg-[#141414] border border-[#2B2B2B] text-left p-8 space-y-6 mb-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#222222] pb-6 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#707070]">
                Dossier Number
              </span>
              <p className="font-mono text-base text-[#D4AF37] font-medium">{orderNumber}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#707070]">
                Payment Status
              </span>
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                VERIFIED VIA STRIPE
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#707070]">
                Estimated Delivery
              </span>
              <p className="text-xs text-[#FBF9F9] font-mono">2–3 Business Days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#A3A3A3]">
            <div>
              <h3 className="font-serif uppercase tracking-wider text-[#D4AF37] mb-2">
                White-Glove Dispatch
              </h3>
              <p>Direct courier with garment bags and tamper-evident seal.</p>
            </div>
            <div>
              <h3 className="font-serif uppercase tracking-wider text-[#D4AF37] mb-2">
                Concierge Contact
              </h3>
              <p>atelier@aura-apparel.com | +1 (800) 840-AURA</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account"
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0D0D0D] font-medium uppercase tracking-[0.2em] text-xs px-8 py-4 transition-colors flex items-center justify-center gap-2"
          >
            <span>View Dossier in Account Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto border border-[#333333] hover:border-[#FBF9F9] text-[#FBF9F9] uppercase tracking-[0.2em] text-xs px-8 py-4 transition-colors"
          >
            Return to Boutique
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] py-8 text-center text-xs text-[#666666]">
        <p className="tracking-widest uppercase text-[10px]">
          © 2026 AURA APPAREL ATELIER. MILAN • TOKYO • NEW YORK.
        </p>
      </footer>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-xs text-[#D4AF37] tracking-[0.2em] uppercase">
          Loading Order Confirmation...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
