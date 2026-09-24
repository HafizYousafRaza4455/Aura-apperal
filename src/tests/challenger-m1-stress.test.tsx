import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { Navbar } from '../components/layout/Navbar';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { CollectionsShowcase } from '../components/home/CollectionsShowcase';
import { BrandStory } from '../components/home/BrandStory';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

describe('Challenger M1.2: Empirical Stress & Layout Verification Suite', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  /* ========================================================================== */
  /* AREA 1: Currency Switching & State Propagation                            */
  /* ========================================================================== */
  describe('Area 1: Currency Switching & Cross-Component State Propagation', () => {
    it('Footer currency dropdown renders all 4 currencies (USD, EUR, GBP, JPY)', () => {
      render(<Footer currentCurrency="USD" onCurrencyChange={vi.fn()} />);

      const trigger = screen.getByTestId('currency-selector');
      expect(trigger).toHaveTextContent('USD');
      expect(trigger).toHaveTextContent('$');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // Open dropdown
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      const dropdown = screen.getByTestId('currency-dropdown');
      expect(dropdown).toBeInTheDocument();

      const usdOption = screen.getByTestId('currency-option-USD');
      const eurOption = screen.getByTestId('currency-option-EUR');
      const gbpOption = screen.getByTestId('currency-option-GBP');
      const jpyOption = screen.getByTestId('currency-option-JPY');

      expect(usdOption).toHaveTextContent('USD');
      expect(usdOption).toHaveTextContent('$');
      expect(usdOption).toHaveAttribute('aria-selected', 'true');

      expect(eurOption).toHaveTextContent('EUR');
      expect(eurOption).toHaveTextContent('€');
      expect(eurOption).toHaveAttribute('aria-selected', 'false');

      expect(gbpOption).toHaveTextContent('GBP');
      expect(gbpOption).toHaveTextContent('£');
      expect(gbpOption).toHaveAttribute('aria-selected', 'false');

      expect(jpyOption).toHaveTextContent('JPY');
      expect(jpyOption).toHaveTextContent('¥');
      expect(jpyOption).toHaveAttribute('aria-selected', 'false');
    });

    it('Footer currency selector dispatches exact currency code and closes dropdown', () => {
      const onCurrencyChange = vi.fn();
      render(<Footer currentCurrency="USD" onCurrencyChange={onCurrencyChange} />);

      const trigger = screen.getByTestId('currency-selector');
      fireEvent.click(trigger);

      // Select GBP
      fireEvent.click(screen.getByTestId('currency-option-GBP'));
      expect(onCurrencyChange).toHaveBeenCalledTimes(1);
      expect(onCurrencyChange).toHaveBeenCalledWith('GBP');

      // Dropdown should be dismissed
      expect(screen.queryByTestId('currency-dropdown')).not.toBeInTheDocument();
    });

    it('Footer currency selector closes when clicking outside', () => {
      render(
        <div>
          <div data-testid="outside-element">Outside</div>
          <Footer currentCurrency="USD" onCurrencyChange={vi.fn()} />
        </div>
      );

      const trigger = screen.getByTestId('currency-selector');
      fireEvent.click(trigger);
      expect(screen.getByTestId('currency-dropdown')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside-element'));
      expect(screen.queryByTestId('currency-dropdown')).not.toBeInTheDocument();
    });

    it('MobileDrawer renders all 4 currency buttons and highlights active currency', () => {
      const onCurrencyChange = vi.fn();
      const { rerender } = render(
        <MobileDrawer
          isOpen={true}
          onClose={vi.fn()}
          currentCurrency="USD"
          onCurrencyChange={onCurrencyChange}
        />
      );

      const usdBtn = screen.getByTestId('mobile-currency-USD');
      const eurBtn = screen.getByTestId('mobile-currency-EUR');
      const gbpBtn = screen.getByTestId('mobile-currency-GBP');
      const jpyBtn = screen.getByTestId('mobile-currency-JPY');

      expect(usdBtn.className).toContain('text-[#D4AF37]');
      expect(eurBtn.className).not.toContain('text-[#D4AF37]');

      fireEvent.click(eurBtn);
      expect(onCurrencyChange).toHaveBeenCalledWith('EUR');

      fireEvent.click(gbpBtn);
      expect(onCurrencyChange).toHaveBeenCalledWith('GBP');

      fireEvent.click(jpyBtn);
      expect(onCurrencyChange).toHaveBeenCalledWith('JPY');

      // Rerender with JPY active
      rerender(
        <MobileDrawer
          isOpen={true}
          onClose={vi.fn()}
          currentCurrency="JPY"
          onCurrencyChange={onCurrencyChange}
        />
      );
      expect(screen.getByTestId('mobile-currency-JPY').className).toContain('text-[#D4AF37]');
      expect(screen.getByTestId('mobile-currency-USD').className).not.toContain('text-[#D4AF37]');
    });

    it('App root coordinates bidirectional currency state propagation between Footer and MobileDrawer', () => {
      render(<App />);

      // Initial state: USD
      const footerTrigger = screen.getByTestId('currency-selector');
      expect(footerTrigger).toHaveTextContent('USD');
      expect(footerTrigger).toHaveTextContent('$');

      // 1. Switch currency to EUR from Footer
      fireEvent.click(footerTrigger);
      fireEvent.click(screen.getByTestId('currency-option-EUR'));

      // Verify Footer updated
      expect(footerTrigger).toHaveTextContent('EUR');
      expect(footerTrigger).toHaveTextContent('€');

      // Open MobileDrawer and verify EUR is highlighted
      fireEvent.click(screen.getByTestId('mobile-menu-trigger'));
      const mobileEurBtn = screen.getByTestId('mobile-currency-EUR');
      expect(mobileEurBtn.className).toContain('text-[#D4AF37]');

      // 2. Switch currency to JPY from MobileDrawer
      const mobileJpyBtn = screen.getByTestId('mobile-currency-JPY');
      fireEvent.click(mobileJpyBtn);

      // Verify MobileDrawer updated
      expect(screen.getByTestId('mobile-currency-JPY').className).toContain('text-[#D4AF37]');

      // Close MobileDrawer and verify Footer reflects JPY
      fireEvent.click(screen.getByTestId('mobile-drawer-close'));
      expect(footerTrigger).toHaveTextContent('JPY');
      expect(footerTrigger).toHaveTextContent('¥');

      // 3. Switch currency to GBP from Footer
      fireEvent.click(footerTrigger);
      fireEvent.click(screen.getByTestId('currency-option-GBP'));
      expect(footerTrigger).toHaveTextContent('GBP');
      expect(footerTrigger).toHaveTextContent('£');

      // 4. Switch back to USD
      fireEvent.click(footerTrigger);
      fireEvent.click(screen.getByTestId('currency-option-USD'));
      expect(footerTrigger).toHaveTextContent('USD');
      expect(footerTrigger).toHaveTextContent('$');
    });
  });

  /* ========================================================================== */
  /* AREA 2: Collections Showcase Card Interactions & Callbacks                 */
  /* ========================================================================== */
  describe('Area 2: Collections Showcase Card Interactions & Callbacks', () => {
    it('renders all 3 movement cards with 1.03x scale zoom class and accessibility markup', () => {
      render(<CollectionsShowcase />);

      const outerwearCard = screen.getByTestId('collection-card-outerwear');
      const essentialsCard = screen.getByTestId('collection-card-essentials');
      const summerCard = screen.getByTestId('collection-card-summer-drop');

      expect(outerwearCard).toHaveAttribute('role', 'button');
      expect(outerwearCard).toHaveAttribute('tabIndex', '0');
      expect(outerwearCard).toHaveAttribute('aria-label', expect.stringContaining('Outerwear'));

      expect(essentialsCard).toHaveAttribute('role', 'button');
      expect(essentialsCard).toHaveAttribute('tabIndex', '0');
      expect(essentialsCard).toHaveAttribute('aria-label', expect.stringContaining('Essentials'));

      expect(summerCard).toHaveAttribute('role', 'button');
      expect(summerCard).toHaveAttribute('tabIndex', '0');
      expect(summerCard).toHaveAttribute('aria-label', expect.stringContaining('Summer Drop'));

      // Check scale class on imagery
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img.className).toContain('group-hover:scale-[1.03]');
      });
    });

    it('fires onSelectCategory callback for click events and bubbling from nested children', () => {
      const onSelectCategory = vi.fn();
      render(<CollectionsShowcase onSelectCategory={onSelectCategory} />);

      // Click outer card
      fireEvent.click(screen.getByTestId('collection-card-outerwear'));
      expect(onSelectCategory).toHaveBeenLastCalledWith('outerwear');

      // Click nested heading
      const essentialsHeading = screen.getByRole('heading', { name: /essentials/i });
      fireEvent.click(essentialsHeading);
      expect(onSelectCategory).toHaveBeenLastCalledWith('essentials');

      // Click nested paragraph description
      const summerCard = screen.getByTestId('collection-card-summer-drop');
      const summerSubtext = summerCard.querySelector('p');
      if (summerSubtext) {
        fireEvent.click(summerSubtext);
        expect(onSelectCategory).toHaveBeenLastCalledWith('summer-drop');
      }
      expect(onSelectCategory).toHaveBeenCalledTimes(3);
    });

    it('supports keyboard navigation: Enter and Space trigger selection, others do not', () => {
      const onSelectCategory = vi.fn();
      render(<CollectionsShowcase onSelectCategory={onSelectCategory} />);

      const card = screen.getByTestId('collection-card-outerwear');

      // Enter key
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onSelectCategory).toHaveBeenCalledTimes(1);
      expect(onSelectCategory).toHaveBeenLastCalledWith('outerwear');

      // Space key
      fireEvent.keyDown(card, { key: ' ' });
      expect(onSelectCategory).toHaveBeenCalledTimes(2);
      expect(onSelectCategory).toHaveBeenLastCalledWith('outerwear');

      // Irrelevant keys must not trigger callback
      fireEvent.keyDown(card, { key: 'Tab' });
      fireEvent.keyDown(card, { key: 'Escape' });
      fireEvent.keyDown(card, { key: 'ArrowDown' });
      fireEvent.keyDown(card, { key: 'Shift' });
      expect(onSelectCategory).toHaveBeenCalledTimes(2);
    });

    it('handles smooth scroll to #catalog element if present, and degrades cleanly if absent', () => {
      const onSelectCategory = vi.fn();

      // Case A: #catalog exists in DOM
      const targetDiv = document.createElement('div');
      targetDiv.id = 'catalog';
      const scrollIntoViewSpy = vi.fn();
      targetDiv.scrollIntoView = scrollIntoViewSpy;
      document.body.appendChild(targetDiv);

      const { unmount } = render(<CollectionsShowcase onSelectCategory={onSelectCategory} />);
      fireEvent.click(screen.getByTestId('collection-card-outerwear'));
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' });

      unmount();
      document.body.removeChild(targetDiv);

      // Case B: #catalog does NOT exist in DOM
      render(<CollectionsShowcase onSelectCategory={onSelectCategory} />);
      expect(() => {
        fireEvent.click(screen.getByTestId('collection-card-essentials'));
      }).not.toThrow();
      expect(onSelectCategory).toHaveBeenCalledWith('essentials');
    });

    it('App component updates active category display upon clicking collection cards', () => {
      render(<App />);

      const activeCategoryBanner = screen.getByText(/active category filter:/i);
      expect(activeCategoryBanner).toHaveTextContent(/all/i);

      // Click Outerwear card
      fireEvent.click(screen.getByTestId('collection-card-outerwear'));
      expect(screen.getByText(/active category filter:/i)).toHaveTextContent(/outerwear/i);

      // Click Summer Drop card
      fireEvent.click(screen.getByTestId('collection-card-summer-drop'));
      expect(screen.getByText(/active category filter:/i)).toHaveTextContent(/summer-drop/i);

      // Click Essentials card
      fireEvent.click(screen.getByTestId('collection-card-essentials'));
      expect(screen.getByText(/active category filter:/i)).toHaveTextContent(/essentials/i);
    });
  });

  /* ========================================================================== */
  /* AREA 3: Fallback Image Behavior & Error Resilience                         */
  /* ========================================================================== */
  describe('Area 3: Fallback Image Behavior & Error Resilience', () => {
    it('displays loading placeholder until image loads, then transitions to opacity-100', () => {
      const { container } = render(
        <ImageWithFallback
          src="https://images.unsplash.com/photo-test"
          alt="Test Garment"
        />
      );

      // Initial state: pulse skeleton visible, img opacity-0
      const img = screen.getByAltText('Test Garment');
      expect(img).toHaveClass('opacity-0');
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

      // Trigger load
      fireEvent.load(img);
      expect(img).toHaveClass('opacity-100');
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });

    it('switches to inline SVG fallback when image encounters an error', () => {
      render(
        <ImageWithFallback
          src="https://invalid-broken-domain.test/404.jpg"
          alt="Silk Trench"
          fallbackText="SILK TRENCH"
          fallbackSubtext="LIMITED 2026"
        />
      );

      const initialImg = screen.getByAltText('Silk Trench');
      fireEvent.error(initialImg);

      // Image replaced by fallback SVG
      const fallbackImg = screen.getByTestId('fallback-image-svg');
      expect(fallbackImg).toBeInTheDocument();
      expect(fallbackImg).toHaveAttribute('alt', 'Silk Trench (Offline Placeholder)');

      const srcAttr = fallbackImg.getAttribute('src') || '';
      expect(srcAttr.startsWith('data:image/svg+xml;utf8,')).toBe(true);

      // Decode SVG and verify text contents
      const decodedSvg = decodeURIComponent(srcAttr.replace('data:image/svg+xml;utf8,', ''));
      expect(decodedSvg).toContain('SILK TRENCH');
      expect(decodedSvg).toContain('LIMITED 2026');
      expect(decodedSvg).toContain('AURA');
      expect(decodedSvg).toContain('#D4AF37'); // Pale Gold accent
    });

    it('properly encodes special characters and XML entities in fallback text', () => {
      render(
        <ImageWithFallback
          src="https://broken-url.test/special.jpg"
          alt="Complex Item"
          fallbackText="Tailoring & Form <01>"
          fallbackSubtext='Edition "Exclusive" / 100%'
        />
      );

      const img = screen.getByAltText('Complex Item');
      fireEvent.error(img);

      const fallbackImg = screen.getByTestId('fallback-image-svg');
      const srcAttr = fallbackImg.getAttribute('src') || '';
      expect(() => decodeURIComponent(srcAttr)).not.toThrow();

      const decoded = decodeURIComponent(srcAttr);
      expect(decoded).toContain('TAILORING & FORM <01>');
      expect(decoded).toContain('EDITION "EXCLUSIVE" / 100%');
    });

    it('resets error state and recovers when src prop changes to a new valid URL', () => {
      const { rerender, container } = render(
        <ImageWithFallback
          src="https://broken-first-url.test/fail.jpg"
          alt="Dynamic Garment"
        />
      );

      const img1 = screen.getByAltText('Dynamic Garment');
      fireEvent.error(img1);

      // Confirm in fallback state
      expect(screen.getByTestId('fallback-image-svg')).toBeInTheDocument();

      // Parent updates src prop to a new valid url
      rerender(
        <ImageWithFallback
          src="https://valid-second-url.test/photo.jpg"
          alt="Dynamic Garment"
        />
      );

      // Fallback SVG should be gone, normal image back with opacity-0
      expect(screen.queryByTestId('fallback-image-svg')).not.toBeInTheDocument();
      const img2 = screen.getByAltText('Dynamic Garment');
      expect(img2).toHaveClass('opacity-0');
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

      // Complete load on new image
      fireEvent.load(img2);
      expect(img2).toHaveClass('opacity-100');
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });

    it('CollectionsShowcase cards remain functional when all images trigger error fallbacks', () => {
      const onSelectCategory = vi.fn();
      render(<CollectionsShowcase onSelectCategory={onSelectCategory} />);

      // Trigger error on all 3 images
      const images = screen.getAllByRole('img');
      images.forEach((img) => fireEvent.error(img));

      // 3 fallback SVGs rendered
      const fallbackSvgs = screen.getAllByTestId('fallback-image-svg');
      expect(fallbackSvgs).toHaveLength(3);

      // Clicking cards still triggers category selection
      fireEvent.click(screen.getByTestId('collection-card-outerwear'));
      expect(onSelectCategory).toHaveBeenCalledWith('outerwear');

      fireEvent.click(screen.getByTestId('collection-card-essentials'));
      expect(onSelectCategory).toHaveBeenCalledWith('essentials');

      fireEvent.click(screen.getByTestId('collection-card-summer-drop'));
      expect(onSelectCategory).toHaveBeenCalledWith('summer-drop');
    });
  });

  /* ========================================================================== */
  /* AREA 4: Zero Console Errors and Warnings Verification                       */
  /* ========================================================================== */
  describe('Area 4: Zero Console Errors & Robust Lifecycle Management', () => {
    it('renders and unmounts App without any console errors or warnings', () => {
      const { unmount } = render(<App />);
      unmount();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('renders and unmounts each individual component in isolation with zero errors', () => {
      // 1. Navbar
      const { unmount: u1 } = render(
        <Navbar
          cartCount={3}
          onOpenCart={vi.fn()}
          onSelectCategory={vi.fn()}
          onOpenMobileMenu={vi.fn()}
          isMobileMenuOpen={false}
        />
      );
      u1();

      // 2. MobileDrawer
      const { unmount: u2 } = render(
        <MobileDrawer
          isOpen={true}
          onClose={vi.fn()}
          onSelectCategory={vi.fn()}
          onOpenCart={vi.fn()}
          currentCurrency="EUR"
          onCurrencyChange={vi.fn()}
        />
      );
      u2();

      // 3. Footer
      const { unmount: u3 } = render(
        <Footer
          currentCurrency="GBP"
          onCurrencyChange={vi.fn()}
          onSelectCategory={vi.fn()}
        />
      );
      u3();

      // 4. Hero
      const { unmount: u4 } = render(<Hero onExploreClick={vi.fn()} />);
      u4();

      // 5. CollectionsShowcase
      const { unmount: u5 } = render(<CollectionsShowcase onSelectCategory={vi.fn()} />);
      u5();

      // 6. BrandStory
      const { unmount: u6 } = render(<BrandStory />);
      u6();

      // 7. ImageWithFallback
      const { unmount: u7 } = render(
        <ImageWithFallback src="test.jpg" alt="test" />
      );
      u7();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('survives rapid mount/unmount cycling of App shell without error leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<App />);
        unmount();
      }

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('cleans up global window and document event listeners upon unmount', () => {
      // Navbar scroll listener cleanup
      const { unmount: unmountNavbar } = render(
        <Navbar cartCount={0} onOpenCart={vi.fn()} />
      );
      unmountNavbar();
      // Firing scroll after unmount should not cause errors
      expect(() => {
        fireEvent.scroll(window);
      }).not.toThrow();

      // MobileDrawer ESC listener cleanup
      const onCloseMock = vi.fn();
      const { unmount: unmountDrawer } = render(
        <MobileDrawer isOpen={true} onClose={onCloseMock} />
      );
      unmountDrawer();
      expect(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      }).not.toThrow();
      expect(onCloseMock).not.toHaveBeenCalled();

      // Footer outside click listener cleanup
      const { unmount: unmountFooter } = render(
        <Footer currentCurrency="USD" onCurrencyChange={vi.fn()} />
      );
      unmountFooter();
      expect(() => {
        fireEvent.mouseDown(document.body);
      }).not.toThrow();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('handles missing optional callback props gracefully without crashing or logging errors', () => {
      // Navbar with only required props
      render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      fireEvent.click(screen.getByTestId('nav-link-outerwear'));

      // MobileDrawer without callbacks
      const { unmount: uDrawer } = render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
      fireEvent.click(screen.getByTestId('mobile-link-all-collections'));
      fireEvent.click(screen.getByTestId('mobile-currency-EUR'));
      uDrawer();

      // Footer without callbacks
      const { unmount: uFooter } = render(<Footer />);
      fireEvent.click(screen.getByTestId('footer-link-outerwear'));
      fireEvent.click(screen.getByTestId('currency-selector'));
      fireEvent.click(screen.getByTestId('currency-option-EUR'));
      uFooter();

      // CollectionsShowcase without callback
      const { unmount: uCol } = render(<CollectionsShowcase />);
      fireEvent.click(screen.getByTestId('collection-card-outerwear'));
      uCol();

      // Hero without callback
      const { unmount: uHero } = render(<Hero />);
      fireEvent.click(screen.getByRole('button', { name: /explore collection/i }));
      uHero();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('unmounting Footer during pending newsletter async dispatch does not trigger memory leak or warning', async () => {
      vi.useFakeTimers();

      const { unmount } = render(<Footer />);
      const input = screen.getByTestId('newsletter-input');
      const submitBtn = screen.getByTestId('newsletter-submit');

      fireEvent.change(input, { target: { value: 'atelier@aura.test' } });
      fireEvent.click(submitBtn);

      // Unmount before 300ms timer finishes
      unmount();

      // Fast-forward timers
      act(() => {
        vi.advanceTimersByTime(500);
      });

      vi.useRealTimers();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
