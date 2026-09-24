'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { NavCategory } from './Navbar';

export interface FooterProps {
  onSelectCategory?: (category: NavCategory) => void;
  currentCurrency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
  onCurrencyChange?: (currency: 'USD' | 'EUR' | 'GBP' | 'JPY') => void;
}

export interface CurrencyConfig {
  code: 'USD' | 'EUR' | 'GBP' | 'JPY';
  symbol: string;
  label: string;
}

const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  currentCurrency = 'USD',
  onCurrencyChange,
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'submitting' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Close currency menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus('invalid');
      setErrorMessage('Please enter an email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus('invalid');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 300);
  };

  const handleCategoryClick = (category: NavCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStoryClick = () => {
    const el = document.getElementById('story');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedCurrencyConfig =
    CURRENCIES.find((c) => c.code === currentCurrency) || CURRENCIES[0];

  return (
    <footer
      role="contentinfo"
      className="bg-[#0D0D0D] text-[#FBF9F9] border-t border-[#262626] pt-20 pb-12 px-6 md:px-12 lg:px-16 select-none"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Tier: Newsletter Subscription */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-16 border-b border-[#262626]">
          <div className="max-w-xl">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D4AF37] block mb-3 font-semibold">
              The Aura Dispatch
            </span>
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-[#FBF9F9] font-normal">
              JOIN THE ATELIER
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-3 font-sans leading-relaxed">
              Enter your email to receive private salon invitations, seasonal lookbook debuts, and archival allocations.
            </p>
          </div>

          <div className="w-full max-w-md">
            {status === 'success' ? (
              <div
                role="status"
                data-testid="newsletter-success"
                className="border border-[#D4AF37]/50 bg-[#D4AF37]/5 p-4 rounded-none"
              >
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Check className="w-4 h-4 stroke-[2]" />
                  <span className="font-serif text-sm tracking-[0.15em] font-medium">
                    WELCOME TO THE ATELIER
                  </span>
                </div>
                <p className="text-xs text-[#A3A3A3] font-sans mt-1">
                  Confirmation dispatched to <span className="text-white">{email}</span>. Check your inbox for private access.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="w-full">
                <div className="flex flex-col sm:flex-row gap-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'invalid') setStatus('idle');
                    }}
                    placeholder="Enter your email address..."
                    aria-label="Email address for newsletter"
                    data-testid="newsletter-input"
                    className={`flex-1 bg-transparent border ${
                      status === 'invalid' ? 'border-[#EF4444]' : 'border-[#333333]'
                    } focus:border-[#D4AF37] focus:outline-none text-[#FBF9F9] text-xs tracking-wider px-4 py-3 placeholder:text-[#525252] rounded-none transition-colors`}
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    aria-label="Subscribe to newsletter"
                    data-testid="newsletter-submit"
                    className="bg-[#D4AF37] text-[#0D0D0D] hover:bg-[#C4A030] active:bg-[#B39025] font-sans text-xs uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors rounded-none whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{status === 'submitting' ? 'DISPATCHING...' : 'SUBSCRIBE'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {status === 'invalid' && (
                  <p
                    role="alert"
                    data-testid="newsletter-error"
                    className="text-[#EF4444] text-[11px] uppercase tracking-wider mt-2 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Middle Tier: 4-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 lg:gap-12 py-16 border-b border-[#262626]">
          {/* Column 1: Maison & Atelier */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              MAISON
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li>
                <button
                  type="button"
                  onClick={handleStoryClick}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                >
                  Our Philosophy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleStoryClick}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                >
                  Atelier Craftsmanship
                </button>
              </li>
              <li className="hover:text-[#FBF9F9] transition-colors">Milan Flagship: Via Montenapoleone 8</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Tokyo Studio: Minato-ku, Aoyama</li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              COLLECTIONS
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('outerwear')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-outerwear"
                >
                  Outerwear & Tailoring
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('essentials')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-essentials"
                >
                  Architectural Essentials
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('summer-drop')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-summer-drop"
                >
                  Summer Drop 2026
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick('all')}
                  className="hover:text-[#FBF9F9] transition-colors cursor-pointer text-left"
                  data-testid="footer-link-all"
                >
                  Permanent Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Concierge */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              CONCIERGE
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li className="hover:text-[#FBF9F9] transition-colors">White-Glove Delivery</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Complimentary Returns (30 Days)</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Bespoke Alterations</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Private Salon Appointments</li>
            </ul>
          </div>

          {/* Column 4: Legal & Ethics */}
          <div>
            <h3 className="font-serif text-xs uppercase tracking-[0.25em] text-[#D4AF37] mb-5 font-medium">
              LEGAL & ETHICS
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A3A3A3]">
              <li className="hover:text-[#FBF9F9] transition-colors">Sustainability & Rare Textiles</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Carbon Neutrality Commitment</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Privacy Policy</li>
              <li className="hover:text-[#FBF9F9] transition-colors">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Currency Selector & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 gap-6 text-xs text-[#707070]">
          <div>
            <p className="font-serif text-xs tracking-[0.1em] text-[#A3A3A3]">
              © 2026 AURA APPAREL ATELIER. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#525252] mt-0.5">
              MILAN • TOKYO • NEW YORK • ARCHITECTURAL MINIMALISM
            </p>
          </div>

          {/* Currency Dropdown Selector */}
          <div className="relative" ref={currencyRef}>
            <label htmlFor="footer-currency-select-el" className="sr-only">
              Select Currency
            </label>
            <select
              id="footer-currency-select-el"
              data-testid="footer-currency-select"
              value={currentCurrency}
              onChange={(e) => onCurrencyChange?.(e.target.value as any)}
              className="sr-only"
              aria-label="Select Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              aria-haspopup="listbox"
              aria-expanded={isCurrencyOpen}
              aria-label="Select currency"
              data-testid="currency-selector"
              className="flex items-center gap-2.5 bg-[#1A1A1A] border border-[#333333] hover:border-[#D4AF37] text-[#FBF9F9] text-xs font-sans px-3.5 py-2 rounded-none transition-colors cursor-pointer"
            >
              <span className="font-mono text-[#D4AF37]">
                {selectedCurrencyConfig.symbol}
              </span>
              <span>{selectedCurrencyConfig.code}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#707070] transition-transform duration-200 ${
                  isCurrencyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCurrencyOpen && (
              <ul
                role="listbox"
                data-testid="currency-dropdown"
                className="absolute bottom-full right-0 mb-1.5 w-36 bg-[#141414] border border-[#333333] py-1 z-30 shadow-none rounded-none"
              >
                {CURRENCIES.map((curr) => {
                  const isSelected = curr.code === currentCurrency;
                  return (
                    <li
                      key={curr.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onCurrencyChange?.(curr.code);
                        setIsCurrencyOpen(false);
                      }}
                      data-testid={`currency-option-${curr.code}`}
                      className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#222222] text-[#D4AF37] font-medium'
                          : 'text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FBF9F9]'
                      }`}
                    >
                      <span>{curr.code}</span>
                      <span className="font-mono text-[11px] text-[#707070]">
                        {curr.symbol}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
