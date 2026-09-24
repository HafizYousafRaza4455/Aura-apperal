import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuthToken, isStaffRole } from './lib/auth';

// Simple in-memory sliding window rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Safely extracts and sanitizes client IP address to prevent anti-spoofing
 * and key injection into the edge rate limiter map.
 */
function getSanitizedClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  let rawIp = '';

  if (forwarded) {
    // Take the first IP from comma-separated list (client IP in client, proxy1, proxy2)
    rawIp = forwarded.split(',')[0].trim();
  } else {
    rawIp = request.headers.get('x-real-ip')?.trim() || '';
  }

  if (!rawIp) {
    return '127.0.0.1';
  }

  // Strip control chars, newlines, colons, or any character outside valid IPv4 / IPv6 chars
  // and truncate to 45 chars (max IPv6 length) to prevent key injection attacks
  const sanitized = rawIp.slice(0, 45).replace(/[^0-9a-fA-F:._%-]/g, '');
  return sanitized || '127.0.0.1';
}

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Protect edge memory by periodically evicting expired entries when map grows large
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) {
        rateLimitMap.delete(k);
      }
    }
  }

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getSanitizedClientIp(request);

  // 1. RATE LIMITING FOR APIS
  let apiRateLimitHeaders: Record<string, string> | null = null;
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

    apiRateLimitHeaders = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
    };
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

  // 3. SECURITY HEADERS (OWASP Security Misconfiguration Hardening)
  const response = NextResponse.next();
  const isProduction = process.env.NODE_ENV === 'production';

  // Strict-Transport-Security: 2 years with subdomains and preload in production
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Content-Security-Policy: strictly scoped to required services
  // Disables unsafe-eval in production; permits Stripe, Google Fonts, Unsplash, Cloudinary, and Supabase
  const cspDirectives = [
    "default-src 'self'",
    isProduction
      ? "script-src 'self' 'unsafe-inline' https://js.stripe.com"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://*.supabase.co",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');

  if (apiRateLimitHeaders) {
    for (const [headerName, headerVal] of Object.entries(apiRateLimitHeaders)) {
      response.headers.set(headerName, headerVal);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
