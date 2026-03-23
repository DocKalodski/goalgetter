# GoalGetter UI Specifications

**Project:** GoalGetter - LEAP Goal Tracking Application
**Design Direction:** Vibrant Professional
**Version:** 1.0.0
**Last Updated:** 2026-03-07

---

## Table of Contents

1. [Design System Tokens](#1-design-system-tokens)
2. [Typography System](#2-typography-system)
3. [Spacing & Layout System](#3-spacing--layout-system)
4. [Component Inventory](#4-component-inventory)
5. [Page Layouts](#5-page-layouts)
6. [Responsive Breakpoints](#6-responsive-breakpoints)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Dark Mode Implementation](#9-dark-mode-implementation)
10. [Component Hierarchy](#10-component-hierarchy)

---

## 1. Design System Tokens

### 1.1 Color Palette

#### Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-primary-50` | `#eff6ff` | 239, 246, 255 | Primary tint / hover backgrounds |
| `--color-primary-100` | `#dbeafe` | 219, 234, 254 | Primary light backgrounds |
| `--color-primary-200` | `#bfdbfe` | 191, 219, 254 | Primary borders / outlines |
| `--color-primary-300` | `#93c5fd` | 147, 197, 253 | Primary decorative elements |
| `--color-primary-400` | `#60a5fa` | 96, 165, 250 | Primary interactive hover |
| `--color-primary-500` | `#3b82f6` | 59, 130, 246 | **Primary base** - Trust, professionalism |
| `--color-primary-600` | `#2563eb` | 37, 99, 235 | Primary active / pressed |
| `--color-primary-700` | `#1d4ed8` | 29, 78, 216 | Primary emphasis |
| `--color-primary-800` | `#1e40af` | 30, 64, 175 | Primary dark text |
| `--color-primary-900` | `#1e3a8a` | 30, 58, 138 | Primary darkest |

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-secondary-50` | `#ecfdf5` | 236, 253, 245 | Secondary tint |
| `--color-secondary-100` | `#d1fae5` | 209, 250, 229 | Secondary light backgrounds |
| `--color-secondary-200` | `#a7f3d0` | 167, 243, 208 | Secondary borders |
| `--color-secondary-300` | `#6ee7b7` | 110, 231, 183 | Secondary decorative |
| `--color-secondary-400` | `#34d399` | 52, 211, 153 | Secondary interactive hover |
| `--color-secondary-500` | `#10b981` | 16, 185, 129 | **Secondary base** - Growth, progress |
| `--color-secondary-600` | `#059669` | 5, 150, 105 | Secondary active |
| `--color-secondary-700` | `#047857` | 4, 120, 87 | Secondary emphasis |
| `--color-secondary-800` | `#065f46` | 6, 95, 70 | Secondary dark |
| `--color-secondary-900` | `#064e3b` | 6, 78, 59 | Secondary darkest |

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-accent-50` | `#f5f3ff` | 245, 243, 255 | Accent tint |
| `--color-accent-100` | `#ede9fe` | 237, 233, 254 | Accent light backgrounds |
| `--color-accent-200` | `#ddd6fe` | 221, 214, 254 | Accent borders |
| `--color-accent-300` | `#c4b5fd` | 196, 181, 253 | Accent decorative |
| `--color-accent-400` | `#a78bfa` | 167, 139, 250 | Accent interactive hover |
| `--color-accent-500` | `#8b5cf6` | 139, 92, 246 | **Accent base** - Creativity, inspiration |
| `--color-accent-600` | `#7c3aed` | 124, 58, 237 | Accent active |
| `--color-accent-700` | `#6d28d9` | 109, 40, 217 | Accent emphasis |
| `--color-accent-800` | `#5b21b6` | 91, 33, 182 | Accent dark |
| `--color-accent-900` | `#4c1d95` | 76, 29, 149 | Accent darkest |

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#22c55e` | Completion states, positive feedback, "Present" status |
| `--color-success-light` | `#dcfce7` | Success backgrounds |
| `--color-warning` | `#eab308` | At-risk indicators, "Late" status |
| `--color-warning-light` | `#fef9c3` | Warning backgrounds |
| `--color-error` | `#ef4444` | Errors, destructive actions, "Absent" status |
| `--color-error-light` | `#fee2e2` | Error backgrounds |
| `--color-info` | `#3b82f6` | Informational messages |
| `--color-info-light` | `#dbeafe` | Info backgrounds |

#### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-neutral-50` | `#f9fafb` | Page backgrounds (light mode) |
| `--color-neutral-100` | `#f3f4f6` | Card backgrounds, subtle fills |
| `--color-neutral-200` | `#e5e7eb` | Borders, dividers |
| `--color-neutral-300` | `#d1d5db` | Disabled states, placeholder borders |
| `--color-neutral-400` | `#9ca3af` | Placeholder text |
| `--color-neutral-500` | `#6b7280` | Secondary text |
| `--color-neutral-600` | `#4b5563` | Body text |
| `--color-neutral-700` | `#374151` | Emphasis text |
| `--color-neutral-800` | `#1f2937` | Headings |
| `--color-neutral-900` | `#111827` | Primary text, page backgrounds (dark mode) |

### 1.2 Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle card elevation |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | Card default |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | Elevated cards, dropdowns |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | Modals, dialogs |

### 1.3 Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Small elements, badges |
| `--radius-md` | `6px` | Buttons, inputs |
| `--radius-lg` | `8px` | Cards, panels |
| `--radius-xl` | `12px` | Large cards, modals |
| `--radius-full` | `9999px` | Avatars, pills |

### 1.4 Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease` | Button hover, toggle |
| `--transition-base` | `200ms ease` | General interactions |
| `--transition-slow` | `300ms ease` | Page transitions, panels |
| `--transition-spring` | `500ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebration bounce |

---

## 2. Typography System

### 2.1 Font Family

| Token | Value | Fallback |
|-------|-------|----------|
| `--font-sans` | `'Inter'` | `system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'JetBrains Mono'` | `'Fira Code', monospace` |

### 2.2 Font Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-display` | `32px` | 700 (Bold) | 1.2 | `-0.02em` | Page titles (L1, L2, L3 headers) |
| `--text-heading-1` | `28px` | 700 (Bold) | 1.25 | `-0.01em` | Section headings |
| `--text-heading-2` | `24px` | 700 (Bold) | 1.3 | `-0.01em` | Card titles, tab group headings |
| `--text-heading-3` | `20px` | 600 (Semi) | 1.35 | `0` | Sub-section headings |
| `--text-body-lg` | `16px` | 400 (Regular) | 1.5 | `0` | Primary body text |
| `--text-body` | `14px` | 400 (Regular) | 1.5 | `0` | Default body text |
| `--text-body-medium` | `14px` | 500 (Medium) | 1.5 | `0` | Labels, table headers |
| `--text-small` | `13px` | 400 (Regular) | 1.4 | `0` | Helper text, metadata |
| `--text-xs` | `12px` | 400 (Regular) | 1.4 | `0.01em` | Captions, badges, timestamps |

### 2.3 Font Loading Strategy

- Load Inter from Google Fonts or self-host via `@fontsource/inter`
- Use `font-display: swap` to prevent FOIT
- Preload Bold (700) and Regular (400) weights
- Lazy-load Medium (500) and Semi-Bold (600) weights

---

## 3. Spacing & Layout System

### 3.1 Spacing Scale (Base: 4px)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight inner padding, icon gaps |
| `--space-2` | `8px` | Compact padding, badge padding |
| `--space-3` | `12px` | Form field padding, small gaps |
| `--space-4` | `16px` | Default padding, card inner spacing |
| `--space-6` | `24px` | Section spacing, card padding |
| `--space-8` | `32px` | Large section spacing |
| `--space-12` | `48px` | Page-level vertical spacing |
| `--space-16` | `64px` | Major layout spacing |

### 3.2 Layout Dimensions

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-width` | `260px` | Persistent sidebar (desktop) |
| `--sidebar-collapsed` | `64px` | Collapsed sidebar icon-only mode |
| `--header-height` | `64px` | Top navigation header |
| `--content-max-width` | `1280px` | Main content area max width |
| `--card-min-width` | `280px` | Minimum card width in grid |
| `--table-row-height` | `48px` | Standard table row height |

### 3.3 Grid System

| Context | Columns | Gap | Min Column Width |
|---------|---------|-----|-----------------|
| Council card grid (L1) | Auto-fill | `24px` | `280px` |
| Stats summary row | 4 columns | `16px` | `200px` |
| Goal summary boxes (L3) | 3 columns | `16px` | `160px` |
| Meeting grid (attendance) | 12 columns | `4px` | `48px` |
| Calls grid (M-T-W-Th-F) | 5 columns | `4px` | `48px` |

---

## 4. Component Inventory

### 4.1 shadcn/ui Base Components

All components use the shadcn/ui library with Tailwind CSS. Below is the complete inventory organized by category.

#### Navigation Components

| Component | shadcn | Variants | Usage |
|-----------|--------|----------|-------|
| `AppSidebar` | Sidebar | expanded, collapsed | Desktop persistent navigation |
| `MobileSheet` | Sheet | side="left" | Mobile hamburger drawer |
| `NavBar` | custom | L1, L2, L3 buttons | Level navigation (role-filtered) |
| `BackButton` | Button | variant="ghost" | Return to previous level |
| `BreadcrumbNav` | custom | - | Shows current navigation path |
| `TabNav` | Tabs | Attendance, Goals | L3 tab navigation |

#### Data Display Components

| Component | shadcn | Variants | Usage |
|-----------|--------|----------|-------|
| `StatCard` | Card | default, highlighted | Batch/council summary statistics |
| `CouncilCard` | Card | default | Council overview in L1 grid |
| `StudentTable` | Table | sortable | Student list in L2 |
| `MeetingGrid` | custom | readonly, paint | 12-week attendance matrix |
| `CallsTable` | custom | readonly, paint | M-T-W-Th-F weekly call tracker |
| `IntensivesTable` | Table | readonly, paint | 3 events x 2 days |
| `WorkshopsTable` | Table | readonly, paint | 2 workshop events |
| `GoalTrackingGrid` | custom | - | 12-week milestone/action/result grid |
| `ProgressBar` | Progress | default, animated | Linear progress indicator |
| `ProgressRing` | custom | small, medium, large | Circular progress indicator |
| `SmartBadges` | Badge | S, M, A, R, T, e, r | SMART assessment indicators |

#### Form & Input Components

| Component | shadcn | Variants | Usage |
|-----------|--------|----------|-------|
| `LoginForm` | Form | - | Authentication form |
| `GoalStatement` | Form + Input | - | SMART goal text fields |
| `StatusSelect` | Select | Present, Late, Absent, No Data | Attendance status picker |
| `ActionCheckbox` | Checkbox | default | Goal action item toggle |
| `ResultCheckbox` | Checkbox | default | Goal result item toggle |
| `MilestoneInput` | Input | - | Weekly milestone description |
| `DarkModeToggle` | Button | icon | Theme switcher |

#### Feedback Components

| Component | shadcn | Variants | Usage |
|-----------|--------|----------|-------|
| `Toast` | Toast | success, warning, error, info | Action notifications |
| `Skeleton` | Skeleton | card, table, grid | Loading placeholders |
| `CelebrationEffect` | custom | confetti, glow | Goal completion animation |
| `ConsistencyBadge` | Badge | score-based color | Attendance consistency |
| `EmptyState` | custom | - | No data placeholder |
| `ErrorBoundary` | custom | - | Error fallback UI |

#### Layout Components

| Component | shadcn | Usage |
|-----------|--------|-------|
| `AppShell` | custom | Root layout: sidebar + header + content |
| `PageHeader` | custom | Page title, breadcrumb, actions |
| `ContentArea` | custom | Scrollable main content wrapper |
| `CardGrid` | custom | Auto-responsive card grid |
| `SectionDivider` | custom | Visual section separator |

#### Chat Components

| Component | shadcn | Usage |
|-----------|--------|-------|
| `ChatPanel` | Card + Sheet | Coach/AI interaction panel |
| `ChatMessage` | custom | Individual message bubble |
| `ChatInput` | Input + Button | Message composition |
| `AiBadge` | Badge | Identifies AI-generated responses |

### 4.2 Component Specifications

#### StatCard

```
+----------------------------------+
|  [Icon]                          |
|  Label             --text-small  |
|  Value             --text-heading-2
|  +/- Change        --text-xs     |
+----------------------------------+

Padding: --space-6
Border-radius: --radius-lg
Shadow: --shadow-md
Background: --color-neutral-50 (light) / --color-neutral-800 (dark)
```

#### CouncilCard

```
+----------------------------------+
|  Council Name     --text-heading-3
|  Coach: [Name]    --text-body    |
|                                  |
|  [Student Icon] 24 students      |
|  [Progress Ring]  72% avg        |
|                                  |
|  [ View Council ]  Button        |
+----------------------------------+

Padding: --space-6
Border-radius: --radius-lg
Shadow: --shadow-md
Hover: --shadow-lg + translateY(-2px)
Transition: --transition-base
```

#### SmartBadges Row

```
[S] [M] [A] [R] [T] [e] [r]

Each badge:
  Size: 36px x 36px
  Border-radius: --radius-full
  Font: --text-xs, weight 600
  States:
    - Complete:  bg --color-success, text white
    - Partial:   bg --color-warning-light, text --color-warning
    - Incomplete: bg --color-neutral-200, text --color-neutral-500
    - N/A:       bg transparent, border dashed --color-neutral-300
  Gap: --space-2
```

#### MeetingGrid Cell

```
+--------+
| Status |
| Icon   |
+--------+

Size: 48px x 48px
Border-radius: --radius-sm
States:
  - Present: bg --color-success, icon checkmark (white)
  - Late:    bg --color-warning, icon clock (white)
  - Absent:  bg --color-error, icon x-mark (white)
  - No Data: bg --color-neutral-100, icon dash (--color-neutral-400)
Gap: --space-1
Paint mode: cursor crosshair, highlight border on hover
```

#### GoalTrackingGrid Row (per week)

```
+------+----------------------+--------+--------+---------+--------+
| Week | Milestone            | Action | Action | Result  | Cum %  |
|  #   | Description          | [ ]    | [ ]    | [ ]     |  72%   |
+------+----------------------+--------+--------+---------+--------+

Row height: --table-row-height (48px)
Milestone col: min 200px, max 400px
Checkbox cols: 48px each
Progress col: 64px, color-coded by percentage range
```

---

## 5. Page Layouts

### 5.1 Global App Shell

```
+---------------------------------------------------------------+
| HEADER (64px)                                                  |
| [Hamburger (mobile)] [Logo: GoalGetter] ... [Bell] [Theme] [Avatar] |
+----------+----------------------------------------------------+
|          |                                                     |
| SIDEBAR  |  CONTENT AREA                                       |
| (260px)  |  (max-width: 1280px, centered)                     |
|          |                                                     |
| [NavBar] |  [PageHeader]                                       |
| L1 btn   |  [Page Content - scrollable]                        |
| L2 btn   |                                                     |
| L3 btn   |                                                     |
|          |                                                     |
| (role-   |                                                     |
| filtered)|                                                     |
|          |                                                     |
+----------+----------------------------------------------------+
```

**Header Contents:**
- Left: App logo ("GoalGetter"), hamburger icon (mobile only)
- Center: NavBar level buttons (L1 | L2 | L3) - visible per role
- Right: Notification bell (with unread dot), Dark mode toggle, User avatar + dropdown

**Sidebar Contents (desktop):**
- User greeting and role badge
- Navigation links matching role permissions
- Current context indicator (which council/student is selected)
- Collapse toggle at bottom

### 5.2 L1 - Batch Overview (Head Coach Only)

```
+---------------------------------------------------------------+
| PageHeader: "Batch Overview"                                   |
+---------------------------------------------------------------+
|                                                                |
| STATS ROW (4 columns)                                          |
| +------------+ +------------+ +------------+ +------------+   |
| | Total      | | Total      | | Active     | | Completion |   |
| | Councils   | | Students   | | Goals      | | Rate       |   |
| | 8          | | 192        | | 576        | | 68%        |   |
| +------------+ +------------+ +------------+ +------------+   |
|                                                                |
| COUNCIL CARDS GRID (auto-fill, min 280px)                      |
| +----------------+ +----------------+ +----------------+      |
| | Council Alpha  | | Council Beta   | | Council Gamma  |      |
| | Coach: Jane    | | Coach: Mike    | | Coach: Sara    |      |
| | 24 students    | | 24 students    | | 24 students    |      |
| | [====72%====]  | | [===65%====]   | | [====78%===]   |      |
| | [View Council] | | [View Council] | | [View Council] |      |
| +----------------+ +----------------+ +----------------+      |
| +----------------+ +----------------+ +----------------+      |
| | ...            | | ...            | | ...            |      |
| +----------------+ +----------------+ +----------------+      |
|                                                                |
| BATCH STATS BAR                                                |
| Overall: 68% | On Track: 72% | At Risk: 18% | Behind: 10%    |
+---------------------------------------------------------------+
```

**State:** No drill-down state needed. This is the root view for HC.

**Actions:**
- Click "View Council" -> sets selectedCouncilId, navigates to L2
- Stats cards are read-only display

### 5.3 L2 - Council Detail (Head Coach + Coach)

```
+---------------------------------------------------------------+
| [< Back to Batch Overview]  (HC only, hidden for Coach)        |
| PageHeader: "Council Alpha"                                    |
| Coach: Jane Smith | 24 Students                                |
+---------------------------------------------------------------+
|                                                                |
| STUDENT TABLE                                                  |
| +--------+------------------+-------+-------+-------+---------+
| | #      | Student Name     | Enrl% | Pers% | Prof% | Action  |
| +--------+------------------+-------+-------+-------+---------+
| | 1      | Alice Johnson    | [72%] | [65%] | [80%] | [View]  |
| | 2      | Bob Martinez     | [88%] | [45%] | [72%] | [View]  |
| | 3      | Carol Williams   | [55%] | [90%] | [68%] | [View]  |
| | ...    | ...              | ...   | ...   | ...   | ...     |
| +--------+------------------+-------+-------+-------+---------+
|                                                                |
| Table features:                                                |
|   - Sortable columns (click header)                            |
|   - % cells are clickable buttons (color-coded)                |
|   - Search/filter bar above table                              |
|                                                                |
| COUNCIL ANALYTICS                                              |
| +---------------------------+  +---------------------------+   |
| | Average Progress          |  | Goal Distribution         |   |
| | [Stacked bar chart]       |  | [Pie/donut chart]         |   |
| +---------------------------+  +---------------------------+   |
+---------------------------------------------------------------+
```

**Percentage Cell Color Coding:**

| Range | Color | Token |
|-------|-------|-------|
| 0-39% | Red | `--color-error` |
| 40-69% | Yellow | `--color-warning` |
| 70-100% | Green | `--color-success` |

**Actions:**
- Click `[72%]` (Enrollment) -> sets selectedStudentId, navigates to L3 Goals tab with Enrollment goal pre-selected
- Click `[View]` -> sets selectedStudentId, navigates to L3 Attendance tab
- Back button -> clears selectedCouncilId, navigates to L1

### 5.4 L3 - Student Detail (All Roles)

#### L3 Header

```
+---------------------------------------------------------------+
| [< Back to Council]  (HC + Coach only)                         |
| PageHeader: "Alice Johnson"                                    |
+---------------------------------------------------------------+
| GOAL SUMMARY BOXES (3 columns)                                 |
| +------------------+ +------------------+ +------------------+ |
| | Enrollment       | | Personal         | | Professional     | |
| | [====72%=====]   | | [===65%====]     | | [====80%====]    | |
| | 9/12 weeks       | | 8/12 weeks       | | 10/12 weeks      | |
| +------------------+ +------------------+ +------------------+ |
|                                                                |
| Live Cumulative: 72.3%   (auto-calculated, updates in real time)|
+---------------------------------------------------------------+
| [Attendance]  [Goals]                     <- Tab navigation    |
+---------------------------------------------------------------+
```

#### L3 Attendance Tab

```
+---------------------------------------------------------------+
| SMART ASSESSMENT                                               |
| [S] [M] [A] [R] [T] [e] [r]    Consistency: [92%]            |
+---------------------------------------------------------------+
|                                                                |
| +-------------------------------------------+ +-------------+ |
| | MEETINGS GRID (12 weeks)                  | | COACH/AI    | |
| | W1  W2  W3  W4  W5  W6  W7 ... W12       | | CHAT PANEL  | |
| | [P] [P] [L] [P] [A] [P] [P] ... [--]     | |             | |
| |                                           | | [Messages]  | |
| | Paint Mode: [ON/OFF toggle]               | |             | |
| +-------------------------------------------+ | [AI Badge]  | |
|                                              | |             | |
| CALLS TABLE (per week, M-T-W-Th-F)          | | [Input]     | |
| +-------------------------------------------+ |             | |
| | Week | M   | T   | W   | Th  | F         | |             | |
| | W1   | [P] | [P] | [A] | [P] | [P]       | |             | |
| | W2   | [P] | [L] | [P] | [P] | [--]      | |             | |
| | ...  | ... | ... | ... | ... | ...        | |             | |
| +-------------------------------------------+ +-------------+ |
|                                                                |
| INTENSIVES TABLE                                               |
| +-------------------------------------------+                  |
| | Event     | Day 1  | Day 2  |                               |
| | Intensive 1 | [P]  | [P]    |                               |
| | Intensive 2 | [P]  | [L]    |                               |
| | Intensive 3 | [--] | [--]   |                               |
| +-------------------------------------------+                  |
|                                                                |
| WORKSHOPS TABLE                                                |
| +-------------------------------------------+                  |
| | Event       | Status |                                      |
| | Workshop 1  | [P]    |                                      |
| | Workshop 2  | [--]   |                                      |
| +-------------------------------------------+                  |
+---------------------------------------------------------------+
```

#### L3 Goals Tab

```
+---------------------------------------------------------------+
| GOAL SELECTOR: [Enrollment v] [Personal] [Professional]       |
+---------------------------------------------------------------+
| SMART ASSESSMENT (for selected goal)                           |
| [S] [M] [A] [R] [T] [e] [r]                                  |
+---------------------------------------------------------------+
|                                                                |
| +-------------------------------------------+ +-------------+ |
| | GOAL STATEMENT                            | | COACH/AI    | |
| | S: Specific description...                | | CHAT PANEL  | |
| | M: Measurable criteria...                 | |             | |
| | A: Achievable steps...                    | | [Messages]  | |
| | R: Relevant context...                    | |             | |
| | T: Time-bound deadline...                 | | [AI Badge]  | |
| | e: Evaluate method...                     | |             | |
| | r: Readjust strategy...                   | | [Input]     | |
| +-------------------------------------------+ |             | |
|                                              |             | |
| WEEKLY TRACKING GRID (12 weeks)              |             | |
| +-------------------------------------------+ |             | |
| | Wk | Milestone    | Actions  | Results | % | |             | |
| | 1  | Setup phase  | [x][x]  | [x][ ]  |75%| |             | |
| | 2  | Research     | [x][ ]  | [ ][ ]  |25%| |             | |
| | 3  | Draft plan   | [ ][ ]  | [ ][ ]  | 0%| |             | |
| | .. | ...          | ...     | ...     |...| |             | |
| | 12 | Final review | [ ][ ]  | [ ][ ]  | 0%| |             | |
| +-------------------------------------------+ +-------------+ |
|                                                                |
| CUMULATIVE PROGRESS: [==================72%===============]    |
+---------------------------------------------------------------+
```

**Goal Progress Auto-Calculation:**
- Weekly % = (checked_actions + checked_results) / (total_actions + total_results) * 100
- Cumulative % = average of all weekly percentages (non-zero weeks only)
- Updates live as checkboxes are toggled

---

## 6. Responsive Breakpoints

### 6.1 Breakpoint Definitions

| Token | Width | Target |
|-------|-------|--------|
| `--bp-mobile` | `< 640px` | Small phones |
| `--bp-tablet` | `640px - 1023px` | Tablets, large phones |
| `--bp-desktop` | `1024px - 1279px` | Small desktops, laptops |
| `--bp-wide` | `>= 1280px` | Standard desktops |

### 6.2 Responsive Behavior Matrix

| Component | Mobile (<640) | Tablet (640-1023) | Desktop (>=1024) |
|-----------|---------------|-------------------|------------------|
| Sidebar | Hidden (Sheet drawer) | Hidden (Sheet drawer) | Persistent (260px) |
| Header | Hamburger + Logo | Hamburger + Logo + NavBar | Logo + NavBar + Actions |
| NavBar buttons | In Sheet drawer | In header (compact) | In header (full) |
| Council grid (L1) | 1 column | 2 columns | 3-4 columns |
| Stats row (L1) | 2x2 grid | 4 columns | 4 columns |
| Student table (L2) | Card list view | Scrollable table | Full table |
| Chat panel (L3) | Full-screen Sheet | Side panel (300px) | Side panel (360px) |
| Meeting grid (L3) | Horizontal scroll | Horizontal scroll | Full width |
| Goal tracking grid | Horizontal scroll | Horizontal scroll | Full width |
| Goal summary boxes | Stacked (1 col) | 3 columns | 3 columns |

### 6.3 Mobile-Specific Adaptations

- **Student table -> Card list:** On mobile, each student row becomes a card showing name, three progress bars, and a "View" button
- **Attendance grids:** Horizontally scrollable with sticky first column (week number)
- **Chat panel:** Opens as a full-screen Sheet overlay (swipe down to dismiss)
- **Tab navigation:** Full-width tabs, horizontally scrollable if needed
- **Paint mode:** Disabled on touch devices < 640px (use tap-to-select instead)

### 6.4 Touch Adaptations

| Interaction | Desktop | Touch |
|-------------|---------|-------|
| Paint mode | Click-and-drag | Disabled; use tap-to-toggle |
| Hover tooltips | On hover | On long press |
| Context menus | Right-click | Long press |
| Cell minimum size | 48px | 48px (meets touch target) |

---

## 7. Interaction Patterns

### 7.1 Paint Mode (Attendance)

**Purpose:** Rapidly set attendance status across multiple cells by clicking and dragging.

**Activation:**
- Toggle button labeled "Paint Mode" with icon (paintbrush)
- When active: button shows filled state, cursor changes to crosshair
- Status selector appears: dropdown to choose [Present | Late | Absent | No Data]

**Behavior:**
1. User selects a status from the dropdown (e.g., "Present")
2. User clicks on a cell -> cell updates to selected status
3. User holds mouse button and drags across cells -> all touched cells update
4. Visual feedback: cells highlight with status color on hover during paint mode
5. On mouse-up: batch save triggered (optimistic update with rollback on failure)

**Constraints:**
- Only available for users with edit permission (HC, Coach)
- Council Leader and Student see readonly grids
- Paint mode is scoped to one table at a time (meetings, calls, intensives, workshops)

**Accessibility:**
- Keyboard alternative: use arrow keys to navigate cells, press Enter or Space to apply status
- Screen reader: announce "Cell Week 3 updated to Present"

### 7.2 Goal Progress Tracking

**Checkbox Interaction:**
- Click checkbox -> toggles checked/unchecked
- Progress % auto-recalculates immediately (no save button needed)
- Optimistic UI update; revert on API failure with toast error

**Progress Animation:**
- Progress bar fills with ease transition (300ms)
- When cumulative reaches 100%: trigger celebration effect

**Weekly Row States:**
- Current week: highlighted with primary-50 background
- Past weeks: normal styling
- Future weeks: slightly muted (neutral-200 text)

### 7.3 Celebration Effect

**Trigger:** Goal cumulative progress reaches 100%

**Animation Sequence:**
1. Progress bar pulses with glow effect (accent color, 2 pulses)
2. Confetti particles emit from progress bar (3 second duration)
3. Toast notification: "Goal Complete! Great work!"
4. Goal summary box border transitions to success color

**Implementation:**
- Use `canvas-confetti` library or CSS-only particle animation
- Respect `prefers-reduced-motion`: show static success badge instead
- Duration: 3 seconds total, non-blocking (user can continue interacting)

### 7.4 Navigation & Drill-Down

**State-based navigation (not route-based):**

| Action | State Change | View Change |
|--------|-------------|-------------|
| Click "View Council" (L1) | `selectedCouncilId = id` | Show L2 |
| Click student % button (L2) | `selectedStudentId = id`, `selectedGoal = type` | Show L3 Goals tab |
| Click student "View" (L2) | `selectedStudentId = id` | Show L3 Attendance tab |
| Click Back (L3) | `selectedStudentId = null` | Show L2 |
| Click Back (L2) | `selectedCouncilId = null` | Show L1 |

**URL Sync:** State changes should be reflected in URL query params for shareability:
- L1: `/dashboard`
- L2: `/dashboard?council=alpha`
- L3: `/dashboard?council=alpha&student=alice&tab=goals&goal=enrollment`

### 7.5 Loading States

| Context | Skeleton Pattern |
|---------|-----------------|
| L1 Stats Row | 4 rectangular skeletons (same size as stat cards) |
| L1 Council Grid | 6 card-shaped skeletons in grid |
| L2 Student Table | Table header + 8 row skeletons |
| L3 Attendance Grid | Grid of square skeletons matching cell layout |
| L3 Goal Tracking | Table header + 12 row skeletons |
| Chat Panel | 3 message bubble skeletons (alternating left/right) |

**Skeleton Styling:**
- Background: `--color-neutral-200` with shimmer animation
- Dark mode: `--color-neutral-700` with shimmer
- Animation: left-to-right shimmer, 1.5s loop, ease-in-out

### 7.6 Toast Notifications

| Action | Type | Message |
|--------|------|---------|
| Attendance updated | success | "Attendance saved" |
| Goal checkbox toggled | info | (silent, no toast - progress updates visually) |
| Goal completed | success | "Goal Complete! Great work!" |
| Save failed | error | "Failed to save. Retrying..." |
| Session expired | warning | "Session expired. Please log in again." |
| Paint mode on | info | "Paint mode active - drag to set status" |
| Paint mode off | info | "Paint mode deactivated" |

**Toast Positioning:** Bottom-right on desktop, bottom-center on mobile
**Duration:** 4 seconds (auto-dismiss), errors persist until dismissed

### 7.7 Dark Mode Toggle

**Interaction:**
- Click sun/moon icon in header
- Smooth transition (200ms) on all color properties
- Preference persisted to `localStorage` and user profile (API)

**System Preference:**
- On first visit: follow `prefers-color-scheme` media query
- After manual toggle: user preference overrides system

---

## 8. Accessibility Requirements

### 8.1 WCAG 2.1 AA Compliance

GoalGetter must meet WCAG 2.1 Level AA conformance across all pages and interactive elements.

### 8.2 Color Contrast Requirements

| Context | Minimum Ratio | Applies To |
|---------|--------------|------------|
| Normal text (< 18px) | 4.5:1 | Body text, labels, table content |
| Large text (>= 18px bold or >= 24px) | 3:1 | Headings, stat values |
| UI components & graphics | 3:1 | Buttons, icons, form borders, progress bars |
| Focus indicators | 3:1 | All focusable elements |

**Verified Contrast Pairs (Light Mode):**

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `#111827` (neutral-900) | `#f9fafb` (neutral-50) | 17.4:1 | AA |
| `#4b5563` (neutral-600) | `#ffffff` (white) | 7.1:1 | AA |
| `#ffffff` (white) | `#3b82f6` (primary-500) | 4.6:1 | AA |
| `#ffffff` (white) | `#10b981` (secondary-500) | 3.9:1 | AA-large |
| `#ffffff` (white) | `#22c55e` (success) | 3.1:1 | AA-large only |
| `#ffffff` (white) | `#ef4444` (error) | 4.6:1 | AA |

**Remediation for low-contrast greens:**
- Success text on light backgrounds: use `#15803d` (green-700) instead of `#22c55e`
- Attendance "Present" cells: white icon on `#16a34a` (green-600, ratio 4.5:1)
- Secondary buttons: use `--color-secondary-700` text on `--color-secondary-50` bg

### 8.3 Keyboard Navigation

#### Focus Order

Focus order follows visual layout (left-to-right, top-to-bottom):

1. Skip-to-content link (first focusable element)
2. Header: logo, nav buttons, bell, theme toggle, avatar
3. Sidebar: navigation links (desktop) / Sheet trigger (mobile)
4. Content area: page elements in DOM order
5. Modal/dialog: focus trapped within when open

#### Key Bindings

| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Global | Move focus to next focusable element |
| `Shift+Tab` | Global | Move focus to previous element |
| `Enter` / `Space` | Button, Checkbox, Link | Activate element |
| `Escape` | Modal, Sheet, Dropdown | Close overlay |
| `Arrow Up/Down` | Table, Select, Menu | Navigate items |
| `Arrow Left/Right` | Tabs, Grid cells | Navigate tabs or grid |
| `Home` / `End` | Table, Grid | Jump to first/last item |
| `Enter` | Grid cell (paint mode) | Apply selected status to cell |

#### Focus Indicators

- All focusable elements: 2px solid outline, `--color-primary-500`, 2px offset
- Dark mode: 2px solid outline, `--color-primary-300`, 2px offset
- Never use `outline: none` without a visible alternative
- Focus-visible only (not on mouse click): use `:focus-visible` selector

### 8.4 Screen Reader Support

#### ARIA Landmarks

| Landmark | Element | Label |
|----------|---------|-------|
| `banner` | Header | "GoalGetter navigation" |
| `navigation` | Sidebar | "Main navigation" |
| `main` | Content area | "Main content" |
| `complementary` | Chat panel | "Coach chat" |
| `contentinfo` | Footer (if present) | "Application info" |

#### ARIA Labels & Roles

| Component | ARIA Attribute | Value |
|-----------|---------------|-------|
| StatCard | `role="status"`, `aria-label` | "Total Councils: 8" |
| ProgressBar | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` | Dynamic values |
| MeetingGrid | `role="grid"`, `aria-label` | "Meeting attendance for weeks 1 through 12" |
| Grid cell | `role="gridcell"`, `aria-label` | "Week 3: Present" |
| SmartBadge | `role="img"`, `aria-label` | "Specific: Complete" |
| TabNav | `role="tablist"` | Standard tab pattern |
| Tab | `role="tab"`, `aria-selected` | "Attendance tab, selected" |
| TabPanel | `role="tabpanel"`, `aria-labelledby` | Linked to tab |
| Toast | `role="alert"`, `aria-live="polite"` | Auto-announced |
| DarkModeToggle | `aria-label` | "Switch to dark mode" / "Switch to light mode" |

#### Live Regions

| Event | `aria-live` | Priority |
|-------|-------------|----------|
| Progress % update | `polite` | Low - announced after current speech |
| Goal completion | `assertive` | High - announced immediately |
| Toast messages | `polite` | Low |
| Error messages | `assertive` | High |
| Paint mode status change | `polite` | Low |

### 8.5 Motion & Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .celebration-confetti { display: none; }
  .celebration-badge { display: block; } /* Static alternative */
  .skeleton-shimmer { animation: none; }
  .progress-bar { transition: none; }
}
```

### 8.6 Additional Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Skip navigation link | First DOM element, visible on focus, jumps to `main` |
| Zoom support | Layout functional at 200% zoom, no horizontal scroll at 400% text-only zoom |
| Target size | All interactive elements minimum 44x44px touch target (48px preferred) |
| Error identification | Form errors: red border + icon + text description (not color alone) |
| Link purpose | All links have descriptive text (no "click here") |
| Language | `<html lang="en">` attribute set |
| Page titles | Unique, descriptive `<title>` per view (e.g., "Alice Johnson - Goals - GoalGetter") |
| Heading hierarchy | Single `<h1>` per page, no skipped levels |

---

## 9. Dark Mode Implementation

### 9.1 Color Mapping

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--bg-page` | `#f9fafb` (neutral-50) | `#111827` (neutral-900) |
| `--bg-card` | `#ffffff` | `#1f2937` (neutral-800) |
| `--bg-card-hover` | `#f3f4f6` (neutral-100) | `#374151` (neutral-700) |
| `--bg-input` | `#ffffff` | `#1f2937` (neutral-800) |
| `--bg-sidebar` | `#ffffff` | `#1f2937` (neutral-800) |
| `--bg-header` | `#ffffff` | `#111827` (neutral-900) |
| `--text-primary` | `#111827` (neutral-900) | `#f9fafb` (neutral-50) |
| `--text-secondary` | `#4b5563` (neutral-600) | `#9ca3af` (neutral-400) |
| `--text-muted` | `#6b7280` (neutral-500) | `#6b7280` (neutral-500) |
| `--border-default` | `#e5e7eb` (neutral-200) | `#374151` (neutral-700) |
| `--border-strong` | `#d1d5db` (neutral-300) | `#4b5563` (neutral-600) |
| `--shadow-color` | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.4)` |

### 9.2 Component-Specific Dark Mode

| Component | Light | Dark |
|-----------|-------|------|
| StatCard bg | `#ffffff` | `#1f2937` |
| CouncilCard bg | `#ffffff` | `#1f2937` |
| Table header bg | `#f9fafb` | `#111827` |
| Table row hover | `#f3f4f6` | `#374151` |
| Table border | `#e5e7eb` | `#374151` |
| Skeleton shimmer | `#e5e7eb -> #f3f4f6` | `#374151 -> #4b5563` |
| Chat bubble (user) | `#3b82f6` | `#2563eb` |
| Chat bubble (other) | `#f3f4f6` | `#374151` |
| Badge (neutral) | `#f3f4f6` text `#374151` | `#374151` text `#d1d5db` |
| Attendance cell (No Data) | `#f3f4f6` | `#374151` |

### 9.3 Implementation Strategy

**Approach:** CSS custom properties with `data-theme` attribute on `<html>`.

```css
/* Default (light) */
:root {
  --bg-page: #f9fafb;
  --bg-card: #ffffff;
  --text-primary: #111827;
  /* ... all tokens ... */
}

/* Dark mode */
[data-theme="dark"] {
  --bg-page: #111827;
  --bg-card: #1f2937;
  --text-primary: #f9fafb;
  /* ... all dark tokens ... */
}
```

**Toggle Logic (pseudocode):**
```
function toggleTheme():
  current = localStorage.get("theme") || getSystemPreference()
  next = current === "dark" ? "light" : "dark"
  document.documentElement.setAttribute("data-theme", next)
  localStorage.set("theme", next)
  api.updateUserPreference({ theme: next })  // persist server-side
```

**Tailwind CSS Integration:**
- Use `darkMode: "class"` in Tailwind config (maps to `data-theme="dark"` or `.dark` class)
- shadcn/ui components automatically support dark mode via CSS variables

### 9.4 Semantic Colors in Dark Mode

Semantic colors (success, warning, error) remain consistent across modes but backgrounds adjust:

| Semantic | Light bg | Dark bg | Text (both modes) |
|----------|---------|---------|-------------------|
| Success | `#dcfce7` | `#052e16` (green-950) | `#15803d` / `#4ade80` |
| Warning | `#fef9c3` | `#422006` (yellow-950) | `#a16207` / `#facc15` |
| Error | `#fee2e2` | `#450a0a` (red-950) | `#b91c1c` / `#f87171` |

---

## 10. Component Hierarchy

### 10.1 Application Component Tree

```
<App>
  <ThemeProvider>
    <AuthProvider>
      <AppShell>
        <Header>
          <MobileMenuTrigger />        // Sheet trigger (mobile only)
          <AppLogo />
          <NavBar>
            <NavButton level="L1" />   // HC only
            <NavButton level="L2" />   // HC + Coach
            <NavButton level="L3" />   // All roles
          </NavBar>
          <HeaderActions>
            <NotificationBell />
            <DarkModeToggle />
            <UserMenu>
              <Avatar />
              <DropdownMenu />
            </UserMenu>
          </HeaderActions>
        </Header>

        <Sidebar>                      // Desktop only
          <UserGreeting />
          <SidebarNav />
          <ContextIndicator />
          <CollapseToggle />
        </Sidebar>

        <MobileSheet>                  // Mobile only
          <UserGreeting />
          <SidebarNav />
        </MobileSheet>

        <ContentArea>
          <PageRouter>

            <!-- L1: Batch Overview -->
            <BatchOverview>
              <PageHeader title="Batch Overview" />
              <StatsRow>
                <StatCard label="Total Councils" />
                <StatCard label="Total Students" />
                <StatCard label="Active Goals" />
                <StatCard label="Completion Rate" />
              </StatsRow>
              <CouncilGrid>
                <CouncilCard *ngFor="council">
                  <CouncilName />
                  <CoachName />
                  <StudentCount />
                  <ProgressRing />
                  <ViewButton />
                </CouncilCard>
              </CouncilGrid>
              <BatchStatsBar />
            </BatchOverview>

            <!-- L2: Council Detail -->
            <CouncilDetail>
              <BackButton to="L1" />
              <PageHeader title="{councilName}" />
              <CouncilHeader>
                <CoachName />
                <StudentCount />
              </CouncilHeader>
              <SearchFilter />
              <StudentTable>
                <StudentRow *ngFor="student">
                  <StudentName />
                  <ProgressButton goal="enrollment" />
                  <ProgressButton goal="personal" />
                  <ProgressButton goal="professional" />
                  <ViewButton />
                </StudentRow>
              </StudentTable>
              <CouncilAnalytics>
                <AverageProgressChart />
                <GoalDistributionChart />
              </CouncilAnalytics>
            </CouncilDetail>

            <!-- L3: Student Detail -->
            <StudentDetail>
              <BackButton to="L2" />
              <PageHeader title="{studentName}" />
              <GoalSummaryRow>
                <GoalSummaryBox goal="enrollment" />
                <GoalSummaryBox goal="personal" />
                <GoalSummaryBox goal="professional" />
              </GoalSummaryRow>
              <CumulativeProgress />
              <Tabs defaultValue="attendance">

                <!-- Attendance Tab -->
                <TabPanel value="attendance">
                  <SmartAssessmentRow>
                    <SmartBadge letter="S" />
                    <SmartBadge letter="M" />
                    <SmartBadge letter="A" />
                    <SmartBadge letter="R" />
                    <SmartBadge letter="T" />
                    <SmartBadge letter="e" />
                    <SmartBadge letter="r" />
                    <ConsistencyBadge />
                  </SmartAssessmentRow>
                  <ContentWithChat>
                    <AttendanceContent>
                      <MeetingGrid weeks={12}>
                        <PaintModeToggle />
                        <StatusSelector />
                        <GridCell *ngFor="week" />
                      </MeetingGrid>
                      <CallsTable weeks={12} days={5}>
                        <PaintModeToggle />
                        <GridCell *ngFor="day" />
                      </CallsTable>
                      <IntensivesTable events={3} days={2} />
                      <WorkshopsTable events={2} />
                    </AttendanceContent>
                    <ChatPanel>
                      <ChatMessageList>
                        <ChatMessage *ngFor="message">
                          <AiBadge />       // if AI-generated
                        </ChatMessage>
                      </ChatMessageList>
                      <ChatInput />
                    </ChatPanel>
                  </ContentWithChat>
                </TabPanel>

                <!-- Goals Tab -->
                <TabPanel value="goals">
                  <GoalSelector>
                    <GoalTab goal="enrollment" />
                    <GoalTab goal="personal" />
                    <GoalTab goal="professional" />
                  </GoalSelector>
                  <SmartAssessmentRow />
                  <ContentWithChat>
                    <GoalsContent>
                      <GoalStatement>
                        <SmartField label="S" />
                        <SmartField label="M" />
                        <SmartField label="A" />
                        <SmartField label="R" />
                        <SmartField label="T" />
                        <SmartField label="e" />
                        <SmartField label="r" />
                      </GoalStatement>
                      <GoalTrackingGrid weeks={12}>
                        <TrackingRow *ngFor="week">
                          <WeekNumber />
                          <MilestoneInput />
                          <ActionCheckbox *ngFor="action" />
                          <ResultCheckbox *ngFor="result" />
                          <WeekProgress />
                        </TrackingRow>
                      </GoalTrackingGrid>
                      <CumulativeProgressBar />
                      <CelebrationEffect />
                    </GoalsContent>
                    <ChatPanel />
                  </ContentWithChat>
                </TabPanel>

              </Tabs>
            </StudentDetail>

          </PageRouter>
        </ContentArea>

        <!-- Global overlays -->
        <ToastContainer position="bottom-right" />
        <SkeletonProvider />
      </AppShell>
    </AuthProvider>
  </ThemeProvider>
</App>
```

### 10.2 State Management Structure

```
AppState
  auth/
    user: { id, name, role, theme }
    isAuthenticated: boolean
    session: { token, expiry }

  navigation/
    currentLevel: "L1" | "L2" | "L3"
    selectedCouncilId: string | null
    selectedStudentId: string | null
    selectedTab: "attendance" | "goals"
    selectedGoal: "enrollment" | "personal" | "professional"

  ui/
    theme: "light" | "dark"
    sidebarCollapsed: boolean
    mobileSheetOpen: boolean
    paintMode: { active: boolean, status: "present" | "late" | "absent" | "nodata" }
    loading: { [key: string]: boolean }

  data/
    councils: Council[]
    students: Student[]
    attendance: AttendanceRecord[]
    goals: GoalRecord[]
    chatMessages: ChatMessage[]
    batchStats: BatchStats
```

### 10.3 Role-Based Component Visibility

| Component / Feature | Head Coach | Coach | Council Leader | Student |
|---------------------|-----------|-------|----------------|---------|
| L1 NavButton | Visible | Hidden | Hidden | Hidden |
| L2 NavButton | Visible | Visible | Hidden | Hidden |
| L3 NavButton | Visible | Visible | Visible | Visible |
| L1 BatchOverview | Accessible | Blocked | Blocked | Blocked |
| L2 CouncilDetail | Accessible | Accessible | Blocked | Blocked |
| L3 StudentDetail | Accessible | Accessible | Accessible | Accessible |
| Back to L1 button | Visible | Hidden | Hidden | Hidden |
| Back to L2 button | Visible | Visible | Hidden | Hidden |
| Paint mode toggle | Enabled | Enabled | Disabled | Disabled |
| Goal checkboxes | Editable | Editable | Read-only | Editable |
| Chat input | Enabled | Enabled | Enabled | Enabled |
| Admin analytics | Visible | Hidden | Hidden | Hidden |

### 10.4 Data Flow Diagram

```
User Interaction
       |
       v
Component (optimistic UI update)
       |
       v
State Manager (update local state)
       |
       v
API Layer (async request)
       |
       +--- Success --> Confirm state (no-op, already updated)
       |
       +--- Failure --> Rollback state + Show error toast
```

---

## Appendix A: Icon Reference

| Icon | Usage | Library |
|------|-------|---------|
| `check` | Present status, completed items | Lucide |
| `clock` | Late status | Lucide |
| `x` | Absent status, close buttons | Lucide |
| `minus` | No Data status | Lucide |
| `arrow-left` | Back navigation | Lucide |
| `sun` | Light mode indicator | Lucide |
| `moon` | Dark mode indicator | Lucide |
| `bell` | Notifications | Lucide |
| `menu` | Mobile hamburger | Lucide |
| `paintbrush` | Paint mode | Lucide |
| `message-circle` | Chat panel | Lucide |
| `trophy` | Goal completion | Lucide |
| `users` | Student count | Lucide |
| `bar-chart-2` | Analytics | Lucide |
| `search` | Filter/search | Lucide |

**Icon Library:** Lucide React (`lucide-react`)
**Icon Size:** 16px (inline), 20px (buttons), 24px (navigation)

---

## Appendix B: File & Export Naming Conventions

| Component Type | File Pattern | Example |
|----------------|-------------|---------|
| Page component | `{Name}Page.tsx` | `BatchOverviewPage.tsx` |
| Layout component | `{Name}Layout.tsx` | `AppShellLayout.tsx` |
| UI component | `{Name}.tsx` | `CouncilCard.tsx` |
| Hook | `use{Name}.ts` | `useTheme.ts` |
| Context | `{Name}Context.tsx` | `AuthContext.tsx` |
| Types | `{name}.types.ts` | `goal.types.ts` |
| Utils | `{name}.utils.ts` | `progress.utils.ts` |
| Constants | `{name}.constants.ts` | `colors.constants.ts` |

---

## Appendix C: Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| First Input Delay | < 100ms | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Bundle size (initial) | < 200KB gzipped | Build analysis |
| Skeleton to content | < 500ms | API response target |
