# GoalGetter v3.25 — Cloud Deployment Guide

## 🚀 Deploy in 5 Minutes (Free + Bombproof)

### Step 1: Create Turso Database (2 min)
1. Go to [turso.tech](https://turso.tech)
2. Sign up (free account)
3. Click **Create Database**
4. Name: `goalgetter-leap99`
5. Copy the connection string (looks like: `libsql://xxxx.turso.io?authToken=...`)

### Step 2: Deploy to Vercel (2 min)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select `goalgetter` repository
5. Click **Deploy**
6. After import, go to **Settings** → **Environment Variables**
7. Add variables (copy from below):

### Step 3: Set Environment Variables

Add these to Vercel (Settings → Environment Variables):

| Key | Value |
|---|---|
| `DATABASE_URL` | `libsql://goalgetter-leap99-[username].turso.io?authToken=[your-token]` |
| `DATABASE_AUTH_TOKEN` | `[your-auth-token]` |
| `JWT_SECRET` | `kMoA35FHod43Nb925TvO8RGCIEmk7fKiseObe8oWmCQ=` |
| `NEXT_PUBLIC_APP_URL` | (auto-filled by Vercel) |

### Step 4: Trigger Redeployment
1. Vercel → **Deployments** → **Redeploy**
2. Wait ~2 min for build
3. Open the live URL

### Step 5: Seed Cloud Database
Once deployed, hit the API to seed:
```bash
curl -X POST https://[your-vercel-url].vercel.app/api/seed
```

## 📋 Access After Deployment

**Public URL:** `https://goalgetter-[project-name].vercel.app`  
**Login:** louie / louie-5899  
**Available from:** Any device, anywhere

## 🔒 Security Notes

- JWT_SECRET is already strong
- Turso is encrypted by default
- Database backups automatic (Turso)
- No local files on server (stateless)

## 🛠️ If Something Goes Wrong

1. Check Vercel build logs (Deployments tab)
2. Verify env vars are set correctly
3. Redeploy with corrected variables
4. Seed database again if needed

## 📝 Database Reset

To reset users and reseed:
```bash
curl -X POST https://[your-vercel-url].vercel.app/api/seed
```

This will clear and recreate all 131 users.
