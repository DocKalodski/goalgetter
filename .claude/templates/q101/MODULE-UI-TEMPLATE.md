# Module UI Template Guide

This guide explains how to create consistent UIs across all modules by using **Module 1 (Researcher)** as the reference implementation.

**Version:** 1.0
**Last Updated:** 2025-12-05
**Reference Module:** `tiktok-vid-1-researcher/src/ui/`

---

## Overview

All modules share common UI patterns:
- **Dashboard** - Job list with status, filters, and quick actions
- **Job Detail** - View job progress, outputs, and related items
- **Item Detail** - View individual items (videos, clips, campaigns, etc.)
- **Task Status** - Real-time task/job progress monitoring

Instead of building from scratch, **copy the working UI from Module 1** and adapt it for each new module.

---

## Reference Implementation: Module 1 Researcher

```
tiktok-vid-1-researcher/src/ui/
├── src/
│   ├── api/
│   │   └── client.ts           ← API client (adapt endpoints)
│   ├── components/
│   │   ├── Layout.tsx          ← REUSE: Sidebar + main content
│   │   ├── Modal.tsx           ← REUSE: Generic modal
│   │   ├── StatusBadge.tsx     ← REUSE: Status indicators
│   │   ├── Toast.tsx           ← REUSE: Notifications
│   │   └── index.ts
│   ├── pages/
│   │   ├── Dashboard.tsx       ← ADAPT: Job list view
│   │   ├── JobDetail.tsx       ← ADAPT: Job detail view
│   │   ├── VideoDetail.tsx     ← ADAPT: Item detail (rename per module)
│   │   ├── TaskStatus.tsx      ← REUSE: Task progress
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts            ← ADAPT: Module-specific types
│   ├── App.tsx                 ← ADAPT: Routes
│   ├── main.tsx                ← REUSE: Entry point
│   └── index.css               ← REUSE: Shared styles (already migrated)
├── index.html                  ← ADAPT: Title only
├── package.json                ← ADAPT: Name and dependencies
├── vite.config.ts              ← ADAPT: Port numbers
├── tailwind.config.cjs         ← REUSE: Shared preset
├── postcss.config.cjs          ← REUSE: As-is
└── tsconfig.json               ← REUSE: As-is
```

---

## Step-by-Step: Creating a New Module UI

### Step 1: Copy the Reference UI

```bash
# From the ChristyNg root folder
cp -r tiktok-vid-1-researcher/src/ui tiktok-vid-{N}-{name}/src/ui
```

### Step 2: Update package.json

Change the package name:

```json
{
  "name": "tiktok-vid-{N}-{name}-ui",
  ...
}
```

### Step 3: Update vite.config.ts

Update ports per PORTS.md:

```typescript
// Module N: {Name} - See ../../../PORTS.md for port allocation guide
export default defineConfig({
  server: {
    port: 400{N},      // Frontend port
    proxy: {
      '/api': {
        target: 'http://localhost:500{N}',  // Backend port
        changeOrigin: true,
      },
    },
  },
})
```

### Step 4: Update index.html

Change the title:

```html
<title>ChristyNg - {Module Name}</title>
```

### Step 5: Adapt Types (src/types/index.ts)

Rename types to match module concepts:

| Module | Job Type | Item Type | Output Type |
|--------|----------|-----------|-------------|
| 1. Researcher | `Job` | `Video` | `Analysis` |
| 2. Clipper | `ClipJob` | `Clip` | `ViralityScore` |
| 3. Generator | `GeneratorJob` | `Campaign` | `GeneratedVideo` |
| 4. Reviewer | `ReviewJob` | `ClipReview` | `Rating` |
| 5. Scheduler | `ScheduleJob` | `ScheduledPost` | `Schedule` |
| 6. Publisher | `PublishJob` | `Publication` | `PostResult` |
| 7. Monetizer | `MonetizeJob` | `Sale` | `Attribution` |
| 8. Evaluator | `EvalJob` | `Performance` | `Insight` |

### Step 6: Adapt API Client (src/api/client.ts)

Update endpoints for the module:

