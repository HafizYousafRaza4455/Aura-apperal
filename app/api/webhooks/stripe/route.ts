import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/../lib/stripe';
import { finalizeOrder, releaseHold } from '@/../lib/inventory-reservation';
import { redis } from '@/../lib/redis';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await req.text();
    let event: any;

    if (stripe && webhookSecret) {
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe signature header' }, { status: 400 });
      }

      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    } else {
      // In development / test mode without active webhook secret
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    // 1. Idempotency Check via Redis
    const eventId = event.id;
    if (eventId && redis) {
      try {
        const isProcessed = await redis.get(`stripe:event:${eventId}`);
        if (isProcessed) {
          return NextResponse.json({ received: true, note: 'Event already processed' });
        }
        await redis.set(`stripe:event:${eventId}`, '1', 'EX', 86400); // 24h idempotency window
      } catch (err) {
        console.warn('Redis event deduplication warning:', err);
      }
    }

    // 2. Handle relevant event types
    switch (event.type) {
      case 'checkout.session.completed':
      case 'payment_intent.succeeded': {
        const session = event.data.object;
        const reservationId =
          session.client_reference_id ||
          session.metadata?.reservationId ||
          session.metadata?.client_reference_id;

        if (reservationId) {
          const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
          const currency = session.currency ? session.currency.toUpperCase() : 'USD';
          const email = session.customer_email || session.customer_details?.email;

          await finalizeOrder(reservationId, session.id || session.payment_intent, {
            email,
            totalAmount,
            currency,
          });
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object;
        const reservationId =
          session.client_reference_id ||
          session.metadata?.reservationId;

        if (reservationId) {
          await releaseHold(reservationId);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: err.message },
      { status: 500 }
    );
  }
}
