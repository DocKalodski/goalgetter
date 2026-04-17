# GoalGetter v1.9 — Deployment Checklist

**Before deploying to production, verify all items:**

## Code Quality
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] `npm run test` passes (all tests green)
- [ ] `npm run test:coverage` shows >80% coverage
- [ ] TypeScript: `npx tsc --noEmit` (zero errors)

## Build & Performance
- [ ] `npm run build` succeeds without warnings
- [ ] Bundle size reasonable (check `.next/static`)
- [ ] No unused dependencies (audit with `npm audit`)

## Database
- [ ] `npm run db:push` succeeds (migrations applied)
- [ ] `npm run db:seed` creates demo data correctly
- [ ] Rollback plan documented in CHANGELOG.md

## Manual Testing (Smoke Test)
- [ ] Login flow works (HC, Coach, Student)
- [ ] Dashboard loads without errors
- [ ] Goals display correctly with SMARTER fields
- [ ] Batch/council filtering works
- [ ] Export/import functionality works

## Version & Documentation
- [ ] Version bumped in `package.json`
- [ ] Version tagged in git: `git tag -a v1.X-stable`
- [ ] CHANGELOG.md updated with changes
- [ ] README.md reflects current state

## Deployment
- [ ] Backup current production
- [ ] Deploy to staging first
- [ ] Verify staging works (re-run smoke tests)
- [ ] Deploy to production
- [ ] Monitor error logs for 10 minutes
- [ ] Notify team of deployment

---
**Deployed by:** [Name]  
**Date:** [YYYY-MM-DD]  
**Commit SHA:** [hash]  
