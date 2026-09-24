import { NextRequest, NextResponse } from 'next/server';
import { signAuthToken, Role } from '@/../lib/auth';
import { redis } from '@/../lib/redis';

const ADMIN_MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'AuraAtelier2026!';
const LOCKOUT_DURATION_SECONDS = 3600; // 1 Hour (3,600s)
const MAX_ATTEMPTS = 5;

// In-memory fallback tracking for attempts and lockout state
interface ClientAttemptState {
  attempts: number;
  lockedUntil: number; // timestamp in ms
}

const clientAttempts = new Map<string, ClientAttemptState>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Check if client is locked out */
async function checkLockout(ip: string): Promise<{ locked: boolean; remainingSeconds: number; attempts: number }> {
  // Check Redis if available
  if (redis && redis.status === 'ready') {
    try {
      const lockKey = `admin:lockout:${ip}`;
      const attemptsKey = `admin:attempts:${ip}`;
      const ttl = await redis.ttl(lockKey);

      if (ttl > 0) {
        return { locked: true, remainingSeconds: ttl, attempts: MAX_ATTEMPTS };
      }

      const attemptsStr = await redis.get(attemptsKey);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      return { locked: false, remainingSeconds: 0, attempts };
    } catch {
      // Redis error fallback
    }
  }

  // In-memory fallback
  const state = clientAttempts.get(ip);
  if (!state) return { locked: false, remainingSeconds: 0, attempts: 0 };

  const now = Date.now();
  if (state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds, attempts: state.attempts };
  }

  // Lockout expired
  if (state.lockedUntil !== 0 && state.lockedUntil <= now) {
    clientAttempts.delete(ip);
    return { locked: false, remainingSeconds: 0, attempts: 0 };
  }

  return { locked: false, remainingSeconds: 0, attempts: state.attempts };
}

/** Record failed attempt */
async function recordFailure(ip: string): Promise<{ locked: boolean; remainingSeconds: number; attemptsLeft: number }> {
  // Check Redis if ready
  if (redis && redis.status === 'ready') {
    try {
      const lockKey = `admin:lockout:${ip}`;
      const attemptsKey = `admin:attempts:${ip}`;

      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, LOCKOUT_DURATION_SECONDS);

      if (attempts >= MAX_ATTEMPTS) {
        await redis.set(lockKey, '1', 'EX', LOCKOUT_DURATION_SECONDS);
        return { locked: true, remainingSeconds: LOCKOUT_DURATION_SECONDS, attemptsLeft: 0 };
      }

      return { locked: false, remainingSeconds: 0, attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts) };
    } catch {
      // Redis error fallback
    }
  }

  // In-memory fallback
  let state = clientAttempts.get(ip);
  if (!state) {
    state = { attempts: 0, lockedUntil: 0 };
    clientAttempts.set(ip, state);
  }

  state.attempts += 1;

  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
    return { locked: true, remainingSeconds: LOCKOUT_DURATION_SECONDS, attemptsLeft: 0 };
  }

  return { locked: false, remainingSeconds: 0, attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.attempts) };
}

/** Clear failed attempts upon successful authentication */
async function clearAttempts(ip: string) {
  if (redis && redis.status === 'ready') {
    try {
      await redis.del(`admin:attempts:${ip}`, `admin:lockout:${ip}`);
    } catch {}
  }
  clientAttempts.delete(ip);
}

/** GET: Check current lockout status for client */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const status = await checkLockout(ip);
  return NextResponse.json(status);
}

/** POST: Verify Master Password with 5-Attempt Lockout Enforcement */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Check if currently locked
  const lockStatus = await checkLockout(ip);
  if (lockStatus.locked) {
    return NextResponse.json(
      {
        error: 'SECURITY_LOCKOUT',
        message: 'Maximum authorized attempts exceeded. Re-enter button locked for 1 hour.',
        locked: true,
        remainingSeconds: lockStatus.remainingSeconds,
        attemptsLeft: 0,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // 2. Validate Password with timing-attack resistant comparison
    const trimmedInput = password.trim();
    const isPasswordValid =
      constantTimeCompare(trimmedInput, ADMIN_MASTER_PASSWORD) ||
      constantTimeCompare(password, ADMIN_MASTER_PASSWORD);

    if (!isPasswordValid) {
      const failure = await recordFailure(ip);

      return NextResponse.json(
        {
          error: failure.locked ? 'SECURITY_LOCKOUT' : 'INVALID_PASSWORD',
          message: failure.locked
            ? 'Unauthorized: 5 incorrect password attempts. Access is locked for 1 hour.'
            : `Invalid admin passcode. ${failure.attemptsLeft} attempt(s) remaining before 1-hour lockout.`,
          locked: failure.locked,
          remainingSeconds: failure.remainingSeconds,
          attemptsLeft: failure.attemptsLeft,
        },
        { status: failure.locked ? 429 : 401 }
      );
    }

    // 3. Success: Clear attempts & Issue Admin Session Token
    await clearAttempts(ip);

    const adminUser = {
      id: 'admin-master-authorized',
      email: 'director@aura-apparel.com',
      name: 'Eleanor Vance (Atelier Director)',
      role: Role.SUPER_ADMIN,
    };

    const token = await signAuthToken(adminUser, '24h');

    const response = NextResponse.json({
      success: true,
      redirect: '/atelier-admin',
      user: adminUser,
    });

    // Set secure HTTP-only session cookies
    response.cookies.set('aura_staff_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hours
    });
    response.cookies.set('aura_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Authorization error', message: err.message },
      { status: 500 }
    );
  }
}
