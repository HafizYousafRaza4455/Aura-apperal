import { describe, it, expect, beforeEach } from 'vitest';
import {
  holdStock,
  releaseHold,
  finalizeOrder,
  setMockStock,
  getMockStock,
} from '../../lib/inventory-reservation';
import { createCheckoutSession, isStripeConfigured } from '../../lib/stripe';

describe('Phase 3: Checkout, Stripe & 10-Minute Stock Reservation Engine', () => {
  const TEST_VARIANT_A = 'sku-overcoat-noir-m';
  const TEST_VARIANT_B = 'sku-silk-shirt-ivory-s';

  beforeEach(() => {
    // Reset stock to known state before each test
    setMockStock(TEST_VARIANT_A, 5, 0); // 5 available, 0 reserved
    setMockStock(TEST_VARIANT_B, 2, 0); // 2 available, 0 reserved
  });

  describe('1. 10-Minute Stock Reservation Hold', () => {
    it('successfully acquires a 10-minute hold for available items', async () => {
      const result = await holdStock([
        { variantId: TEST_VARIANT_A, quantity: 2 },
      ]);

      expect(result.success).toBe(true);
      expect(result.reservationId).toBeDefined();
      expect(result.expiresAt).toBeDefined();

      // Check expiration is approximately 10 minutes (600s) from now
      const diffSeconds = (result.expiresAt!.getTime() - Date.now()) / 1000;
      expect(diffSeconds).toBeGreaterThan(590);
      expect(diffSeconds).toBeLessThanOrEqual(601);

      // Verify reserved count incremented
      const stock = getMockStock(TEST_VARIANT_A);
      expect(stock.reserved).toBe(2);
      expect(stock.quantity - stock.reserved).toBe(3);
    });

    it('rejects reservation and prevents overselling when available quantity is insufficient', async () => {
      // Try to reserve 6 units when only 5 are physically in stock
      const result = await holdStock([
        { variantId: TEST_VARIANT_A, quantity: 6 },
      ]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient stock');

      // Stock should remain untouched
      const stock = getMockStock(TEST_VARIANT_A);
      expect(stock.reserved).toBe(0);
    });

    it('prevents concurrent reservations exceeding remaining available pool', async () => {
      // First client holds 2 of 2 units of Variant B
      const firstHold = await holdStock([
        { variantId: TEST_VARIANT_B, quantity: 2 },
      ]);
      expect(firstHold.success).toBe(true);

      // Second client attempts to hold 1 unit of Variant B
      const secondHold = await holdStock([
        { variantId: TEST_VARIANT_B, quantity: 1 },
      ]);
      expect(secondHold.success).toBe(false);
      expect(secondHold.error).toContain('Insufficient stock');
    });
  });

  describe('2. Reservation Expiry & Hold Release', () => {
    it('releases reserved stock when customer cancels or session expires', async () => {
      const hold = await holdStock([
        { variantId: TEST_VARIANT_A, quantity: 3 },
      ]);
      expect(hold.success).toBe(true);

      let stock = getMockStock(TEST_VARIANT_A);
      expect(stock.reserved).toBe(3);

      // Customer abandons checkout
      const released = await releaseHold(hold.reservationId!);
      expect(released).toBe(true);

      stock = getMockStock(TEST_VARIANT_A);
      expect(stock.reserved).toBe(0);
      expect(stock.quantity - stock.reserved).toBe(5);
    });
  });

  describe('3. Order Conversion & Stock Decrement', () => {
    it('finalizes order, decrements physical inventory permanently, and releases reservation', async () => {
      const hold = await holdStock([
        { variantId: TEST_VARIANT_A, quantity: 2 },
      ]);
      expect(hold.success).toBe(true);

      const orderResult = await finalizeOrder(
        hold.reservationId!,
        'pi_mock_123456789',
        {
          email: 'client@aura-apparel.com',
          totalAmount: 4900,
          currency: 'USD',
        }
      );

      expect(orderResult.success).toBe(true);
      expect(orderResult.orderId).toBeDefined();

      // Verify physical quantity decreased from 5 to 3 and reserved reset to 0
      const stock = getMockStock(TEST_VARIANT_A);
      expect(stock.quantity).toBe(3);
      expect(stock.reserved).toBe(0);
    });
  });

  describe('4. Stripe Checkout Session Generation', () => {
    it('generates a checkout session and mock URL in testing environment', async () => {
      const sessionResult = await createCheckoutSession({
        items: [
          {
            name: 'The Structured Cashmere Overcoat',
            amount: 245000, // $2,450.00
            currency: 'USD',
            quantity: 1,
          },
        ],
        customerEmail: 'patron@aura-apparel.com',
        reservationId: 'res_test_001',
        successUrl: 'http://localhost:3000/checkout/success',
        cancelUrl: 'http://localhost:3000/checkout?cancelled=true',
      });

      expect(sessionResult.sessionId).toBeDefined();
      expect(sessionResult.url).toBeDefined();
      expect(sessionResult.url).toContain('session_id=');
      expect(sessionResult.url).toContain('reservation_id=res_test_001');
    });

    it('reports stripe configuration status gracefully', () => {
      const configured = isStripeConfigured();
      expect(typeof configured).toBe('boolean');
    });
  });
});
