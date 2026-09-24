import { NextRequest, NextResponse } from 'next/server';
import { holdStock } from '@/../lib/inventory-reservation';
import { createCheckoutSession } from '@/../lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail, currency = 'USD' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart must contain at least one item' },
        { status: 400 }
      );
    }

    // 1. Acquire 10-minute atomic hold on inventory
    const holdItems = items.map((item: any) => ({
      variantId: item.variantId || item.id,
      quantity: item.quantity || 1,
    }));

    const holdResult = await holdStock(holdItems);

    if (!holdResult.success || !holdResult.reservationId) {
      return NextResponse.json(
        {
          error: holdResult.error || 'One or more items in your cart are no longer available in this quantity.',
          code: 'INSUFFICIENT_STOCK',
        },
        { status: 409 }
      );
    }

    // 2. Prepare checkout session
    const origin = req.nextUrl.origin;
    const checkoutParams = {
      items: items.map((item: any) => ({
        name: item.name,
        description: item.color ? `Color: ${item.color} | Size: ${item.size || 'One Size'}` : undefined,
        amount: Math.round((item.price || 0) * 100),
        currency: currency.toLowerCase(),
        quantity: item.quantity || 1,
        image: item.image,
      })),
      customerEmail,
      reservationId: holdResult.reservationId,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${holdResult.reservationId}`,
      cancelUrl: `${origin}/checkout?cancelled=true&reservation_id=${holdResult.reservationId}`,
    };

    const sessionResult = await createCheckoutSession(checkoutParams);

    return NextResponse.json({
      sessionId: sessionResult.sessionId,
      url: sessionResult.url,
      isMock: sessionResult.isMock,
      reservationId: holdResult.reservationId,
      expiresAt: holdResult.expiresAt,
    });
  } catch (err: any) {
    console.error('Checkout session creation failed:', err);
    return NextResponse.json(
      { error: 'Internal checkout initialization failed', message: err.message },
      { status: 500 }
    );
  }
}
