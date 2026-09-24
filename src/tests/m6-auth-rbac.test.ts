import { describe, it, expect } from 'vitest';
import {
  signAuthToken,
  verifyAuthToken,
  isStaffRole,
  hasPermission,
  Role,
  DEMO_USERS,
  STAFF_ROLES,
} from '../../lib/auth';

describe('Phase 2: Authentication, RBAC & Security Layer Suite', () => {
  describe('1. Staff Role Identification', () => {
    it('identifies Super Admin as staff', () => {
      expect(isStaffRole(Role.SUPER_ADMIN)).toBe(true);
    });

    it('identifies Merchandiser as staff', () => {
      expect(isStaffRole(Role.MERCHANDISER)).toBe(true);
    });

    it('identifies Fulfillment Specialist as staff', () => {
      expect(isStaffRole(Role.FULFILLMENT)).toBe(true);
    });

    it('rejects Customer as staff', () => {
      expect(isStaffRole(Role.CUSTOMER)).toBe(false);
    });

    it('handles null or undefined roles safely', () => {
      expect(isStaffRole(null)).toBe(false);
      expect(isStaffRole(undefined)).toBe(false);
    });
  });

  describe('2. Role-Based Permissions (RBAC)', () => {
    it('grants Super Admin access to all restricted operations', () => {
      expect(hasPermission(Role.SUPER_ADMIN, [Role.MERCHANDISER])).toBe(true);
      expect(hasPermission(Role.SUPER_ADMIN, [Role.FULFILLMENT])).toBe(true);
    });

    it('grants Merchandiser access only to allowed merchandiser actions', () => {
      expect(hasPermission(Role.MERCHANDISER, [Role.MERCHANDISER])).toBe(true);
      expect(hasPermission(Role.MERCHANDISER, [Role.FULFILLMENT])).toBe(false);
    });

    it('grants Fulfillment access only to allowed fulfillment actions', () => {
      expect(hasPermission(Role.FULFILLMENT, [Role.FULFILLMENT])).toBe(true);
      expect(hasPermission(Role.FULFILLMENT, [Role.MERCHANDISER])).toBe(false);
    });
  });

  describe('3. Tamper-Proof JWT Signing & Verification', () => {
    it('signs and verifies a valid staff session token', async () => {
      const user = DEMO_USERS['admin@aura-apparel.com'];
      const token = await signAuthToken(user);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);

      const verified = await verifyAuthToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe(user.email);
      expect(verified?.role).toBe(Role.SUPER_ADMIN);
    });

    it('signs and verifies a private customer session token', async () => {
      const user = DEMO_USERS['client@aura-apparel.com'];
      const token = await signAuthToken(user);

      const verified = await verifyAuthToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe(user.email);
      expect(verified?.role).toBe(Role.CUSTOMER);
    });

    it('rejects tampered or forged JWT tokens', async () => {
      const user = DEMO_USERS['admin@aura-apparel.com'];
      const token = await signAuthToken(user);
      const forged = token.slice(0, -5) + 'xxxxx';

      const verified = await verifyAuthToken(forged);
      expect(verified).toBeNull();
    });
  });

  describe('4. Demo Credentials Integrity', () => {
    it('provides all 4 core roles in DEMO_USERS', () => {
      expect(DEMO_USERS['admin@aura-apparel.com'].role).toBe(Role.SUPER_ADMIN);
      expect(DEMO_USERS['merchandiser@aura-apparel.com'].role).toBe(Role.MERCHANDISER);
      expect(DEMO_USERS['fulfillment@aura-apparel.com'].role).toBe(Role.FULFILLMENT);
      expect(DEMO_USERS['client@aura-apparel.com'].role).toBe(Role.CUSTOMER);
    });

    it('enforces non-empty secure passwords for all demo accounts', () => {
      for (const account of Object.values(DEMO_USERS)) {
        expect(account.password.length).toBeGreaterThanOrEqual(10);
      }
    });
  });
});