```typescript
const API_BASE = '/api/v1';

// Researcher endpoints
export const api = {
  // Jobs
  getJobs: () => fetch(`${API_BASE}/jobs`),
  getJob: (id: string) => fetch(`${API_BASE}/jobs/${id}`),
  createJob: (data: CreateJobRequest) => fetch(`${API_BASE}/jobs`, { method: 'POST', body: JSON.stringify(data) }),

  // Module-specific items (rename per module)
  getVideos: (jobId: string) => fetch(`${API_BASE}/jobs/${jobId}/videos`),
  getVideo: (id: string) => fetch(`${API_BASE}/videos/${id}`),

  // ... etc
};
```

### Step 7: Adapt Pages

#### Dashboard.tsx
- Update column headers for module items
- Update status filters if different
- Update create job form fields

#### JobDetail.tsx
- Rename "Videos" to module-specific items (Clips, Campaigns, etc.)
- Update the item list display
- Update job status progression

#### ItemDetail.tsx (rename from VideoDetail.tsx)
- Rename file to match module: `ClipDetail.tsx`, `CampaignDetail.tsx`, etc.
- Update fields displayed
- Update related data sections

### Step 8: Update App.tsx Routes

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="jobs/:jobId" element={<JobDetail />} />
    <Route path="{items}/:itemId" element={<ItemDetail />} />  {/* videos, clips, etc */}
    <Route path="tasks/:taskId" element={<TaskStatus />} />
  </Route>
</Routes>
```

### Step 9: Update Layout.tsx Sidebar

Update navigation items for the module:

```tsx
const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/{items}', icon: ModuleIcon, label: '{Items}' },  // Videos, Clips, etc.
];
```

---

## Common Components (Reuse As-Is)

These components work across all modules without changes:

| Component | Purpose |
|-----------|---------|
| `Modal.tsx` | Generic modal dialog |
| `Toast.tsx` | Notification toasts |
| `StatusBadge.tsx` | Job/task status indicators |
| `TaskStatus.tsx` | Task progress monitoring |

---

## Module-Specific Customizations

### Module 2: Clipper
- Add timeline/scene preview component
- Add virality score visualization
- Add audience persona tags

### Module 3: Generator
- Add campaign editor
- Add caption/overlay editor
- Add video preview with overlays

### Module 4: Reviewer
- Add rating interface
- Add comparison view (before/after)
- Add approval workflow buttons

### Module 5: Scheduler
- Add calendar view
- Add drag-and-drop scheduling
- Add posting queue

### Module 6: Publisher
- Add platform account connections
- Add cross-post configuration
- Add publish status grid

### Module 7: Monetizer
- Add metrics dashboard
- Add sales attribution charts
- Add retargeting recommendations

### Module 8: Evaluator
- Add performance analytics
- Add A/B test results
- Add recommendation cards

---

## Checklist for New Module UI

```markdown
## Module {N} UI Setup Checklist

### Initial Setup
- [ ] Copy `tiktok-vid-1-researcher/src/ui` to module folder
- [ ] Update `package.json` name
- [ ] Update `vite.config.ts` ports (400N, 500N)
- [ ] Update `index.html` title
- [ ] Run `npm install` from root

### Type Definitions
- [ ] Rename types in `src/types/index.ts`
- [ ] Define module-specific interfaces
- [ ] Update API response types

### API Client
- [ ] Update endpoint paths in `src/api/client.ts`
- [ ] Add module-specific API methods
- [ ] Test API connectivity

### Pages
- [ ] Adapt `Dashboard.tsx` for module items
- [ ] Adapt `JobDetail.tsx` for module workflow
- [ ] Rename and adapt `VideoDetail.tsx` → `{Item}Detail.tsx`
- [ ] Update routes in `App.tsx`

### Components
- [ ] Update `Layout.tsx` sidebar navigation
- [ ] Add module-specific components if needed
- [ ] Ensure StatusBadge covers all module statuses

### Testing
- [ ] Verify dashboard loads
- [ ] Verify job creation works
- [ ] Verify item detail pages work
- [ ] Verify task status updates
- [ ] Test with backend API

### Final
- [ ] UI matches launchpad design
- [ ] All shared styles working
- [ ] No console errors
- [ ] Build passes: `npm run build`
```

---

## Shared Styles Reference

All modules use the same Tailwind classes from `@christyng/ui-shared`:

```css
/* Backgrounds */
bg-bg-primary, bg-bg-secondary, bg-bg-tertiary

