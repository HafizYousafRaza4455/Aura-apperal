import { NextResponse } from 'next/server';
import { DEMO_USERS, signAuthToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Check Demo Accounts First for fast testing
    const demoUser = DEMO_USERS[email.toLowerCase().trim()];
    let user = null;

    if (demoUser && demoUser.password === password) {
      user = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
      };
    } else {
      // 2. Check PostgreSQL via Prisma if available
      try {
        const { prisma } = await import('../../../../lib/prisma');
        const dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        if (dbUser) {
          // For demo, accept password or compare hash
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || undefined,
            role: dbUser.role,
          };
        }
      } catch (e) {
        // DB not connected, fallback
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signAuthToken(user);
    const response = NextResponse.json({ success: true, user });

    // Set secure HTTP-only session cookie
    response.cookies.set('aura_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
