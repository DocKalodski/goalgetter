# GoalGetter App — Deployment Guide

## Prerequisites

- Node.js 22+ and npm 11+
- Turso CLI (for database management)
- Vercel CLI (recommended) or any Node.js hosting platform

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | Turso (libSQL) via Drizzle ORM |
| Auth | bcrypt (cost=12) + JWT (jose, HS256) |
| Validation | Zod + react-hook-form |

## Quick Start (Vercel — Recommended)

### 1. Set Up Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create goalgetterapp-staging

# Get connection URL
turso db show goalgetterapp-staging --url

# Create auth token
turso db tokens create goalgetterapp-staging
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add DATABASE_AUTH_TOKEN
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

### 3. Push Database Schema

```bash
# Push schema to Turso
DATABASE_URL=<turso-url> DATABASE_AUTH_TOKEN=<token> npx drizzle-kit push
```

### 4. Seed Database (Optional)

```bash
# Seed with demo data (development/staging only)
DATABASE_URL=<turso-url> DATABASE_AUTH_TOKEN=<token> npx tsx src/lib/db/seed.ts
```

## Manual Deployment (Any Node.js Host)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.staging.example .env
# Edit .env with your values
```

### 3. Build

```bash
npm run build
```

### 4. Push Schema & Seed

```bash
npx drizzle-kit push
npx tsx src/lib/db/seed.ts  # Optional: demo data
```

### 5. Start

```bash
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | Turso connection URL (libsql://...) or local (file:./local.db) |
| DATABASE_AUTH_TOKEN | Turso only | Turso database auth token |
| JWT_SECRET | Yes | JWT signing key (>= 32 characters) |
| NEXT_PUBLIC_APP_URL | Yes | Public URL of the application |
| NODE_ENV | Yes | Set to "production" for staging/production |

## Database Management

### Push Schema Changes

```bash
npx drizzle-kit push
```

### View Database (Drizzle Studio)

```bash
npx drizzle-kit studio
```

## Rollback Procedure

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

### Manual

```bash
# Revert to previous commit
git checkout HEAD~1

# Rebuild and restart
npm run build
npm start
```

## Default Credentials (Staging/Demo)

| Email | Password | Role |
|-------|----------|------|
| louie@leap.com | password123 | Head Coach |
| kalod@leap.com | password123 | Coach (KINDER council) |
| rj@leap.com | password123 | Coach (MARY-G council) |
| jp@leap.com | password123 | Coach (The Magnificents) |

> Change these immediately in production environments.

## Health Verification

After deployment, verify:

```bash
# Root should redirect to /login
curl -I https://your-domain.com/

# Login page should return 200
curl -I https://your-domain.com/login

# Security headers should be present
curl -I https://your-domain.com/login | grep -i "x-frame-options"
```
