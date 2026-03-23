# GoalGetter App — Production Checklist

## Pre-Deployment

- [ ] All tests passing (16/16 Vitest, 0 failures)
- [ ] TypeScript compilation clean (tsc --noEmit, 0 errors)
- [ ] Security score >= 80 (current: 93/100)
- [ ] No CRITICAL or HIGH security issues
- [ ] Environment variables configured
- [ ] Turso database created and schema pushed
- [ ] JWT_SECRET generated (>= 32 characters)
- [ ] Default seed passwords changed
- [ ] NODE_ENV set to "production"
- [ ] Team notified of deployment

## Deployment

- [ ] Deploy application (Vercel / hosting platform)
- [ ] Push database schema (drizzle-kit push)
- [ ] Seed database (if fresh deployment)
- [ ] Verify root URL redirects to /login
- [ ] Verify /login page loads (HTTP 200)
- [ ] Verify security headers present (5/5)
- [ ] Test login flow (email + password)
- [ ] Test role-based routing (HC→/l1, Coach→/l2, Student→/l3)
- [ ] Test logout clears session

## Post-Deployment

- [ ] Monitor for errors (15 minutes)
- [ ] Verify all dashboard levels load (L1, L2, L3)
- [ ] Test goal creation flow
- [ ] Test attendance recording
- [ ] Test milestone tracking
- [ ] Confirm API responses are timely
- [ ] Notify team of successful deployment

## Rollback Triggers

Initiate rollback if:
- Login flow broken
- Database connection failures
- Error rate > 5% for 5 minutes
- Security headers missing
- JWT verification failing
