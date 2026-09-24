# Aura Apparel — Haute Horlogerie & Minimalist Luxury Fashion Storefront

[![Next.js](https://img.shields.io/badge/Next.js-15.2-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment_Integration-635BFF?style=flat&logo=stripe&logoColor=white)](https://stripe.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Postgres_%26_Redis-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

> **Aura Apparel** is a high-performance, full-stack luxury minimalist clothing e-commerce platform. Designed with an editorial aesthetic inspired by modern European ateliers, it features an interactive product catalog, instant search, dynamic cart drawer, atomic inventory reservation engine, Stripe payment processing, and a staff Atelier Admin portal.

---

## 📑 Table of Contents

- [Highlights & Key Features](#-highlights--key-features)
- [Tech Stack](#-tech-stack)
- [Luxury Minimalist Design System](#-luxury-minimalist-design-system)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Overview](#-api-overview)
- [In-Depth Documentation (`/info`)](#-in-depth-documentation-info)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [License](#-license)

---

## ✨ Highlights & Key Features

### 🛍️ Editorial Storefront
- **High-Impact Hero & Lookbook:** Full-bleed editorial photography showcasing seasonal campaigns.
- **Curated Collections:** Quick-filtering across *Outerwear*, *Essentials*, and *Summer Drop*.
- **Trending Products Grid:** Interactive product cards with dynamic badges (`EXCLUSIVE`, `NEW ARRIVAL`, `BESTSELLER`, `SUMMER DROP`), price display, and instant quick-buy triggers.
- **Editorial Brand Story:** Minimalist storytelling module detailing ethical craftsmanship and premium fabrics.

### 🎨 Interactive Product Modal & Catalog
- **Multi-Variant Sizing & Colorways:** Seamless live switching between color swatches, sizes (`XS` to `XL`, `ONE SIZE`), and multi-angle product photography.
- **Live Inventory Feedback:** Visual stock availability indicators preventing out-of-stock orders.
- **Image Fallback Engineering:** Resilient image loading with graceful luxury placeholders.

### 🛒 High-Performance Cart Drawer
- **Persistent State:** Client-side cart persistence across refreshes via `localStorage`.
- **Live Order Economics:** Real-time recalculation of subtotals, configurable taxes, and luxury shipping thresholds.
- **Interactive Controls:** Smooth slide-out drawer, quantity increments, variant adjustments, and instant checkout handoff.

### ⚡ Atomic Inventory Reservation Engine
- **Anti-Overselling Guard:** 10-minute temporary inventory reservation holds units during active checkout sessions.
- **Dual-Engine Redundancy:** Redis distributed TTL locks combined with PostgreSQL row-level transactions via Prisma.
- **Auto-Expiry Cleanup:** Expired or abandoned cart reservations automatically release items back to available inventory.

### 💳 Stripe Checkout & Webhooks
- **Hosted & Custom Stripe Checkout:** Secure payment sessions with custom currency and metadata tagging.
- **Webhook Synchronization:** Idempotent Stripe webhook listeners (`payment_intent.succeeded`, `checkout.session.completed`) that commit reserved stock into official fulfilled orders.

### 🏛️ Atelier Admin Portal (`/admin` & `/atelier-admin`)
- **Role-Based Access Control (RBAC):** Tiered permissions for `CUSTOMER`, `MERCHANDISER`, `FULFILLMENT`, and `SUPER_ADMIN`.
- **Live Inventory Manager:** Real-time stock adjustments across warehouse allocations (`MILAN_ATELIER`).
- **Brute-Force & Lockout Defense:** Sliding-window rate limiting on sensitive administrative authentication endpoints.

### 🔍 Discovery & Telemetry
- **Instant Search Palette:** Fast command-style keyboard shortcut (`Cmd/Ctrl + K`) search with multi-field matching.
- **Edge Performance & Vitals:** Middleware rate limiting, OpenGraph image generation (`/api/og`), and Web Vitals telemetry tracking.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Server & Client Components, Streaming, API routes |
| **UI Library** | [React 19](https://react.dev/) | Component architecture, modern React hooks & actions |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | End-to-end static typing and strict interface contracts |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS, custom design tokens |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma 6.4](https://www.prisma.io/) | Relational database schema, migrations, type-safe queries |
| **Cache & Locks** | [Redis 7](https://redis.io/) (`ioredis`) | High-speed inventory reservations and edge rate-limiting |
| **Payments** | [Stripe](https://stripe.com/) (`@stripe/stripe-js`) | Checkout sessions, webhooks, and payment intents |
| **Security & Auth** | [JOSE](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | JWT signing, secure cookie management, password hashing |
| **3D & Graphics** | [Three.js](https://threejs.org/) | Luxury 3D interactive product visualization |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, minimalist icon system |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Unit, integration, adversarial, and end-to-end tests |
| **Containerization** | [Docker Compose](https://www.docker.com/) | Zero-config local Postgres and Redis orchestration |

---

## 💎 Luxury Minimalist Design System

Aura Apparel follows a strict luxury design token architecture:

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| **Obsidian** | `#0D0D0D` | Primary brand canvas, high-contrast backgrounds, typography |
| **Pale Gold** | `#D4AF37` | Exclusive luxury accents, badges, highlights |
| **Cloud White** | `#FBFBFB` | Pure, breathable background canvas and clean whitespace |
| **Slate Gray** | `#707070` | Secondary metadata, subtitles, muted borders |
| **Geometry** | `0px` radius | Sharp, architectural modernist edges with zero rounded corners |
| **Display Font** | `Bodoni Moda` | High-fashion editorial headlines and brand wordmark |
| **Body Font** | `Hanken Grotesk` / Sans | Legible, elegant, high-clarity typography |

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    Client["Client Browser / Mobile PWA"]
    
    subgraph NextServer["Next.js 15 App Router"]
        MW["Edge Middleware\n(Rate Limiting & Staff RBAC)"]
        Pages["Server & Client Components\n(/, /account, /admin, /checkout)"]
        APIs["API Routes\n(/api/products, /api/checkout, /api/auth)"]
    end
    
    subgraph Services["Core Backend Services"]
        InvService["Inventory Reservation Engine\n(10-min Atomic Hold)"]
        AuthService["Auth & RBAC Handler\n(JWT + Jose)"]
        StripeService["Stripe Payment Gateway\n(Sessions & Webhooks)"]
    end
    
    subgraph Storage["Data & Cache Tier"]
        PG[("PostgreSQL 16 (Prisma)\nProducts, Orders, Users, Inventory")]
        RD[("Redis 7 Cache\nRate Limits & Active Holds")]
    end
    
    Client -->|HTTPS Request| MW
    MW --> Pages
    MW --> APIs
    APIs --> InvService
    APIs --> AuthService
    APIs --> StripeService
    InvService <-->|Atomic Transaction| PG
    InvService <-->|Fast TTL Lock| RD
    StripeService -->|Webhook Callback| APIs
```

---

## 📂 Project Structure

```text
aura_apparel/
├── .agents/                 # AI Agent workflows & skills
├── app/                     # Next.js 15 App Router pages & API routes
│   ├── account/             # Customer profile & bespoke measurements
│   ├── admin/               # Administrative panel & login
│   ├── atelier-admin/       # Atelier staff portal
│   ├── api/                 # REST endpoints
│   │   ├── admin/           # Inventory management
│   │   ├── auth/            # Login, logout, session verification
│   │   ├── checkout/        # Stripe session creation & holds
│   │   ├── health/          # System health check
│   │   ├── og/              # Dynamic OpenGraph cards
│   │   ├── orders/          # Customer order queries
│   │   ├── products/        # Product catalog & inventory queries
│   │   ├── search/          # Debounced live search
│   │   ├── telemetry/       # Web Vitals reporting
│   │   └── webhooks/        # Stripe payment webhooks
│   ├── checkout/            # Checkout & success views
│   ├── globals.css          # Tailwind CSS v4 styling & tokens
│   ├── layout.tsx           # Global root layout
│   └── page.tsx             # Main storefront page
├── components/              # Shared high-level components
│   └── StorefrontClient.tsx # Client-side storefront orchestrator
├── info/                    # 📚 IN-DEPTH PROJECT DOCUMENTATION
│   ├── README.md            # Documentation Index
│   ├── architecture.md      # Architecture, state flows, edge guard
│   ├── features.md          # Comprehensive feature breakdown
│   ├── database.md          # Database schema, models & ERD
│   ├── api.md               # Complete REST API specifications
│   ├── design-system.md     # Design tokens, typography & CSS specs
│   └── setup-guide.md       # Full setup, Docker, and deployment guide
├── lib/                     # Server-side business logic & utilities
│   ├── auth.ts              # JWT verification & RBAC helpers
│   ├── inventory-reservation.ts # Dual-engine atomic inventory hold
│   ├── prisma.ts            # Prisma client singleton
│   ├── redis.ts             # Redis connection manager
│   ├── search.ts            # Fuzzy & exact catalog search
│   └── stripe.ts            # Stripe SDK initialization
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma        # Multi-model relational schema
│   └── seed.ts              # Seeding script for luxury apparel items
├── src/                     # React components, tests, and mock data
│   ├── components/          # Modular UI components (catalog, cart, modal, etc.)
│   ├── context/             # React Context (Cart, Search, Auth)
│   ├── data/                # Initial catalog seeds & lookbook data
│   └── tests/               # Comprehensive Vitest test suites
├── docker-compose.yml       # Local PostgreSQL + Redis containers
├── middleware.ts            # Edge rate limiting & staff route guards
├── package.json             # Project dependencies & scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` recommended
- **npm** or **pnpm**
- **Docker & Docker Compose** (for running local PostgreSQL and Redis)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/aura_apparel.git
cd aura_apparel
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Update database credentials and Stripe keys if using live test keys)*

### 5. Spin Up Database & Cache Containers
```bash
docker compose up -d
```
This starts:
- **PostgreSQL 16** on port `5432` (`aura_apparel_db`)
- **Redis 7** on port `6379`

### 6. Synchronize Database & Seed Catalog
```bash
# Push Prisma schema to PostgreSQL
npm run db:push

# Seed the luxury product catalog
npm run db:seed
```

### 7. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Key variables defined in `.env.example`:

```ini
# PostgreSQL Connection String (Prisma)
DATABASE_URL="postgresql://aura_user:aura_password@localhost:5432/aura_apparel_db?schema=public"

# Redis Connection String
REDIS_URL="redis://localhost:6379"

# Next.js App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth / JWT Secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="aura_super_secret_development_key_change_in_production_32b"

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_sample"
STRIPE_SECRET_KEY="sk_test_sample"
STRIPE_WEBHOOK_SECRET="whsec_sample"

# Media Optimization (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server on port 3000 |
| `npm run build` | Compiles optimized production bundle |
| `npm run start` | Boots the Next.js production server |
| `npm run db:push` | Synchronizes Prisma schema directly with the database |
| `npm run db:generate` | Generates latest Prisma Client types |
| `npm run db:seed` | Populates database with luxury products and inventory |
| `npm run test` | Executes all Vitest unit and integration test suites |
| `npm run test:watch` | Runs test runner in interactive watch mode |
| `npm run vite:dev` | Runs Vite development server for standalone component sandbox |

---

## 🌐 API Overview

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | Public | Returns catalog with categories, badges, and stock |
| `/api/search` | `GET` | Public | Debounced search across title, description & SKU |
| `/api/checkout/session` | `POST` | Public / Customer | Creates Stripe checkout session & 10-min stock hold |
| `/api/webhooks/stripe` | `POST` | Stripe | Webhook handler confirming orders & committing holds |
| `/api/orders` | `GET` | Customer | Retrieves order history for authenticated customer |
| `/api/auth/login` | `POST` | Public | Authenticates customer or staff member |
| `/api/auth/me` | `GET` | Authenticated | Returns current session user & role permissions |
| `/api/admin/inventory` | `GET, PATCH` | Staff | View and adjust stock quantities per SKU |
| `/api/telemetry/vitals` | `POST` | Public | Receives Core Web Vitals telemetry |
| `/api/health` | `GET` | Public | Healthcheck for DB, Redis, and API status |

---

## 📚 In-Depth Documentation (`/info`)

Explore our dedicated technical documentation folder for detailed breakdowns:

- 🏛️ [**Architecture & System Design**](info/architecture.md) — Next.js 15 hybrid setup, data pipelines, Redis inventory locks, and security boundaries.
- 🛍️ [**Features & Modules**](info/features.md) — Granular breakdown of the storefront, cart, 3D visualizer, checkout, and admin tools.
- 🗄️ [**Database & Data Modeling**](info/database.md) — Comprehensive Prisma schema, relationships, indexes, and stock hold state machine.
- 🔌 [**API Documentation**](info/api.md) — Complete REST route documentation with payload schemas, query parameters, and response examples.
- 🎨 [**Design System & Style Guide**](info/design-system.md) — Minimalist philosophy, typography hierarchy, colors, spacing tokens, and component guidelines.
- 🚀 [**Setup & Deployment Guide**](info/setup-guide.md) — Full local setup, Docker Compose instructions, troubleshooting, and production deployment checklists.

---

## 🧪 Testing & Quality Assurance

The codebase includes an extensive automated test suite powered by **Vitest**:

```bash
# Run full test suite
npm run test
```

Included test suites:
- **Milestone 1:** Shell, navigation, typography, and responsive layouts
- **Milestone 2:** Product catalog filtering, category switches, and badges
- **Milestone 3:** Product detail modal, image carousels, and variant pickers
- **Milestone 4:** Cart drawer operations, quantity adjustments, and subtotal calculations
- **Milestone 5:** End-to-end shopping journeys from browse to checkout
- **Milestone 6:** Authentication & Role-Based Access Control (RBAC)
- **Milestone 7:** Atomic inventory reservations and concurrent hold validation
- **Milestone 8:** Real-time search discovery and facet filtering
- **Milestone 9:** Edge performance, rate limiting, and telemetry
- **Milestone 10:** Admin lockout defense and security controls
- **Adversarial & Stress Tests:** Fuzzing and high-concurrency cart hold simulations

---

## 📄 License

This project is licensed under the **MIT License**.
