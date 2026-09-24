# Aura Apparel — Technical Documentation Index

Welcome to the internal technical documentation repository for **Aura Apparel**, a modern luxury minimalist e-commerce platform built with Next.js 15, React 19, TypeScript, PostgreSQL, Prisma, Redis, and Stripe.

This directory (`/info`) contains comprehensive, deep-dive specifications for developers, designers, and system administrators working on or reviewing the platform.

---

## 📑 Documentation Modules

| Document | Description | Key Topics |
| :--- | :--- | :--- |
| [**1. Architecture & System Design**](./architecture.md) | High-level system topology and runtime boundaries | Next.js 15 App Router, Edge Middleware, Redis Distributed Locks, State Flow |
| [**2. Features & Modules**](./features.md) | Granular breakdown of all storefront and administrative features | Editorial Hero, Multi-variant Catalog, Cart Drawer, 3D Canvas, Atelier Admin |
| [**3. Database & Data Modeling**](./database.md) | PostgreSQL schema details and relational design | Prisma models, ER diagram, Indexes, Stock hold state machine |
| [**4. API Reference**](./api.md) | Complete REST API contract and endpoint specifications | Auth endpoints, Checkout sessions, Stripe Webhooks, Inventory management |
| [**5. Luxury Design System**](./design-system.md) | Brand aesthetics, tokens, and UI guidelines | Obsidian & Pale Gold tokens, Bodoni Moda display typography, 0px border rule |
| [**6. Setup & Deployment Guide**](./setup-guide.md) | Step-by-step developer onboarding and deployment guide | Docker Compose, PostgreSQL & Redis setup, Prisma migration, Production checklist |

---

## 🏛️ Quick Tech Stack Reference

- **Frontend:** Next.js 15.2 (App Router), React 19, TypeScript 5.7, Tailwind CSS v4, Lucide Icons, Three.js
- **Backend:** Next.js API Routes, JOSE (JWT auth), BcryptJS, Stripe SDK v22
- **Data & Caching:** PostgreSQL 16, Prisma ORM 6.4, Redis 7 (`ioredis`)
- **Testing:** Vitest 3.0, React Testing Library, JSDOM
- **Infra:** Docker Compose, Vercel / Node runtime ready

---

## 🔍 How to Use This Documentation

- **For New Developers:** Begin with the [Setup Guide](./setup-guide.md) to initialize your local environment with Docker and Prisma, then review the [Architecture Overview](./architecture.md).
- **For Backend Engineers:** Refer to [Database & Data Modeling](./database.md) and [API Reference](./api.md) for data flow and transaction mechanics.
- **For Frontend & UI Designers:** Consult the [Luxury Design System](./design-system.md) and [Features & Modules](./features.md) for styling tokens, typography pairings, and layout conventions.
