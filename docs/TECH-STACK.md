# GoalGetter Technology Stack

**Project:** GoalGetter - LEAP Goal Tracking Application
**Type:** Web Application + Progressive Web App (PWA)
**Last Updated:** 2026-03-07


## Architecture Overview

```
+------------------------------------------------------------------+
|                        CLIENT (Browser / PWA)                     |
|                                                                   |
|  +-------------------+  +------------------+  +----------------+ |
|  | Next.js 15        |  | TanStack Query   |  | Service Worker | |
|  | App Router (RSC)  |  | (Server State)   |  | (Serwist)      | |
|  +-------------------+  +------------------+  +----------------+ |
|  | React Hook Form   |  | Recharts         |  | IndexedDB      | |
|  | + Zod Validation  |  | (Visualizations) |  | (Offline Data) | |
|  +-------------------+  +------------------+  +----------------+ |
|  |            Tailwind CSS 4 + shadcn/ui Components             | |
|  +--------------------------------------------------------------+ |
+----------------------------------+-------------------------------+
                                   |
                            HTTPS / Fetch
                                   |
+----------------------------------v-------------------------------+
|                     SERVER (Next.js 15 on Vercel)                |
|                                                                   |
|  +-------------------+  +------------------+  +----------------+ |
|  | Server Actions    |  | API Routes       |  | Middleware      | |
|  | (Mutations)       |  | (REST endpoints) |  | (JWT via jose) | |
|  +-------------------+  +------------------+  +----------------+ |
|  |              Drizzle ORM (libSQL / SQLite dialect)           | |
|  +--------------------------------------------------------------+ |
+----------------------------------+-------------------------------+
                                   |
                            libSQL Protocol
                                   |
+----------------------------------v-------------------------------+
|                         DATABASE                                  |
|                                                                   |
|  Production: Turso (hosted libSQL, edge-replicated)              |
|  Development: better-sqlite3 (local file: ./local.db)           |
+------------------------------------------------------------------+

+------------------------------------------------------------------+
|                     EXTERNAL SERVICES                             |
|                                                                   |
|  Resend (transactional email, optional for MVP)                  |
|  Vercel (serverless hosting, Git auto-deploy)                    |
+------------------------------------------------------------------+
```


## Technology Choices and Rationale

### Frontend

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js** | 15.x | Full-stack React framework | App Router with React Server Components reduces client JS bundle; built-in SSR/SSG, file-based routing, and native Server Actions eliminate the need for a separate API framework |
| **TypeScript** | 5.x (strict mode) | Type safety | Catches errors at compile time; strict mode enforces exhaustive checks, no implicit any, and null safety |
| **Tailwind CSS** | 4.x | Utility-first CSS | Zero-runtime styling, tree-shakes unused classes, co-locates styles with markup, and integrates seamlessly with shadcn/ui |
| **shadcn/ui** | latest | UI component library | Copy-paste architecture means zero runtime dependencies; full customization control; built on Radix UI primitives for accessibility |
| **TanStack Query** | 5.x | Server state management | Automatic caching, background refetching, optimistic updates, and offline support; separates server state from UI state cleanly |
| **React Hook Form** | 7.x | Form handling | Uncontrolled components minimize re-renders; native integration with Zod for schema-based validation with full type inference |
| **Zod** | 3.x | Schema validation | Single source of truth for validation on both client and server; TypeScript type inference from schemas eliminates duplicate type definitions |
| **Recharts** | 2.x | Data visualization | React-native charting built on D3; declarative API matches React paradigm; supports responsive containers for mobile |
| **Serwist** | 9.x | Service Worker / PWA | Next.js-native service worker tooling; manages precaching, runtime caching strategies, and offline fallback pages |

### Backend

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js Server Actions** | 15.x | API mutations | Native Next.js RPC-style mutations; eliminates boilerplate of separate API routes for form submissions; automatic request/response handling |
| **Next.js API Routes** | 15.x | REST endpoints | Used for webhooks, external integrations, and endpoints that don't map to form actions |
| **Drizzle ORM** | 0.36.x | Database ORM | Type-safe, lightweight ORM with SQL-like syntax; first-class Turso/libSQL support; schema-as-code with zero codegen |
| **Turso** | hosted | Production database | Hosted libSQL with edge replicas; solves Vercel's ephemeral filesystem problem where local SQLite files don't persist between invocations |
| **better-sqlite3** | 11.x | Local dev database | Synchronous, fast SQLite driver for local development; no external service dependency during development |
| **bcrypt** | 5.x | Password hashing | Industry-standard adaptive hashing with 10 salt rounds; resistant to brute-force and rainbow table attacks |
| **jose** | 5.x | JWT tokens (HS256) | Edge-compatible JWT library that works in Next.js middleware (unlike jsonwebtoken which requires Node.js crypto); supports all modern runtimes |
| **Resend** | 4.x | Email notifications | Developer-friendly email API; optional for MVP; handles transactional emails for goal reminders and notifications |

