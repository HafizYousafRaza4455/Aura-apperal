import { SignJWT, jwtVerify } from 'jose';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  MERCHANDISER = 'MERCHANDISER',
  FULFILLMENT = 'FULFILLMENT',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

const RAW_SECRET =
  process.env.NEXTAUTH_SECRET || 'aura_super_secret_development_key_change_in_production_32b';

const base64urlSecret =
  typeof Buffer !== 'undefined'
    ? Buffer.from(RAW_SECRET).toString('base64url')
    : btoa(RAW_SECRET).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const SECRET_KEY = { kty: 'oct', k: base64urlSecret };

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export const STAFF_ROLES: Role[] = [Role.SUPER_ADMIN, Role.MERCHANDISER, Role.FULFILLMENT];

export const isStaffRole = (role?: string | null): boolean => {
  if (!role) return false;
  return STAFF_ROLES.includes(role as Role);
};

export const hasPermission = (userRole: Role, allowedRoles: Role[]): boolean => {
  if (userRole === Role.SUPER_ADMIN) return true;
  return allowedRoles.includes(userRole);
};

/** Sign a tamper-proof JWT auth token */
export async function signAuthToken(user: AuthUser, expiresIn: string = '7d'): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}

/** Verify a JWT auth token and decode payload */
export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
      role: payload.role as Role,
    };
  } catch (err) {
    return null;
  }
}

/** Built-in Staff & Test Demo Accounts for Frictionless Verification */
export const DEMO_USERS: Record<string, AuthUser & { password: string }> = {
  'admin@aura-apparel.com': {
    id: 'user-super-admin',
    email: 'admin@aura-apparel.com',
    name: 'Eleanor Vance (Atelier Director)',
    role: Role.SUPER_ADMIN,
    password: 'ObsidianGold2026!',
  },
  'merchandiser@aura-apparel.com': {
    id: 'user-merchandiser',
    email: 'merchandiser@aura-apparel.com',
    name: 'Marco Bellini (Head Merchandiser)',
    role: Role.MERCHANDISER,
    password: 'Atelier2026!',
  },
  'fulfillment@aura-apparel.com': {
    id: 'user-fulfillment',
    email: 'fulfillment@aura-apparel.com',
    name: 'Kaito Tanaka (Logistics Specialist)',
    role: Role.FULFILLMENT,
    password: 'MilanHub2026!',
  },
  'client@aura-apparel.com': {
    id: 'user-client',
    email: 'client@aura-apparel.com',
    name: 'Victoria Sterling (Private Client)',
    role: Role.CUSTOMER,
    password: 'LuxuryClient2026!',
  },
};
