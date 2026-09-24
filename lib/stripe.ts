import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const isPlaceholderKey = (key?: string) =>
  !key ||
  key.includes('placeholder') ||
  key.includes('...') ||
  key.length < 25;

export const stripe: Stripe | null =
  STRIPE_SECRET_KEY && !isPlaceholderKey(STRIPE_SECRET_KEY)
    ? new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
        appInfo: {
          name: 'Aura Apparel Luxury Storefront',
          version: '1.0.0',
        },
      })
    : null;

export const isStripeConfigured = (): boolean => {
  return !!STRIPE_SECRET_KEY && !isPlaceholderKey(STRIPE_SECRET_KEY);
};

export interface CreateCheckoutSessionParams {
  items: Array<{
    name: string;
    description?: string;
    amount: number; // in cents
    currency: string;
    quantity: number;
    image?: string;
  }>;
  customerEmail?: string;
  reservationId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url?: string;
  isMock: boolean;
}

/**
 * Creates a checkout session using Stripe or a development fallback
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  if (!params.items || !Array.isArray(params.items) || params.items.length === 0) {
    throw new Error('Checkout session requires at least one item');
  }

  for (const item of params.items) {
    if (typeof item.amount !== 'number' || item.amount <= 0 || isNaN(item.amount)) {
      throw new Error(`Invalid item amount: ${item.amount}. Price must be greater than zero.`);
    }
  }

  if (stripe && isStripeConfigured()) {
    try {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) => ({
        price_data: {
          currency: item.currency.toLowerCase(),
          unit_amount: Math.round(item.amount),
          product_data: {
            name: item.name,
            description: item.description,
            images: item.image ? [item.image] : undefined,
          },
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        customer_email: params.customerEmail,
        client_reference_id: params.reservationId,
        metadata: {
          reservationId: params.reservationId,
          ...params.metadata,
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url || undefined,
        isMock: false,
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Stripe checkout session creation failed in production:', err);
        throw err;
      }
      console.warn('Stripe checkout session creation failed, using mock fallback:', err);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Stripe is not configured in production. Mock checkout sessions are forbidden in production.');
  }

  // Graceful development/test mock session
  const mockSessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const mockSuccessUrl = new URL(params.successUrl);
  mockSuccessUrl.searchParams.set('session_id', mockSessionId);
  mockSuccessUrl.searchParams.set('reservation_id', params.reservationId);

  return {
    sessionId: mockSessionId,
    url: mockSuccessUrl.toString(),
    isMock: true,
  };
}
