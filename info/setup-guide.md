# Setup, Development & Deployment Guide — Aura Apparel

This document provides a comprehensive operational guide for spinning up the Aura Apparel platform locally, running automated test suites, debugging common issues, and deploying to production.

---

## 1. Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js:** `v20.x` or `v22.x` (LTS)
- **Package Manager:** `npm` (v10+) or `pnpm` (v9+)
- **Docker Desktop:** Required for running local PostgreSQL 16 and Redis 7 containers
- **Git**

---

## 2. Step-by-Step Local Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/aura_apparel.git
cd aura_apparel
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a local `.env` file by copying the template:
```bash
cp .env.example .env
```

Review and adjust the environment keys if needed:
```ini
# PostgreSQL connection string for Prisma
DATABASE_URL="postgresql://aura_user:aura_password@localhost:5432/aura_apparel_db?schema=public"

# Redis connection string for caching & 10-minute cart holds
REDIS_URL="redis://localhost:6379"

# Next.js Host URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT Secret for Session and Staff RBAC signing
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="aura_super_secret_development_key_change_in_production_32b"

# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_sample"
STRIPE_SECRET_KEY="sk_test_sample"
STRIPE_WEBHOOK_SECRET="whsec_sample"
```

---

### Step 4: Boot Infrastructure Containers
Start PostgreSQL and Redis in detached mode:
```bash
docker compose up -d
```

Verify containers are running:
```bash
docker ps
```
You should see:
- `aura-postgres` listening on port `5432`
- `aura-redis` listening on port `6379`

---

### Step 5: Synchronize Prisma & Seed Data
Initialize the database tables and populate the luxury apparel catalog:

```bash
# Push schema to the Postgres database
npm run db:push

# Generate Prisma Client TypeScript types
npm run db:generate

# Seed the luxury products, colors, variants, and stock
npm run db:seed
```

---

### Step 6: Start the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the live storefront.

---

## 3. Key Application Routes & Portals

| Route | Role / Purpose | Description |
| :--- | :--- | :--- |
| `/` | Public | Main storefront: Hero, Collections, Trending Grid, Brand Story |
| `/checkout` | Customer | Order summary, shipping address capture, and Stripe payment handoff |
| `/checkout/success` | Customer | Post-purchase confirmation and delivery tracking |
| `/account` | Customer | Profile management, bespoke tailoring measurements, past orders |
| `/admin/login` | Staff | Atelier staff login portal |
| `/atelier-admin` | Staff (`MERCHANDISER`, `SUPER_ADMIN`) | Real-time inventory matrix, stock adjustments, and order tracking |

---

## 4. Running Automated Tests

Aura Apparel includes a full suite of unit, integration, and stress tests using **Vitest**:

```bash
# Run all tests once
npm run test

# Run tests in interactive watch mode
npm run test:watch
```

### Key Test Suites (`src/tests/`):
- `m1-shell.test.tsx`: Validates header navigation, brand typography, and mobile responsiveness.
- `m2-catalog.test.tsx`: Tests category filtering, badge renders, and product card interactions.
- `m3-modal.test.tsx`: Validates color swatch switching, size selection, and stock status.
- `m4-cart.test.tsx`: Verifies cart drawer open/close, quantity adjustments, and subtotal calculation.
- `m5-e2e.test.tsx`: Full end-to-end user checkout workflow.
- `m6-auth-rbac.test.ts`: Staff role permissions and route access verification.
- `m7-checkout-reservation.test.ts`: 10-minute atomic inventory hold and concurrent reservation tests.
- `m10-admin-lockout.test.ts`: Brute-force protection and rate-limiting validation.

---

## 5. Stripe Webhook Testing (Local Development)

To test Stripe checkout fulfillment locally:
1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Authenticate: `stripe login`
3. Forward webhook events to your local Next.js server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the resulting webhook signing secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 6. Troubleshooting & Diagnostics

### Database Connection Refused
- **Symptom:** `PrismaClientInitializationError: Can't reach database server at localhost:5432`
- **Solution:** Verify Docker is running: `docker compose ps`. If stopped, execute `docker compose up -d`.

### Redis Disconnected Fallback
- The application includes an **in-memory fallback** for local development. If Redis is unavailable, inventory holds will fall back to local memory without crashing the server.

### Resetting Database State
If you wish to wipe the local database and re-seed from scratch:
```bash
docker compose down -v
docker compose up -d
npm run db:push
npm run db:seed
```

---

## 7. Production Deployment Checklist

1. **Build Verification:** Ensure bundle compiles with zero TypeScript or linting errors:
   ```bash
   npm run build
   ```
2. **Database Migrations:** For production databases, run `npx prisma migrate deploy` instead of `db:push`.
3. **Environment Security:**
   - Generate a cryptographically secure 32-character string for `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).
   - Switch Stripe API keys from `pk_test_` / `sk_test_` to production live keys.
   - Configure a hosted PostgreSQL instance (e.g., Supabase, Neon, AWS RDS) with connection pooling.
   - Configure a hosted Redis instance (e.g., Upstash, Redis Cloud).
4. **Vercel / Cloud Run Deployment:**
   - Aura Apparel is fully compatible with Vercel or containerized Docker deployments.
   - Set all environment variables in your hosting provider's project settings dashboard.
