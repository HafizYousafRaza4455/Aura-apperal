import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from '../../app/api/auth/admin-passcode/route';
import { NextRequest } from 'next/server';

describe('Phase 6: Admin URL Separation, Passcode Authorization & 1-Hour Lockout Suite', () => {
  // Use unique client IPs per test to isolate attempt counters
  let testIpCounter = 100;
  const getUniqueReq = (body: any, ip?: string) => {
    const clientIp = ip || `192.168.1.${testIpCounter++}`;
    return new NextRequest('http://localhost:8080/api/auth/admin-passcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIp,
      },
      body: JSON.stringify(body),
    });
  };

  describe('1. Passcode Authorization', () => {
    it('accepts correct master password and issues staff authorization cookie', async () => {
      const req = getUniqueReq({ password: 'AuraAtelier2026!' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.redirect).toBe('/atelier-admin');
      expect(data.user.role).toBe('SUPER_ADMIN');
    });

    it('rejects incorrect password with 401 and decrements remaining attempts', async () => {
      const req = getUniqueReq({ password: 'WrongPassword123' });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe('INVALID_PASSWORD');
      expect(data.attemptsLeft).toBe(4);
      expect(data.locked).toBe(false);
    });
  });

  describe('2. 5-Attempt Failure Limit & 1-Hour Lockout', () => {
    it('triggers a strict 1-hour (3600s) security lockout on the 5th incorrect attempt', async () => {
      const clientIp = `10.0.0.${testIpCounter++}`;

      // Submit 4 incorrect attempts
      for (let attempt = 1; attempt <= 4; attempt++) {
        const req = getUniqueReq({ password: `BadPass_${attempt}` }, clientIp);
        const res = await POST(req);
        const data = await res.json();
        expect(res.status).toBe(401);
        expect(data.locked).toBe(false);
        expect(data.attemptsLeft).toBe(5 - attempt);
      }

      // 5th incorrect attempt -> MUST trigger 1-hour lockout
      const fifthReq = getUniqueReq({ password: 'FinalBadPassword' }, clientIp);
      const fifthRes = await POST(fifthReq);
      const fifthData = await fifthRes.json();

      expect(fifthRes.status).toBe(429);
      expect(fifthData.locked).toBe(true);
      expect(fifthData.error).toBe('SECURITY_LOCKOUT');
      expect(fifthData.remainingSeconds).toBeGreaterThan(3500);
      expect(fifthData.remainingSeconds).toBeLessThanOrEqual(3600);
      expect(fifthData.attemptsLeft).toBe(0);
    });

    it('rejects all subsequent requests (even with correct password) during the 1-hour lockout period', async () => {
      const clientIp = `10.0.0.${testIpCounter++}`;

      // Trigger lockout with 5 failures
      for (let i = 0; i < 5; i++) {
        await POST(getUniqueReq({ password: 'wrong' }, clientIp));
      }

      // 6th attempt with CORRECT password must still be rejected due to active lockout
      const lockedReq = getUniqueReq({ password: 'AuraAtelier2026!' }, clientIp);
      const lockedRes = await POST(lockedReq);
      const lockedData = await lockedRes.json();

      expect(lockedRes.status).toBe(429);
      expect(lockedData.locked).toBe(true);
      expect(lockedData.error).toBe('SECURITY_LOCKOUT');
      expect(lockedData.remainingSeconds).toBeGreaterThan(0);
    });
  });
});