### DevOps and Tooling

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Vercel** | - | Hosting platform | Native Next.js support; serverless functions with automatic scaling; Git integration for preview and production deployments |
| **Vitest** | 2.x | Testing framework | Vite-native test runner; ESM-first; compatible with Jest API; fast execution with worker threads; 80%+ coverage target |
| **ESLint** | 9.x | Code linting | Static analysis for code quality; Next.js and TypeScript rule presets catch common errors |
| **Prettier** | 3.x | Code formatting | Consistent code style across the team; eliminates formatting debates |

### Design System

| Aspect | Specification |
|--------|---------------|
| **Direction** | Vibrant Professional |
| **Primary Color** | Blue `#3b82f6` (Tailwind `blue-500`) |
| **Secondary Color** | Green `#10b981` (Tailwind `emerald-500`) |
| **Accent Color** | Purple `#8b5cf6` (Tailwind `violet-500`) |
| **Font** | Inter (sans-serif) via `next/font/google` |
| **Theme** | Dark mode with user toggle (system preference default) |
| **Desktop Layout** | Persistent sidebar navigation |
| **Mobile Layout** | Sheet drawer (slide-out) navigation |


## Decision Log

### 1. Turso over raw SQLite

**Problem:** Vercel serverless functions use an ephemeral filesystem. Any SQLite database file written during a function invocation is lost when the container is recycled.

**Decision:** Use Turso (hosted libSQL) for production, with better-sqlite3 for local development.

**Alternatives Considered:**
- PostgreSQL (Neon/Supabase) — heavier than needed for this app's data model; SQLite's simplicity is sufficient
- PlanetScale (MySQL) — discontinued free tier; MySQL dialect less convenient than SQLite for small apps
- Raw SQLite on persistent disk — requires non-serverless hosting, losing Vercel's scaling benefits

### 2. jose over jsonwebtoken

**Problem:** Next.js middleware runs in the Edge Runtime, which does not support Node.js built-in `crypto` module. The popular `jsonwebtoken` library depends on Node.js crypto and fails at the edge.

**Decision:** Use `jose` for all JWT operations (HS256 signing and verification).

**Alternatives Considered:**
- jsonwebtoken — does not work in Edge Runtime; would require splitting auth logic between middleware and API routes
- NextAuth/Auth.js — adds significant complexity for a simple email/password auth flow

### 3. Server Actions over tRPC

**Problem:** The app needs a type-safe way to handle mutations (create goal, update progress, etc.) without excessive boilerplate.

**Decision:** Use Next.js 15 Server Actions for mutations, API Routes for non-mutation endpoints.

**Alternatives Considered:**
- tRPC — adds a dependency and learning curve; Server Actions provide similar type safety natively in Next.js 15
- REST API routes only — more boilerplate for form submissions; no automatic serialization

### 4. bcrypt + Custom JWT over NextAuth

**Problem:** The app needs simple email/password authentication matching the prototype's login flow.

**Decision:** Implement custom auth with bcrypt for password hashing and jose for JWT tokens stored in HTTP-only cookies.

**Alternatives Considered:**
- NextAuth/Auth.js — designed for OAuth providers; email/password (credentials provider) is a second-class citizen with session limitations
- Clerk/Lucia — external dependencies for a simple auth requirement; Lucia is deprecated

### 5. Drizzle ORM over Prisma

**Problem:** Need a type-safe ORM that works well with Turso/libSQL and has minimal overhead.

**Decision:** Use Drizzle ORM with the libSQL dialect.

**Alternatives Considered:**
- Prisma — requires a separate codegen step; larger bundle size; Turso support is less mature
- Kysely — query builder only, no migration tooling; less ecosystem support for libSQL
- Raw SQL — no type safety; error-prone for complex queries

### 6. shadcn/ui over Material UI

**Problem:** Need a component library that is fully customizable and doesn't add runtime overhead.

