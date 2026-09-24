import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { Navbar } from '../components/layout/Navbar';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { CollectionsShowcase } from '../components/home/CollectionsShowcase';
import { BrandStory } from '../components/home/BrandStory';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

describe('Milestone 1: Aura Apparel Responsive Shell Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. App Root Integration                                                    */
  /* -------------------------------------------------------------------------- */
  describe('App Shell Integration', () => {
    it('renders the complete M1 shell without crashing', () => {
      render(<App />);
      expect(screen.getByTestId('brand-wordmark')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /the form of stillness/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/curated collections showcase/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/brand story and craftsmanship manifesto/i)).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('coordinates category selection between collections showcase and active display', () => {
      render(<App />);
      const outerwearCard = screen.getByTestId('collection-card-outerwear');
      fireEvent.click(outerwearCard);
      expect(screen.getByText(/active category filter:/i)).toHaveTextContent(/outerwear/i);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Navbar Component                                                        */
  /* -------------------------------------------------------------------------- */
  describe('Navbar Component', () => {
    it('renders the Bodoni Moda brand wordmark and scrolls to top on click', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo');
      render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);

      const wordmark = screen.getByTestId('brand-wordmark');
      expect(wordmark).toHaveTextContent('AURA APPAREL');
      expect(wordmark.className).toContain('font-serif');

      fireEvent.click(wordmark);
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('renders all 5 main navigation links on desktop', () => {
      render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      expect(screen.getByTestId('nav-link-collections')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-outerwear')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-essentials')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-summer-drop')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-brand-story')).toBeInTheDocument();
    });

    it('triggers category selection when desktop nav link is clicked', () => {
      const selectCategoryMock = vi.fn();
      render(
        <Navbar
          cartCount={0}
          onOpenCart={vi.fn()}
          onSelectCategory={selectCategoryMock}
        />
      );

      fireEvent.click(screen.getByTestId('nav-link-outerwear'));
      expect(selectCategoryMock).toHaveBeenCalledWith('outerwear');
    });

    it('manages cart badge and Pale Gold status dot conditionally based on count', () => {
      const { rerender } = render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-gold-dot')).not.toBeInTheDocument();

      rerender(<Navbar cartCount={3} onOpenCart={vi.fn()} />);
      const badge = screen.getByTestId('cart-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('3');
      expect(screen.getByTestId('cart-gold-dot')).toBeInTheDocument();
    });

    it('toggles scroll styling upon window scroll event', () => {
      const { container } = render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      const header = container.querySelector('header');
      expect(header?.className).toContain('py-5');

      // Simulate scrolling past 20px
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-3.5');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. MobileDrawer Component                                                  */
  /* -------------------------------------------------------------------------- */
  describe('MobileDrawer Component', () => {
    it('toggles visibility based on isOpen prop', () => {
      const { rerender } = render(
        <MobileDrawer isOpen={false} onClose={vi.fn()} />
      );
      const container = screen.getByTestId('mobile-drawer-container');
      expect(container.className).toContain('invisible');

      rerender(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
      expect(container.className).toContain('visible');
    });

    it('calls onClose when close button or backdrop is clicked', () => {
      const onCloseMock = vi.fn();
      render(<MobileDrawer isOpen={true} onClose={onCloseMock} />);

      fireEvent.click(screen.getByTestId('mobile-drawer-close'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('mobile-drawer-backdrop'));
      expect(onCloseMock).toHaveBeenCalledTimes(2);
    });

    it('dismisses drawer upon Escape key press', () => {
      const onCloseMock = vi.fn();
      render(<MobileDrawer isOpen={true} onClose={onCloseMock} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('selects category and closes drawer upon link click', () => {
      const selectCategoryMock = vi.fn();
      const onCloseMock = vi.fn();
      render(
        <MobileDrawer
          isOpen={true}
          onClose={onCloseMock}
          onSelectCategory={selectCategoryMock}
        />
      );

      fireEvent.click(screen.getByTestId('mobile-link-outerwear'));
      expect(selectCategoryMock).toHaveBeenCalledWith('outerwear');
      expect(onCloseMock).toHaveBeenCalled();
    });

    it('handles mobile currency switching', () => {
      const onCurrencyChangeMock = vi.fn();
      render(
        <MobileDrawer
          isOpen={true}
          onClose={vi.fn()}
          currentCurrency="USD"
          onCurrencyChange={onCurrencyChangeMock}
        />
      );

      fireEvent.click(screen.getByTestId('mobile-currency-EUR'));
      expect(onCurrencyChangeMock).toHaveBeenCalledWith('EUR');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. Footer Component                                                        */
  /* -------------------------------------------------------------------------- */
  describe('Footer Component', () => {
    it('renders the Atelier Dispatch newsletter with 0px input geometry', () => {
      render(<Footer />);
      expect(screen.getByRole('heading', { name: /join the atelier/i })).toBeInTheDocument();
      const input = screen.getByTestId('newsletter-input');
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('rounded-none');
    });

    it('validates empty email and displays error alert', () => {
      render(<Footer />);
      const submitBtn = screen.getByTestId('newsletter-submit');
      fireEvent.click(submitBtn);

      const errorAlert = screen.getByTestId('newsletter-error');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/please enter an email address/i);
    });

    it('validates malformed email strings via strict regex', () => {
      render(<Footer />);
      const input = screen.getByTestId('newsletter-input');
      const submitBtn = screen.getByTestId('newsletter-submit');

      fireEvent.change(input, { target: { value: 'invalid-email-string' } });
      fireEvent.click(submitBtn);

      const errorAlert = screen.getByTestId('newsletter-error');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/please enter a valid email address/i);
    });

    it('accepts valid email and transitions to luxury confirmation status', async () => {
      render(<Footer />);
      const input = screen.getByTestId('newsletter-input');
      const submitBtn = screen.getByTestId('newsletter-submit');

      fireEvent.change(input, { target: { value: 'patron@aura-apparel.com' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('newsletter-success')).toBeInTheDocument();
      });
      expect(screen.getByText(/welcome to the atelier/i)).toBeInTheDocument();
      expect(screen.getByText(/patron@aura-apparel.com/i)).toBeInTheDocument();
    });

    it('interactively exposes and switches currency options', () => {
      const onCurrencyChangeMock = vi.fn();
      render(
        <Footer
          currentCurrency="USD"
          onCurrencyChange={onCurrencyChangeMock}
        />
      );

      const trigger = screen.getByTestId('currency-selector');
      expect(trigger).toHaveTextContent('USD');

      // Open currency dropdown
      fireEvent.click(trigger);
      expect(screen.getByTestId('currency-dropdown')).toBeInTheDocument();

      // Click EUR option
      fireEvent.click(screen.getByTestId('currency-option-EUR'));
      expect(onCurrencyChangeMock).toHaveBeenCalledWith('EUR');
    });

    it('provides functional directory navigation links', () => {
      const selectCategoryMock = vi.fn();
      render(<Footer onSelectCategory={selectCategoryMock} />);

      fireEvent.click(screen.getByTestId('footer-link-outerwear'));
      expect(selectCategoryMock).toHaveBeenCalledWith('outerwear');

      fireEvent.click(screen.getByTestId('footer-link-essentials'));
      expect(selectCategoryMock).toHaveBeenCalledWith('essentials');

      fireEvent.click(screen.getByTestId('footer-link-summer-drop'));
      expect(selectCategoryMock).toHaveBeenCalledWith('summer-drop');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. Hero Component                                                          */
  /* -------------------------------------------------------------------------- */
  describe('Hero Component', () => {
    it('renders the 72px Bodoni Moda headline "THE FORM OF STILLNESS"', () => {
      render(<Hero />);
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toHaveTextContent(/the form of stillness/i);
      expect(headline.className).toContain('font-serif');
    });

    it('renders editorial narrative subcopy and season eyebrow', () => {
      render(<Hero />);
      expect(screen.getByText(/edition 01 \/ autumn-winter 2026/i)).toBeInTheDocument();
      expect(
        screen.getByText(/an architectural study in pure form, unhurried tailoring/i)
      ).toBeInTheDocument();
    });

    it('triggers onExploreClick callback when CTA button is clicked', () => {
      const onExploreClickMock = vi.fn();
      render(<Hero onExploreClick={onExploreClickMock} />);

      const cta = screen.getByRole('button', { name: /explore collection/i });
      expect(cta.className).toContain('rounded-none');
      fireEvent.click(cta);
      expect(onExploreClickMock).toHaveBeenCalledTimes(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. CollectionsShowcase Component                                          */
  /* -------------------------------------------------------------------------- */
  describe('CollectionsShowcase Component', () => {
    it('renders exactly 3 curated collection movements', () => {
      render(<CollectionsShowcase />);
      expect(screen.getByTestId('collection-card-outerwear')).toBeInTheDocument();
      expect(screen.getByTestId('collection-card-essentials')).toBeInTheDocument();
      expect(screen.getByTestId('collection-card-summer-drop')).toBeInTheDocument();
    });

    it('verifies 1.03x hover zoom class on imagery', () => {
      render(<CollectionsShowcase />);
      const card = screen.getByTestId('collection-card-outerwear');
      const img = card.querySelector('img');
      expect(img?.className).toContain('group-hover:scale-[1.03]');
    });

    it('triggers onSelectCategory on card click and keyboard press', () => {
      const selectCategoryMock = vi.fn();
      render(<CollectionsShowcase onSelectCategory={selectCategoryMock} />);

      const summerCard = screen.getByTestId('collection-card-summer-drop');
      fireEvent.click(summerCard);
      expect(selectCategoryMock).toHaveBeenCalledWith('summer-drop');

      const essentialsCard = screen.getByTestId('collection-card-essentials');
      fireEvent.keyDown(essentialsCard, { key: 'Enter' });
      expect(selectCategoryMock).toHaveBeenCalledWith('essentials');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 7. BrandStory Component                                                   */
  /* -------------------------------------------------------------------------- */
  describe('BrandStory Component', () => {
    it('renders the manifesto quote in Bodoni Moda styling', () => {
      render(<BrandStory />);
      const quote = screen.getByRole('heading', { level: 2 });
      expect(quote).toHaveTextContent(/we believe true luxury is the quiet confidence of subtraction/i);
      expect(quote.className).toContain('font-serif');
    });

    it('renders all three craftsmanship pillars with metrics and specs', () => {
      render(<BrandStory />);
      expect(screen.getByText('Architectural Precision')).toBeInTheDocument();
      expect(screen.getByText('0.5mm Tolerance')).toBeInTheDocument();

      expect(screen.getByText('Rare Textiles')).toBeInTheDocument();
      expect(screen.getByText('720 GSM Density')).toBeInTheDocument();

      expect(screen.getByText('Atelier Ethos')).toBeInTheDocument();
      expect(screen.getByText('150 Pieces Max')).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 8. ImageWithFallback Component                                            */
  /* -------------------------------------------------------------------------- */
  describe('ImageWithFallback Component', () => {
    it('renders the initial image with zero-opacity until loaded', () => {
      render(
        <ImageWithFallback
          src="https://example.com/coat.jpg"
          alt="Luxury Wool Coat"
        />
      );
      const img = screen.getByAltText('Luxury Wool Coat');
      expect(img).toBeInTheDocument();
      expect(img.className).toContain('opacity-0');

      fireEvent.load(img);
      expect(img.className).toContain('opacity-100');
    });

    it('gracefully falls back to inline SVG data URI when image fails to load', () => {
      render(
        <ImageWithFallback
          src="https://example.com/broken-url.jpg"
          alt="Broken Item"
          fallbackText="AURA ATELIER"
          fallbackSubtext="ARCHIVAL 01"
        />
      );

      const img = screen.getByAltText('Broken Item');
      fireEvent.error(img);

      const fallbackSvg = screen.getByTestId('fallback-image-svg');
      expect(fallbackSvg).toBeInTheDocument();
      expect(fallbackSvg.getAttribute('src')).toContain('data:image/svg+xml');
    });
  });
});
