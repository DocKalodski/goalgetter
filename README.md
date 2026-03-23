# GoalGetter - LEAP Goal Tracking Application

A comprehensive goal tracking and progress management system for the Leadership Excellence Achievement Program (LEAP). Built with Next.js 15, Turso, and shadcn/ui.

## Features

- **S.M.A.R.T.e.r. Goal Framework** - Structured goal-setting with 7 criteria
- **4-Tier Role Hierarchy** - Head Coach > Coach > Council Leader > Student
- **3-Level Navigation** - Batch Overview (L1) > Council Detail (L2) > Student Detail (L3)
- **12-Week Milestone Tracking** - Weekly progress with action items and results
- **Attendance Tracking** - Meetings, coaching calls, intensives, workshops
- **Offline-First PWA** - Service Workers + IndexedDB for offline updates
- **Dark Mode** - Full theme support with toggle
- **Export & Reporting** - PDF/CSV exports at all levels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js Server Actions, Drizzle ORM |
| Database | Turso (hosted SQLite/libSQL) |
| Auth | bcrypt + jose JWT (HttpOnly cookies) |
| State | TanStack Query, React Hook Form + Zod |
| Charts | Recharts |
| Testing | Vitest |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd goal-getter-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your settings
# - DATABASE_URL=file:./local.db (for local dev)
# - JWT_SECRET=<generate with: openssl rand -base64 32>
# - NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Quick Setup (Recommended)

```bash
# One command: install deps, push schema, seed data
npm run setup
```

### Database Setup (Manual)

```bash
# Push schema to database
npm run db:push

# Seed with sample data (19 students, 3 councils)
npm run db:seed

# OR combined:
npm run db:setup

# OR via API (auto-creates schema if needed):
curl -X POST http://localhost:3000/api/seed
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Head Coach | louie@leap.com | password123 |
| Student | elaine@leap.com | password123 |
| Student | kalod@leap.com | password123 |

All users share the default password: `password123`

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Project Structure

```
goal-getter-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/login/       # Login page
│   │   ├── (dashboard)/        # Dashboard pages (L1, L2, L3)
│   │   └── api/                # API routes (auth, seed, export)
│   ├── components/
│   │   ├── dashboard/          # L1, L2, L3 view components
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Shell, sidebar, header
│   │   └── providers/          # Theme provider
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── actions/            # Server actions (goals, attendance, etc.)
│   │   ├── auth/               # Auth utilities (password, JWT)
│   │   ├── db/                 # Database schema, client, seed
│   │   └── offline/            # IndexedDB, sync utilities
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets, SW, manifest
├── tests/                      # Vitest test files
├── docs/                       # Design documents
├── PRD.md                      # Product Requirements Document
└── PRP.md                      # Product Requirements Prompt
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` = Turso database URL
   - `DATABASE_AUTH_TOKEN` = Turso auth token
   - `JWT_SECRET` = Production secret (min 32 chars)
   - `NEXT_PUBLIC_APP_URL` = Your Vercel URL
4. Deploy

### Turso Setup

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create goalgetter

# Get connection URL
turso db show goalgetter --url

# Get auth token
turso db tokens create goalgetter
```

## User Roles

| Role | Access | Login Destination |
|------|--------|-------------------|
| Head Coach | L1, L2, L3 | Batch Overview (L1) |
| Coach | L2, L3 | Council Detail (L2) |
| Council Leader | L3 | Student Detail (L3) |
| Student | L3 | Student Detail (L3) |

## License

Private - LEAP Program Internal Use
