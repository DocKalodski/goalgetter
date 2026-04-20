# GoalGetter v3.25 on GitHub Codespaces

**Backup Cloud Deployment** — Syncs to same Turso database as Vercel primary

## Quick Start (2 min)

### 1. Create Codespace
1. Go to: https://github.com/DocKalodski/goalgetter
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait ~2 min for environment to load

### 2. Setup Environment
```bash
# Run setup script
bash .devcontainer/setup-codespace.sh
```

This creates `.env.local` with Turso credentials (already baked in).

### 3. Start Server
```bash
npm run dev
```

Codespace will auto-forward port 3000. Click the forwarded URL.

### 4. Login
- **Email:** `louie@leap99.com` (or just `louie`)
- **Password:** `louie-99`

Should show: **Team Summary with 17 councils + 102 students**

---

## URLs (Once Running)

| Environment | URL | Database |
|---|---|---|
| **Codespaces** | `https://[codespace-id].app.github.dev` | Turso (shared) |
| **Vercel** | https://goalgetter-leap99.vercel.app | Turso (shared) |
| **Localhost** | http://localhost:3000 | local.db (dev only) |

Both Codespaces + Vercel sync to the same Turso database, so users/data are consistent.

---

## Credentials

**Turso Database:**
```
URL: libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io
Token: [baked into .env.local]
```

**Sample Users:**
- Head Coach: `louie` / `louie-99`
- Admin: `kalod` / `kalod-99`
- Coach: `iya` / `iya-99` (+ 16 more)
- Facilitators: `benjie` / `benjie-99` (+ 9 more)
- Students: `roycestudent1` / `roycestudent1-99` (+ 101 more)

---

## Troubleshooting

**Port forwarding not showing?**
- Click **Ports** tab at bottom, should see 3000 → open browser

**npm install fails?**
- Run: `npm cache clean --force` then `npm install`

**Login still fails?**
- Hard refresh: Ctrl+Shift+R
- Check console (F12) for errors

---

## Keep It Running

Codespaces auto-suspend after 30 min of inactivity. To keep it always on:
1. Codespaces settings: Set idle timeout to max (60 min)
2. Or keep browser tab active

---

## Next Steps

Once Codespaces is live:
- Test all logins (HC, coach, student, facilitator)
- Verify HC view shows 17 councils
- Monitor for any Turso connection issues
- Feedback goes to working copy → reseed both Turso + local.db

---

**Status:** ✅ Ready for deployment  
**Last Updated:** Apr 20, 2026