/* Text */
text-text-primary, text-text-secondary, text-text-muted

/* Borders */
border-border-subtle, border-border-medium

/* Status Colors */
text-success, text-warning, text-error, text-info

/* Module Accent (use your module's color) */
bg-module-researcher   /* #4A88E8 - Blue */
bg-module-clipper      /* #9B7AE8 - Purple */
bg-module-generator    /* #E87AA8 - Rose */
bg-module-reviewer     /* #E0A94C - Gold */
bg-module-scheduler    /* #3BAF7A - Green */
bg-module-publisher    /* #E88A4A - Orange */
bg-module-monetizer    /* #D4AF37 - Gold */
bg-module-evaluator    /* #4AB8B8 - Teal */

/* Component Classes */
.card, .card-hover
.btn, .btn-primary, .btn-secondary, .btn-ghost, .btn-danger
.badge-pending, .badge-processing, .badge-completed, .badge-failed
.input, .label
.nav-item, .nav-item-active
```

---

## Claude Code Session Guide

Each module's `CLAUDE.md` file contains a **UI Development Instructions** section that explicitly tells Claude Code which guides to follow when working at the module folder level.

### Why This Matters

When you start a Claude Code session in a module folder (e.g., `cd tiktok-vid-3-generator && claude`), Claude Code reads that module's `CLAUDE.md`. The UI Development Instructions section ensures Claude:

1. **Knows which shared guides to reference** (UI-DESIGN-GUIDE.md, MODULE-UI-TEMPLATE.md)
2. **Uses the correct module accent color** (each module has a unique color)
3. **Copies from Module 1** instead of building from scratch
4. **Uses the shared UI package** (@christyng/ui-shared)

### UI Development Instructions Template

Each module's CLAUDE.md should include this section:

```markdown
### UI Development Instructions

**IMPORTANT:** When building or modifying this module's UI, you MUST follow these guides:

| Guide | Purpose | Location |
|-------|---------|----------|
| **UI Design Guide** | Colors, typography, component styles | [../UI-DESIGN-GUIDE.md](../UI-DESIGN-GUIDE.md) |
| **Module UI Template** | Copy & adapt pattern from Module 1 | [../MODULE-UI-TEMPLATE.md](../MODULE-UI-TEMPLATE.md) |
| **Shared UI Package** | Reusable components & Tailwind preset | [../packages/ui-shared/README.md](../packages/ui-shared/README.md) |
| **Reference Implementation** | Working UI template | `../tiktok-vid-1-researcher/src/ui/` |

**Key Requirements:**
1. Use `@christyng/ui-shared` package for shared components and Tailwind preset
2. Follow the color tokens: `bg-bg-primary`, `text-text-primary`, `bg-module-{name}` (module color)
3. Copy page structures from Module 1 (Dashboard, JobDetail, VideoDetail → {ModuleItem}Detail)
4. Maintain consistent navigation patterns with sidebar layout
5. Use StatusBadge for job/task status indicators
6. All component styles use the shared Tailwind classes (see UI-DESIGN-GUIDE.md)
7. Add module-specific components: {list components per module wireframes}
```

### Prompting Claude Code at Module Level

When working in a module session, you can simply ask Claude Code to build or modify the UI:

**Good prompts:**
- "Build the Dashboard page following the UI guides"
- "Create the job detail page using the Module 1 template"
- "Add a calendar component for scheduling"

Claude Code will automatically:
1. Read the module's CLAUDE.md
2. Follow the referenced guides via the relative paths
3. Use the correct port configuration
4. Apply the module's accent color

See [CLAUDE-SESSIONS.md](CLAUDE-SESSIONS.md) for more details on session strategy.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [packages/ui-shared/README.md](packages/ui-shared/README.md) | Shared components and styles |
| [UI-DESIGN-GUIDE.md](UI-DESIGN-GUIDE.md) | Visual design standards |
| [PORTS.md](PORTS.md) | Port assignments |
| [TECH-STACK.md](TECH-STACK.md) | Required technologies |
| [CLAUDE-SESSIONS.md](CLAUDE-SESSIONS.md) | Root vs module session strategy |

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-05 | Claude | Initial template guide |
| 1.1 | 2025-12-07 | Claude | Added Claude Code Session Guide section |
