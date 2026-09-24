import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuthToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get('aura_staff_token')?.value ||
    request.cookies.get('aura_session')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = await verifyAuthToken(token);
  return NextResponse.json({ user });
}