**Decision:** Use shadcn/ui (copy-paste components built on Radix UI primitives).

**Alternatives Considered:**
- Material UI (MUI) — large runtime bundle; opinionated styling conflicts with Tailwind; harder to customize deeply
- Chakra UI — runtime CSS-in-JS; bundle size concerns
- Headless UI — fewer components; would need to build more from scratch


## Dependency List

### Production Dependencies

```
next                    ^15.0.0     Full-stack React framework
react                   ^19.0.0     UI library
react-dom               ^19.0.0     React DOM renderer
typescript              ^5.6.0      Type safety (also dev)

@tanstack/react-query   ^5.60.0     Server state management
react-hook-form         ^7.53.0     Form state management
zod                     ^3.23.0     Schema validation
@hookform/resolvers     ^3.9.0      Zod resolver for React Hook Form
recharts                ^2.13.0     Data visualization charts

@libsql/client          ^0.14.0     Turso/libSQL database client
drizzle-orm             ^0.36.0     Type-safe ORM
better-sqlite3          ^11.6.0     Local SQLite driver (dev database)

bcrypt                  ^5.1.0      Password hashing
jose                    ^5.9.0      JWT creation/verification (edge-compatible)

tailwindcss             ^4.0.0      Utility-first CSS framework
@tailwindcss/postcss    ^4.0.0      PostCSS plugin for Tailwind
class-variance-authority ^0.7.0     Component variant management (shadcn/ui)
clsx                    ^2.1.0      Conditional class names
tailwind-merge          ^2.5.0      Tailwind class deduplication
lucide-react            ^0.460.0    Icon library (shadcn/ui default)
@radix-ui/*             various     Accessible UI primitives (shadcn/ui)

@serwist/next           ^9.0.0      Next.js service worker integration
serwist                 ^9.0.0      Service worker runtime

resend                  ^4.0.0      Email API client (optional)
```

### Development Dependencies

```
drizzle-kit             ^0.28.0     Database migrations and studio
@types/better-sqlite3   ^7.6.0      TypeScript types for better-sqlite3
@types/bcrypt           ^5.0.0      TypeScript types for bcrypt
@types/react            ^19.0.0     TypeScript types for React
@types/react-dom        ^19.0.0     TypeScript types for React DOM

vitest                  ^2.1.0      Unit/integration test runner
@testing-library/react  ^16.0.0     React component testing utilities
@testing-library/jest-dom ^6.6.0    DOM assertion matchers

eslint                  ^9.14.0     Code linting
eslint-config-next      ^15.0.0     Next.js ESLint configuration
prettier                ^3.4.0      Code formatting
prettier-plugin-tailwindcss ^0.6.0  Tailwind class sorting
```


## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./local.db` | Turso database URL for production; local SQLite file path for development |
| `DATABASE_AUTH_TOKEN` | Prod only | - | Turso authentication token; not needed for local development |
| `JWT_SECRET` | Yes | - | Secret key for signing JWTs; minimum 32 characters; generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Public-facing application URL; used for absolute links in emails and metadata |
| `RESEND_API_KEY` | No | - | Resend API key for email notifications; optional for MVP |


## Environment Setup

### Prerequisites

- **Node.js** 20.x or later (LTS recommended)
- **npm** 10.x or later (ships with Node.js 20+)
- **Git** 2.40+

### Local Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd goal-getter-app

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your values:
#   DATABASE_URL=file:./local.db
#   JWT_SECRET=<generate-a-32-char-secret>
#   NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. Run database migrations
npx drizzle-kit push

# 5. Start development server
npm run dev
```

### Production Deployment (Vercel)

```bash
# 1. Create a Turso database
turso db create goalgetterdb
turso db show goalgetterdb --url       # Copy the URL
turso db tokens create goalgetterdb    # Copy the token

# 2. Set environment variables in Vercel dashboard:
#   DATABASE_URL        = libsql://<your-db>.turso.io
#   DATABASE_AUTH_TOKEN = <your-turso-token>
#   JWT_SECRET          = <your-production-secret>
#   NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app

# 3. Deploy via Git push (Vercel auto-deploys on push to main)
git push origin main
```


## Version Requirements Summary

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Node.js | 20.0.0 | 20.x LTS |
| npm | 10.0.0 | 10.x (bundled) |
| Next.js | 15.0.0 | 15.x latest |
| TypeScript | 5.6.0 | 5.x latest |
| React | 19.0.0 | 19.x latest |
