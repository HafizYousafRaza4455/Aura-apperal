import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import App from '../App';

describe('Challenger M1.1: Empirical Stress, Boundary & Adversarial Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 1: Newsletter Validation Boundary Inputs & Adversarial Injection      */
  /* -------------------------------------------------------------------------- */
  describe('Area 1: Newsletter Validation Adversarial Edge Cases', () => {
    it('rejects completely empty submission', () => {
      render(<Footer />);
      const submitBtn = screen.getByTestId('newsletter-submit');
      fireEvent.click(submitBtn);

      const errorAlert = screen.getByTestId('newsletter-error');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/please enter an email address/i);
    });

    it('rejects submissions with whitespace-only inputs (spaces, tabs, newlines)', () => {
      const whitespaceInputs = [
        ' ',
        '   ',
        '\t',
        '  \t  \n  ',
        '\u00A0 \u2003', // non-breaking space and em space
      ];

      for (const val of whitespaceInputs) {
        const { unmount } = render(<Footer />);
        const input = screen.getByTestId('newsletter-input');
        const submitBtn = screen.getByTestId('newsletter-submit');

        fireEvent.change(input, { target: { value: val } });
        fireEvent.click(submitBtn);

        const errorAlert = screen.getByTestId('newsletter-error');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/please enter an email address/i);
        unmount();
      }
    });

    it('rejects structurally malformed emails (missing @, missing domain, missing user, invalid TLD)', () => {
      const malformedEmails = [
        'plainaddress',
        'patron@',
        '@aura-apparel.com',
        'patron@.com',
        'patron@domain',
        'patron@domain.',
        'patron@domain.c', // single-character TLD fails {2,} requirement
        'patron@domain.123', // numeric TLD fails [a-zA-Z]{2,} requirement
        'patron@domain@another.com', // multiple @ symbols fail
        'patron name@domain.com', // space in local part fails
        'patron@domain name.com', // space in domain part fails
      ];

      for (const email of malformedEmails) {
        const { unmount } = render(<Footer />);
        const input = screen.getByTestId('newsletter-input');
        const submitBtn = screen.getByTestId('newsletter-submit');

        fireEvent.change(input, { target: { value: email } });
        fireEvent.click(submitBtn);

        const errorAlert = screen.getByTestId('newsletter-error');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/please enter a valid email address/i);
        unmount();
      }
    });

    it('documents regex permissiveness on internal consecutive dot sequences', () => {
      // Adversarial probe: EMAIL_REGEX /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      // permits consecutive dots in domain or local part because '.' is in [a-zA-Z0-9.-]+ and [a-zA-Z0-9._%+-]+.
      const consecutiveDotsInputs = [
        'patron@domain..com',
        'patron..name@domain.com',
      ];

      for (const email of consecutiveDotsInputs) {
        const { unmount } = render(<Footer />);
        const input = screen.getByTestId('newsletter-input');
        const submitBtn = screen.getByTestId('newsletter-submit');

        fireEvent.change(input, { target: { value: email } });
        fireEvent.click(submitBtn);

        // Regex accepts these and transitions to submitting status rather than error
        expect(screen.queryByTestId('newsletter-error')).not.toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
        unmount();
      }
    });

    it('rejects adversarial injection attempts (XSS, SQLi, command injection, path traversal)', () => {
      const maliciousPayloads = [
        '<script>alert("xss")</script>',
        '<script>alert("xss")</script>@domain.com',
        'patron"onerror="alert(1)"@domain.com',
        "patron' OR '1'='1@domain.com",
        "'; DROP TABLE subscribers; --",
        'patron@domain.com; cat /etc/passwd',
        'patron`id`@domain.com',
        'patron|whoami@domain.com',
        '../../../../etc/passwd@domain.com',
        'patron@domain.com\r\nBcc: victim@domain.com', // email header injection
      ];

      for (const payload of maliciousPayloads) {
        const { unmount } = render(<Footer />);
        const input = screen.getByTestId('newsletter-input');
        const submitBtn = screen.getByTestId('newsletter-submit');

        fireEvent.change(input, { target: { value: payload } });
        fireEvent.click(submitBtn);

        const errorAlert = screen.getByTestId('newsletter-error');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/please enter a valid email address/i);
        unmount();
      }
    });

    it('processes inputs without ReDoS vulnerabilities under extreme character counts', () => {
      render(<Footer />);
      const input = screen.getByTestId('newsletter-input');
      const submitBtn = screen.getByTestId('newsletter-submit');

      // 5,000 character hostile string targeting polynomial backtracking
      const heavyLocal = 'a'.repeat(2500);
      const heavyDomain = 'b'.repeat(2500);
      const adversarialInput = `${heavyLocal}@${heavyDomain}`;

      const t0 = performance.now();
      fireEvent.change(input, { target: { value: adversarialInput } });
      fireEvent.click(submitBtn);
      const t1 = performance.now();

      // Must complete in under 100ms
      expect(t1 - t0).toBeLessThan(100);
      expect(screen.getByTestId('newsletter-error')).toBeInTheDocument();
    });

    it('accepts legitimate complex emails with leading/trailing spaces and trims them correctly', async () => {
      const validEmails = [
        '  patron@aura-apparel.com  ',
        'user.name+newsletter@sub.domain.co.uk',
        'first_last-123%test@domain.org',
        'client@luxury.studio',
      ];

      for (const val of validEmails) {
        const { unmount } = render(<Footer />);
        const input = screen.getByTestId('newsletter-input');
        const submitBtn = screen.getByTestId('newsletter-submit');

        fireEvent.change(input, { target: { value: val } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
          expect(screen.getByTestId('newsletter-success')).toBeInTheDocument();
        });
        unmount();
      }
    });

    it('clears error alert immediately when user begins typing new characters', () => {
      render(<Footer />);
      const input = screen.getByTestId('newsletter-input');
      const submitBtn = screen.getByTestId('newsletter-submit');

      // Trigger error
      fireEvent.click(submitBtn);
      expect(screen.getByTestId('newsletter-error')).toBeInTheDocument();

      // Type in input -> error clears
      fireEvent.change(input, { target: { value: 'a' } });
      expect(screen.queryByTestId('newsletter-error')).not.toBeInTheDocument();
    });

    it('prevents multiple dispatches upon rapid consecutive submit clicks', async () => {
      render(<Footer />);
      const input = screen.getByTestId('newsletter-input');
      const submitBtn = screen.getByTestId('newsletter-submit');

      fireEvent.change(input, { target: { value: 'client@atelier.com' } });

      // Click rapidly 5 times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(submitBtn);
      }

      await waitFor(() => {
        expect(screen.getByTestId('newsletter-success')).toBeInTheDocument();
      });
      // Should not throw or generate multiple success banners
      expect(screen.getAllByTestId('newsletter-success')).toHaveLength(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 2: Window Scroll Event Listener & Navbar Scroll Transition            */
  /* -------------------------------------------------------------------------- */
  describe('Area 2: Window Scroll Event Listener Attachment & Cleanup', () => {
    it('attaches scroll event listener with { passive: true } on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);

      const scrollCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      );
      expect(scrollCall).toBeDefined();
      expect(scrollCall?.[2]).toEqual({ passive: true });
    });

    it('unregisters scroll event listener cleanly upon unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);

      unmount();

      const removeCall = removeEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'scroll'
      );
      expect(removeCall).toBeDefined();

      // Trigger scroll event after unmount; verify no error occurs
      expect(() => {
        Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
        fireEvent.scroll(window);
      }).not.toThrow();
    });

    it('boundary test: scroll threshold accurately toggles styling between 20px and 21px', () => {
      const { container } = render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();

      // At scrollY = 0 -> default tall header
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-5');
      expect(header?.className).toContain('border-transparent');

      // At scrollY = 20 (exact boundary) -> still default (scrollY > 20 is false)
      Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-5');
      expect(header?.className).toContain('border-transparent');

      // At scrollY = 21 (boundary + 1) -> compact scrolled header
      Object.defineProperty(window, 'scrollY', { value: 21, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-3.5');
      expect(header?.className).toContain('border-[#E5E5E5]');

      // Back to scrollY = 20 -> transitions back to default
      Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-5');
      expect(header?.className).toContain('border-transparent');
    });

    it('handles negative scrollY (mobile pull-to-refresh / iOS rubber-banding) without error', () => {
      const { container } = render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      const header = container.querySelector('header');

      Object.defineProperty(window, 'scrollY', { value: -50, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-5');
      expect(header?.className).toContain('border-transparent');
    });

    it('survives rapid scroll event bursts (100 events) without desynchronization', () => {
      const { container } = render(<Navbar cartCount={0} onOpenCart={vi.fn()} />);
      const header = container.querySelector('header');

      // Burst of rapid oscillating scrolls
      for (let i = 0; i < 100; i++) {
        const testScroll = i % 2 === 0 ? 100 + i : 5;
        Object.defineProperty(window, 'scrollY', { value: testScroll, writable: true });
        fireEvent.scroll(window);
      }

      // Final scroll state: scrollY = 0
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-5');

      // Final scroll state: scrollY = 500
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      fireEvent.scroll(window);
      expect(header?.className).toContain('py-3.5');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* AREA 3: MobileDrawer Toggle, Rapid Stress & Body Scroll Lock Cleanup       */
  /* -------------------------------------------------------------------------- */
  describe('Area 3: MobileDrawer Toggle & Body Scroll Lock Cleanup', () => {
    it('sets document.body.style.overflow to "hidden" when open, and restores to "" when closed', () => {
      expect(document.body.style.overflow).toBe('');

      const { rerender } = render(<MobileDrawer isOpen={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('');

      rerender(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<MobileDrawer isOpen={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('cleans up body scroll lock when component unmounts while still open', () => {
      expect(document.body.style.overflow).toBe('');

      const { unmount } = render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('hidden');

      // Component unmounts while isOpen is true
      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('survives rapid open/close toggle stress testing (50 cycles)', () => {
      const { rerender } = render(<MobileDrawer isOpen={false} onClose={vi.fn()} />);

      for (let i = 0; i < 50; i++) {
        act(() => {
          rerender(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
        });
        expect(document.body.style.overflow).toBe('hidden');

        act(() => {
          rerender(<MobileDrawer isOpen={false} onClose={vi.fn()} />);
        });
        expect(document.body.style.overflow).toBe('');
      }
    });

    it('survives rapid mount/unmount cycling while open without locking body scroll', () => {
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<MobileDrawer isOpen={true} onClose={vi.fn()} />);
        expect(document.body.style.overflow).toBe('hidden');
        unmount();
        expect(document.body.style.overflow).toBe('');
      }
    });

    it('cleans up window keydown Escape listener when unmounted', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const onCloseMock = vi.fn();
      const { unmount } = render(<MobileDrawer isOpen={true} onClose={onCloseMock} />);

      unmount();

      const keydownRemoval = removeEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'keydown'
      );
      expect(keydownRemoval).toBeDefined();

      // Pressing Escape after unmount must not call onClose
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMock).not.toHaveBeenCalled();
    });

    it('Escape key only fires onClose when isOpen is true, not when isOpen is false', () => {
      const onCloseMock = vi.fn();
      const { rerender } = render(<MobileDrawer isOpen={false} onClose={onCloseMock} />);

      // Press Escape while closed
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMock).not.toHaveBeenCalled();

      // Open drawer
      rerender(<MobileDrawer isOpen={true} onClose={onCloseMock} />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('distinguishes backdrop click (closes) from drawer interior click (does not close)', () => {
      const onCloseMock = vi.fn();
      render(<MobileDrawer isOpen={true} onClose={onCloseMock} />);

      // Backdrop click closes
      const backdrop = screen.getByTestId('mobile-drawer-backdrop');
      fireEvent.click(backdrop);
      expect(onCloseMock).toHaveBeenCalledTimes(1);

      // Drawer panel interior click does NOT close
      const drawerWordmark = screen.getByText('AURA APPAREL');
      fireEvent.click(drawerWordmark);
      expect(onCloseMock).toHaveBeenCalledTimes(1); // unchanged
    });

    it('App integration: hamburger trigger opens drawer, backdrop/X closes drawer, body scroll tracks accurately', () => {
      render(<App />);
      expect(document.body.style.overflow).toBe('');

      // Open drawer via hamburger trigger
      const menuTrigger = screen.getByTestId('mobile-menu-trigger');
      fireEvent.click(menuTrigger);
      expect(document.body.style.overflow).toBe('hidden');

      // Close drawer via close button
      const closeBtn = screen.getByTestId('mobile-drawer-close');
      fireEvent.click(closeBtn);
      expect(document.body.style.overflow).toBe('');

      // Open again and close via backdrop
      fireEvent.click(menuTrigger);
      expect(document.body.style.overflow).toBe('hidden');

      const backdrop = screen.getByTestId('mobile-drawer-backdrop');
      fireEvent.click(backdrop);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
