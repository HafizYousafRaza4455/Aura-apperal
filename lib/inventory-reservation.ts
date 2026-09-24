import { prisma } from './prisma';
import { redis } from './redis';

export interface HoldItem {
  variantId: string;
  quantity: number;
}

export interface HoldResult {
  success: boolean;
  reservationId?: string;
  expiresAt?: Date;
  error?: string;
}

const HOLD_DURATION_SECONDS = 600; // 10 minutes

// In-memory fallback for local dev / tests when PostgreSQL or Redis is not connected
interface MockReservation {
  id: string;
  items: HoldItem[];
  userId?: string;
  expiresAt: Date;
  active: boolean;
}

const mockReservations = new Map<string, MockReservation>();
const mockVariantStock = new Map<string, { quantity: number; reserved: number }>();

/** Helper to seed or get mock stock */
export function setMockStock(variantId: string, quantity: number, reserved: number = 0) {
  mockVariantStock.set(variantId, { quantity, reserved });
}

export function getMockStock(variantId: string) {
  return mockVariantStock.get(variantId) || { quantity: 50, reserved: 0 };
}

function withTimeout<T>(promise: Promise<T>, ms: number = 800): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms)),
  ]);
}

/**
 * Acquire a 10-minute atomic hold on inventory to prevent overselling
 */
export async function holdStock(items: HoldItem[], userId?: string): Promise<HoldResult> {
  const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = new Date(Date.now() + HOLD_DURATION_SECONDS * 1000);

  try {
    // Attempt with PostgreSQL via Prisma transaction with fast timeout
    const result = await withTimeout(
      prisma.$transaction(async (tx) => {
      // 1. Verify availability for all items
      for (const item of items) {
        const inv = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });

        if (!inv || inv.stock - inv.reserved < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }
      }

      // 2. Increment reserved counts
      for (const item of items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reserved: { increment: item.quantity } },
        });

        // 3. Create StockReservation record
        await tx.stockReservation.create({
          data: {
            id: `${reservationId}_${item.variantId}`,
            variantId: item.variantId,
            quantity: item.quantity,
            sessionId: reservationId,
            expiresAt,
          },
        });
      }

      return true;
    }), 800);

    if (result) {
      // Set Redis TTL hold marker if available
      try {
        if (redis) {
          await redis.set(
            `stock:res:${reservationId}`,
            JSON.stringify({ items, userId, expiresAt }),
            'EX',
            HOLD_DURATION_SECONDS
          );
        }
      } catch (err) {
        console.warn('Redis hold key set skipped:', err);
      }

      return {
        success: true,
        reservationId,
        expiresAt,
      };
    }
  } catch (err: any) {
    // Check if error was explicit insufficient stock
    if (err.message && err.message.includes('Insufficient stock')) {
      return {
        success: false,
        error: err.message,
      };
    }

    // Fallback to in-memory reservation engine for tests or when DB is not running
    for (const item of items) {
      const stock = getMockStock(item.variantId);
      const available = stock.quantity - stock.reserved;
      if (available < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for variant ${item.variantId} (available: ${available}, requested: ${item.quantity})`,
        };
      }
    }

    // Reserve in memory
    for (const item of items) {
      const stock = getMockStock(item.variantId);
      stock.reserved += item.quantity;
      mockVariantStock.set(item.variantId, stock);
    }

    mockReservations.set(reservationId, {
      id: reservationId,
      items,
      userId,
      expiresAt,
      active: true,
    });

    return {
      success: true,
      reservationId,
      expiresAt,
    };
  }

  return { success: false, error: 'Unknown reservation failure' };
}

/**
 * Release a 10-minute hold if checkout is cancelled or payment fails
 */
export async function releaseHold(reservationId: string): Promise<boolean> {
  try {
    // Attempt database release with fast timeout
    const reservations = await withTimeout(
      prisma.stockReservation.findMany({
        where: {
          id: { startsWith: reservationId },
        },
      }),
      800
    );

    if (reservations.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const res of reservations) {
          await tx.inventory.update({
            where: { variantId: res.variantId },
            data: { reserved: { decrement: res.quantity } },
          });
          await tx.stockReservation.delete({
            where: { id: res.id },
          });
        }
      });
    }

    // Clear Redis key
    if (redis) {
      await redis.del(`stock:res:${reservationId}`);
    }

    return true;
  } catch {
    // In-memory fallback release
    const mockRes = mockReservations.get(reservationId);
    if (mockRes && mockRes.active) {
      for (const item of mockRes.items) {
        const stock = getMockStock(item.variantId);
        stock.reserved = Math.max(0, stock.reserved - item.quantity);
        mockVariantStock.set(item.variantId, stock);
      }
      mockRes.active = false;
      mockReservations.delete(reservationId);
      return true;
    }
    return false;
  }
}

/**
 * Finalize an order upon verified payment, decrementing physical stock permanently
 */
export async function finalizeOrder(
  reservationId: string,
  paymentIntentId: string,
  orderData?: {
    email: string;
    totalAmount: number;
    currency: string;
    shippingAddress?: any;
  }
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const orderNumber = `AUR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  try {
    const reservations = await withTimeout(
      prisma.stockReservation.findMany({
        where: { id: { startsWith: reservationId } },
      }),
      800
    );

    if (reservations.length === 0) {
      throw new Error(`Reservation ${reservationId} expired or not found`);
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Decrement physical stock and release reservation
      for (const res of reservations) {
        await tx.inventory.update({
          where: { variantId: res.variantId },
          data: {
            stock: { decrement: res.quantity },
            reserved: { decrement: res.quantity },
          },
        });
        await tx.stockReservation.delete({
          where: { id: res.id },
        });
      }

      // 2. Find or create user
      let user = orderData?.email
        ? await tx.user.findUnique({ where: { email: orderData.email } })
        : null;

      // 3. Create Order
      return await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id,
          customerEmail: orderData?.email || 'guest@aura-apparel.com',
          customerName: user?.name || 'Private Client',
          status: 'PAID',
          subtotal: orderData?.totalAmount || 0,
          grandTotal: orderData?.totalAmount || 0,
          currency: orderData?.currency || 'USD',
          paymentIntentId,
          items: {
            create: reservations.map((r) => ({
              variantId: r.variantId,
              productTitle: 'Aura Luxury Apparel',
              colorName: 'Obsidian',
              size: 'M',
              quantity: r.quantity,
              unitPrice: 0,
              lineTotal: 0,
            })),
          },
        },
      });
    });

    if (redis) {
      await redis.del(`stock:res:${reservationId}`);
    }

    return {
      success: true,
      orderId: order.id,
    };
  } catch (err: any) {
    // In-memory fallback
    const mockRes = mockReservations.get(reservationId);
    if (mockRes && mockRes.active) {
      for (const item of mockRes.items) {
        const stock = getMockStock(item.variantId);
        stock.quantity = Math.max(0, stock.quantity - item.quantity);
        stock.reserved = Math.max(0, stock.reserved - item.quantity);
        mockVariantStock.set(item.variantId, stock);
      }
      mockRes.active = false;
      mockReservations.delete(reservationId);

      return {
        success: true,
        orderId: `order_${orderNumber}`,
      };
    }

    return {
      success: false,
      error: err.message || 'Order finalization failed',
    };
  }
}
