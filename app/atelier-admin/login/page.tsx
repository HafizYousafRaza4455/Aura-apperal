'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, AlertTriangle, Eye, EyeOff, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

function AtelierAdminLoginContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // Lockout state (3,600 seconds = 1 Hour)
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Initialize lockout from server & localStorage
  useEffect(() => {
    // 1. Check localStorage first
    try {
      const storedLock = localStorage.getItem('aura_admin_lockout');
      if (storedLock) {
        const lockedUntil = parseInt(storedLock, 10);
        const diff = Math.ceil((lockedUntil - Date.now()) / 1000);
        if (diff > 0) {
          setIsLocked(true);
          setRemainingSeconds(diff);
        } else {
          localStorage.removeItem('aura_admin_lockout');
        }
      }
    } catch {}

    // 2. Query backend lockout status
    fetch('/api/auth/admin-passcode')
      .then((res) => res.json())
      .then((data) => {
        if (data.locked && data.remainingSeconds > 0) {
          setIsLocked(true);
          setRemainingSeconds(data.remainingSeconds);
          const until = Date.now() + data.remainingSeconds * 1000;
          try {
            localStorage.setItem('aura_admin_lockout', until.toString());
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Countdown timer when locked
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) {
      if (remainingSeconds <= 0 && isLocked) {
        setIsLocked(false);
        setErrorMessage(null);
        try {
          localStorage.removeItem('aura_admin_lockout');
        } catch {}
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          try {
            localStorage.removeItem('aura_admin_lockout');
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, remainingSeconds]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/admin-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.locked) {
          setIsLocked(true);
          setRemainingSeconds(data.remainingSeconds || 3600);
          const until = Date.now() + (data.remainingSeconds || 3600) * 1000;
          try {
            localStorage.setItem('aura_admin_lockout', until.toString());
          } catch {}
          setErrorMessage('SECURITY PROTOCOL ACTIVATED: 5 incorrect password attempts. Re-enter button locked for 1 hour.');
        } else {
          setAttemptsLeft(data.attemptsLeft);
          setErrorMessage(data.message || 'Invalid admin passcode.');
        }
        setIsLoading(false);
        return;
      }

      // Success: Clear any residual lockout and navigate to admin portal
      try {
        localStorage.removeItem('aura_admin_lockout');
        if (data.user) {
          localStorage.setItem('aura_admin_session', JSON.stringify(data.user));
        }
      } catch {}

      window.location.href = data.redirect || '/atelier-admin';
    } catch {
      setErrorMessage('Network authorization error. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FBF9F9] flex flex-col justify-between font-sans antialiased">
      {/* Header */}
      <header className="border-b border-[#222222] bg-[#111111]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Public Boutique</span>
          </Link>

          <div className="text-center">
            <span className="font-serif text-xl tracking-[0.25em] text-[#FBF9F9] font-bold">
              AURA ATELIER
            </span>
            <span className="block text-[8px] uppercase tracking-[0.35em] text-[#D4AF37]">
              EXECUTIVE ACCESS
            </span>
          </div>

          <div className="text-[10px] uppercase font-mono tracking-widest text-[#666666] border border-[#2B2B2B] px-2.5 py-1">
            SECRET GATEWAY
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-[#141414] border border-[#2B2B2B] p-8 sm:p-10 space-y-8 shadow-2xl">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-none bg-[#1F1F1F] border border-[#D4AF37]/40 mb-2">
              <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h1 className="font-serif text-2xl tracking-[0.1em] text-[#FBF9F9] font-normal uppercase">
              Staff Authorization
            </h1>
            <p className="text-xs text-[#888888] tracking-wider">
              Private access point for Atelier Directors, Merchandisers & Fulfillment.
            </p>
          </div>

          {/* 1-Hour Lockout Alert Banner */}
          {isLocked ? (
            <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold tracking-wider uppercase text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Security Protocol: Lockout Active</span>
              </div>
              <p className="leading-relaxed">
                5 consecutive incorrect password submissions detected. To protect inventory and executive dossiers, re-entering passwords is temporarily locked.
              </p>
              <div className="p-3 bg-red-950 border border-red-800/80 flex items-center justify-between font-mono text-sm text-[#D4AF37]">
                <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-300">
                  <Clock className="w-4 h-4" />
                  Cooldown:
                </span>
                <span className="font-bold text-base">{formatTime(remainingSeconds)}</span>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="p-3.5 bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="flex-1">
                <p>{errorMessage}</p>
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <p className="font-mono text-[10px] text-red-400 mt-1 uppercase">
                    Attempts Remaining: {attemptsLeft} of 5
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#A3A3A3] mb-2">
                Executive Master Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked || isLoading}
                  placeholder="Enter authorized password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#D4AF37] px-4 py-3.5 text-sm text-[#FBF9F9] placeholder-[#555555] rounded-none outline-none font-mono disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                />
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#FBF9F9] p-1 cursor-pointer disabled:opacity-40"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#666666] mt-2 font-mono">
                Default Atelier Passcode: <span className="text-[#D4AF37]">AuraAtelier2026!</span>
              </p>
            </div>

            {/* Re-enter / Authorize Button */}
            <button
              type="submit"
              disabled={isLocked || isLoading}
              className="w-full py-4 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0D0D0D] font-sans font-medium uppercase tracking-[0.25em] text-xs transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 rounded-none"
            >
              {isLocked ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>RE-ENTER LOCKED ({formatTime(remainingSeconds)})</span>
                </>
              ) : isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>AUTHORIZE ATELIER SESSION</span>
                </>
              )}
            </button>
          </form>

          {/* User vs Admin URL Distinction Callout */}
          <div className="pt-6 border-t border-[#222222] text-[11px] text-[#707070] space-y-2">
            <div className="flex items-center justify-between">
              <span>Client Profile Portal:</span>
              <Link href="/account" className="text-[#D4AF37] underline hover:text-[#FBF9F9]">
                /account
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>Executive Staff Gateway:</span>
              <span className="font-mono text-[#A3A3A3]">/atelier-admin</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] py-6 text-center text-xs text-[#666666]">
        <p className="tracking-widest uppercase text-[10px]">
          © 2026 AURA APPAREL ATELIER. RESTRICTED EXECUTIVE ACCESS.
        </p>
      </footer>
    </div>
  );
}

export default function AtelierAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-xs text-[#D4AF37] tracking-[0.2em] uppercase">
          Initializing Executive Security Gate...
        </div>
      }
    >
      <AtelierAdminLoginContent />
    </Suspense>
  );
}
