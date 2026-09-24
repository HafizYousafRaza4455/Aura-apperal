import { NextResponse } from 'next/server';
import { prisma } from '@/../lib/prisma';
import { redis } from '@/../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  // 1. Check PostgreSQL
  try {
    const dbPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 500)
    );
    await Promise.race([dbPromise, timeoutPromise]);
    dbStatus = 'connected';
  } catch {
    dbStatus = 'degraded_offline';
  }

  // 2. Check Redis
  try {
    if (redis && redis.status === 'ready') {
      await redis.ping();
      redisStatus = 'connected';
    } else {
      redisStatus = 'degraded_offline';
    }
  } catch {
    redisStatus = 'degraded_offline';
  }

  const memory = process.memoryUsage();

  return NextResponse.json(
    {
      status: 'healthy',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        cache: redisStatus,
      },
      system: {
        nodeVersion: process.version,
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      },
      latencyMs: Date.now() - startTime,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
