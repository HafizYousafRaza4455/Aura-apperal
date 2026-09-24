'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowRight, Lock, Mail, Key } from 'lucide-react';
import { DEMO_USERS } from '../../../lib/auth';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@aura-apparel.com');
  const [password, setPassword] = useState('ObsidianGold2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (userEmail: string) => {
    const u = DEMO_USERS[userEmail];
    if (u) {
      setEmail(u.email);
      setPassword(u.password);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FBF9F9] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-[#141414] border border-[#262626] p-8 sm:p-10 shadow-none rounded-none">
        {/* Atelier Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0D0D0D] border border-[#D4AF37]/40 mb-2">
            <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl uppercase tracking-[0.2em] font-normal text-[#FBF9F9]">
            Atelier Executive Hub
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#A3A3A3]">
            Staff RBAC Secure Authentication
          </p>
        </div>

        {/* Quick-select Staff Roles for rapid local testing */}
        <div className="border-y border-[#262626] py-3 my-4 space-y-2">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            One-Click Staff Credentials:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectRole('admin@aura-apparel.com')}
              className={`p-2 text-[10px] uppercase tracking-[0.1em] border transition-colors ${
                email === 'admin@aura-apparel.com'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#333333] hover:border-[#707070] text-[#A3A3A3]'
              }`}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => selectRole('merchandiser@aura-apparel.com')}
              className={`p-2 text-[10px] uppercase tracking-[0.1em] border transition-colors ${
                email === 'merchandiser@aura-apparel.com'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#333333] hover:border-[#707070] text-[#A3A3A3]'
              }`}
            >
              Merchandiser
            </button>
            <button
              type="button"
              onClick={() => selectRole('fulfillment@aura-apparel.com')}
              className={`p-2 text-[10px] uppercase tracking-[0.1em] border transition-colors ${
                email === 'fulfillment@aura-apparel.com'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#333333] hover:border-[#707070] text-[#A3A3A3]'
              }`}
            >
              Fulfillment
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#BA1A1A]/10 border border-[#BA1A1A] text-[#BA1A1A] text-xs font-sans">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#A3A3A3]">
              Staff Identifier (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#707070] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0D0D0D] border border-[#333333] text-sm text-[#FBF9F9] focus:outline-none focus:border-[#D4AF37] transition-colors rounded-none"
                placeholder="staff@aura-apparel.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#A3A3A3]">
              Encrypted Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#707070] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0D0D0D] border border-[#333333] text-sm text-[#FBF9F9] focus:outline-none focus:border-[#D4AF37] transition-colors rounded-none"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0D] font-sans font-semibold text-xs tracking-[0.25em] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Atelier Vault'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-[#707070] hover:text-[#D4AF37] tracking-[0.15em] uppercase transition-colors"
          >
            ← Return to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-[#D4AF37] font-sans text-xs tracking-[0.2em] uppercase">
          Initializing Atelier Vault...
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
