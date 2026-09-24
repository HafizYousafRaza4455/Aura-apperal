import { PrismaClient } from '@prisma/client';

/**
 * ==============================================================================
 * AURA APPAREL - PRISMA CLIENT & SUPABASE SERVERLESS CONNECTION ARCHITECTURE
 * ==============================================================================
 *
 * 1. Supabase Transaction Pooler (PgBouncer / Supavisor on Port 6543):
 *    In Vercel serverless functions and ephemeral AWS Lambda execution contexts,
 *    each concurrent invocation spins up in a container. Directly connecting to
 *    PostgreSQL's default session port (5432) will quickly exhaust PostgreSQL's
 *    available connection slots ("FATAL: too many connections" / Prisma P2024).
 *
 *    To ensure maximum resilience and throughput:
 *    - `DATABASE_URL` MUST point to Supabase's Transaction Pooler on PORT 6543:
 *      postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
 *
 *    Key Connection Query Parameters:
 *    - `?pgbouncer=true`: Instructs Prisma Client to disable prepared statements,
 *      which are stateful and incompatible with PgBouncer's transaction-level pooling.
 *    - `&connection_limit=1`: Restricts each serverless function instance to 1
 *      database socket, preventing concurrent serverless lambdas from swamping the pool.
 *
 * 2. Direct Connection for Migrations (Port 5432):
 *    Prisma Migrate requires direct session-level capabilities (advisory locks):
 *    - Configure `DIRECT_URL` in .env pointing to port 5432:
 *      postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
 *
 * 3. Preserving PrismaClient Instance across Cold Starts & Hot Reloads:
 *    In development (Next.js HMR), globalThis prevents re-creating PrismaClient
 *    on every file edit.
 *    In production serverless (Vercel Lambda), container memory is retained across
 *    warm invocations. Preserving globalThis.prisma ensures that warm containers reuse
 *    the existing Prisma connection pool rather than leaking open sockets.
 * ==============================================================================
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Always cache client on globalThis to preserve connection pool across warm serverless invocations & dev HMR
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
