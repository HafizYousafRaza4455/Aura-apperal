import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuthToken, isStaffRole } from './lib/auth';

// Simple in-memory sliding window rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // 1. RATE LIMITING FOR APIS
  if (pathname.startsWith('/api/')) {
    const isAuthOrAdmin = pathname.startsWith('/api/auth') || pathname.startsWith('/api/admin');
    const limit = isAuthOrAdmin ? 30 : 120; // 30 req/min for auth/admin, 120 req/min for general catalog
    const { allowed, remaining } = checkRateLimit(`${ip}:${isAuthOrAdmin ? 'auth' : 'api'}`, limit, 60000);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded. Please slow down requests to Aura Apparel APIs.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // 2. STAFF RBAC GUARD FOR /atelier-admin and /admin
  if (
    (pathname.startsWith('/atelier-admin') && pathname !== '/atelier-admin/login') ||
    (pathname.startsWith('/admin') && pathname !== '/admin/login')
  ) {
    const sessionCookie =
      request.cookies.get('aura_staff_token')?.value ||
      request.cookies.get('aura_session')?.value;
    let authorized = false;

    if (sessionCookie) {
      const user = await verifyAuthToken(sessionCookie);
      if (user && isStaffRole(user.role)) {
        authorized = true;
      }
    }

    if (!authorized) {
      const targetLogin = pathname.startsWith('/atelier-admin')
        ? '/atelier-admin/login'
        : '/admin/login';
      const loginUrl = new URL(targetLogin, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. SECURITY HEADERS
  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
      "connect-src 'self' https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')
  );

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
