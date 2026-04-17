# LoginForm UI V2: 11-Button Demo Login

**Date:** April 13, 2026
**Status:** ✅ Complete and Live
**URL:** http://localhost:3000/login

## Layout

```
┌─────────────────────────────────┐
│      GoalGetter                 │
│   LEAP 99 Goal Tracking         │
│   by Doc Kalodski               │
├─────────────────────────────────┤
│   Sign in to your account       │
│                                 │
│  [HC view]                      │ (indigo)
│                                 │
│  COACH IYA (KINDER)             │
│  [Demo Coach Iya view]          │ (blue)
│  [Student 1A] [Student 1B]      │ (cyan)
│  [Student 1C] [Student 1D]      │ (cyan)
│                                 │
│  COACH RJ (MARY-G)              │
│  [Demo Coach RJ view]           │ (green)
│  [Student 2A] [Student 2B]      │ (emerald)
│  [Student 2C] [Student 2D]      │ (emerald)
│                                 │
│  Demo mode — all goals from APA │
└─────────────────────────────────┘
```

## Files Modified

- `src/components/forms/LoginForm.tsx` — 11 buttons with color coding
- `src/lib/actions/auth.ts` — devLoginAction + devLogin updated (11 passcodes)
- `src/lib/db/seed-demo-accounts.ts` — Database seed script (11 users + goals)

## Passcode Mapping

| Button | Passcode | Role | Council |
|--------|----------|------|---------|
| HC view | HC | head_coach | — |
| Demo Coach Iya | COACH_IYA | coach | Kinder |
| Student 1a-1d | STUDENT_1A-1D | student | Kinder |
| Demo Coach RJ | COACH_RJ | coach | Mary-g |
| Student 2a-2d | STUDENT_2A-2D | student | Mary-g |

## Goal Sets

Each student has 3 real goals from APA template:
- **Enrollment** (FLEX course completion, ALC participation, intensive attendance)
- **Personal** (fitness, mindfulness, work-life balance)
- **Professional** (mentoring, project leadership, peer feedback)

3 goal templates cycle across 8 students for variety.

## Next Step: Seed Database

When DATABASE_URL is available:
```bash
DATABASE_URL="..." DATABASE_AUTH_TOKEN="..." npx tsx src/lib/db/seed-demo-accounts.ts
```

Then buttons will load real user accounts + goals.

## Visual State

✅ All 11 buttons render correctly
✅ Color-coded by role (HC indigo, coaches blue/green, students cyan/emerald)
✅ Organized in sections (Coach Iya + 4 students, Coach RJ + 4 students)
✅ Grid layout for student buttons (2x2 per coach)
✅ Proper Tailwind styling applied
