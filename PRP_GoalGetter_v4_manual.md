# Product Requirements Prompt (PRP)
# GoalGetter - LEAP Goal Tracking Application

**Version:** 4.0
**Target Platform:** Claude Code
**Last Updated:** March 7, 2026
**Context Engineering:** Optimized for AI-assisted development

---

## Context Engineering Primer

This Product Requirements Prompt (PRP) is designed for AI-assisted development in Claude Code. It follows context engineering best practices to provide clear, actionable specifications that enable autonomous implementation.

### How to Use This PRP

1. **Read the entire PRP** before starting implementation
2. **Follow the implementation order** specified in the Development Workflow section
3. **Reference the PRD_GoalGetter.md** for detailed business requirements and user stories
4. **Use the provided code patterns** as templates for consistency
5. **Run tests after each phase** to ensure correctness

---

## Project Overview

Build a comprehensive goal tracking and progress management system for the Leadership Excellence Achievement Program (LEAP) that implements the S.M.A.R.T.e.r. goal framework with hierarchical role-based access control, offline-first architecture, and automated notifications.

### Core Objectives

1. **Enable structured goal-setting** using S.M.A.R.T.e.r. framework (Specific, Measurable, Achievable, Relevant, Time-bound, exciting, rewarding)
2. **Implement four-tier hierarchy** (Head Coach > Coach > Council Leader > Student) with appropriate data visibility
3. **Track weekly progress** across 12-week timelines with cumulative percentage calculations
4. **Support offline updates** with automatic synchronization when connectivity restores
5. **Automate notifications** for milestone reminders, weekly check-ins, and goal completions
6. **Generate comprehensive reports** in PDF and CSV formats at individual, council, and batch levels

### Success Criteria

- All unit tests passing (Vitest)
- Role-based access control enforced at API and UI levels
- Offline functionality with IndexedDB and service workers
- PDF/CSV export generation for all user roles
- Email notifications via Resend/SendGrid
- Responsive design working on mobile and desktop
- TypeScript strict mode with no type errors
- Page load time < 2 seconds on 3G connection

### Reference Prototype

The file `GoalGetter_v3_00_week3_populated_by_Doc_Kalodski.html` is the functional prototype. Use it as:
- **UI/UX reference** for layout, navigation flow, and component structure
- **Data model reference** for student data, councils, attendance, goals
- **Seed data source** for migrating 19 students, 3 councils, and week 1-3 progress

The prototype UI should be **improved** with a vibrant professional design using shadcn/ui components, better visual hierarchy, and polished micro-interactions.

---

## Technology Stack

### Required Technologies

**Frontend:**
- Next.js 15 (App Router) with TypeScript (strict mode)
- Tailwind CSS 4 for styling
- shadcn/ui for component library
- TanStack Query (React Query) for server state management
- React Hook Form + Zod for form validation
- Recharts for data visualization
- Service Workers + IndexedDB for offline support (Serwist)

**Backend:**
- Next.js 15 Server Actions + API Routes
- Drizzle ORM (libSQL/SQLite dialect)
- Turso (hosted libSQL) for production database
- better-sqlite3 for local development database
- bcrypt for password hashing
- jose for JWT creation/verification (edge-compatible)
- Resend for email notifications (optional, can add later)

**Testing:**
- Vitest for unit and integration tests
- Target: 80%+ code coverage

### Project Structure

```
goal-getter-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Login page (default)
│   │   ├── globals.css                # Global styles + Tailwind
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx         # Login form
│   │   │   └── register/page.tsx      # Registration (HC creates users)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx             # Dashboard layout with sidebar/nav
│   │   │   ├── l1/page.tsx            # L1: Batch Overview (HC only)
│   │   │   ├── l2/page.tsx            # L2: Council Detail (HC + Coach)
│   │   │   └── l3/page.tsx            # L3: Student Detail (all roles)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts     # POST login
│   │       │   ├── register/route.ts  # POST register
│   │       │   └── logout/route.ts    # POST logout
│   │       ├── seed/route.ts          # POST seed database
│   │       └── export/
│   │           ├── pdf/route.ts       # GET PDF export
│   │           └── csv/route.ts       # GET CSV export
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── dashboard/
│   │   │   ├── L1Dashboard.tsx        # Batch overview with council cards
│   │   │   ├── L2CouncilDetail.tsx    # Council detail with student list
│   │   │   ├── L3StudentDetail.tsx    # Student detail with tabs
│   │   │   ├── AttendanceTab.tsx      # L3 Attendance tab content
│   │   │   ├── GoalsTab.tsx           # L3 Goals tab content
│   │   │   ├── GoalSummaryBox.tsx     # Goal progress card
│   │   │   ├── WeeklyTracker.tsx      # 12-week milestone grid
│   │   │   ├── AttendanceGrid.tsx     # Meeting/call attendance grid
│   │   │   ├── SmartBadges.tsx        # S.M.A.R.T.e.r. assessment badges
│   │   │   ├── ChatPanel.tsx          # Coach/AI chat component
│   │   │   └── NavBar.tsx             # L1/L2/L3 navigation bar
│   │   ├── forms/
│   │   │   ├── GoalForm.tsx           # S.M.A.R.T.e.r. goal creation
│   │   │   ├── LoginForm.tsx          # Login form
│   │   │   └── CouncilForm.tsx        # Council management form
│   │   └── layout/
│   │       ├── Sidebar.tsx            # Desktop sidebar
│   │       ├── MobileNav.tsx          # Mobile sheet drawer
│   │       ├── Header.tsx             # App header with user/dark mode
│   │       └── OfflineIndicator.tsx   # Offline status badge
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle client setup
│   │   │   ├── schema.ts             # Database schema definitions
│   │   │   └── seed.ts               # Seed data from prototype
│   │   ├── auth/
│   │   │   ├── password.ts           # bcrypt hash/verify
│   │   │   ├── jwt.ts                # JWT create/verify with jose
│   │   │   └── middleware.ts          # Auth middleware for API routes
│   │   ├── actions/
│   │   │   ├── auth.ts               # Login/register server actions
│   │   │   ├── goals.ts              # Goal CRUD server actions
│   │   │   ├── milestones.ts         # Milestone update server actions
│   │   │   ├── attendance.ts         # Attendance update server actions
│   │   │   ├── councils.ts           # Council management server actions
│   │   │   ├── chat.ts               # Chat message server actions
│   │   │   └── notifications.ts      # Notification server actions
│   │   ├── offline/
│   │   │   ├── db.ts                 # IndexedDB setup
│   │   │   └── sync.ts              # Offline sync utilities
│   │   └── utils.ts                  # Shared utilities
│   ├── hooks/
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── useOffline.ts             # Online/offline status hook
│   │   └── useDarkMode.ts            # Dark mode hook
│   └── types/
│       └── index.ts                  # Shared TypeScript types
├── public/
│   ├── sw.js                         # Service worker
│   └── manifest.json                 # PWA manifest
├── drizzle.config.ts                 # Drizzle configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── package.json
├── tsconfig.json
├── .env.local                        # Local environment variables
├── PRD_GoalGetter.md                 # Product Requirements Document
└── PRP_GoalGetter.md                 # This file
```

---

## Database Schema Implementation

### Schema Definition (src/lib/db/schema.ts)

Use Drizzle ORM with SQLite dialect. All tables use text IDs (cuid) and integer timestamps.

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ─── Batches ─────────────────────────────────────────────
export const batches = sqliteTable("batches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── Users ───────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  role: text("role", { enum: ["head_coach", "coach", "council_leader", "student"] })
    .notNull()
    .default("student"),
  councilId: text("council_id").references(() => councils.id),
  batchId: text("batch_id").references(() => batches.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Councils ────────────────────────────────────────────
export const councils = sqliteTable("councils", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  theme: text("theme"),
  coachId: text("coach_id").notNull().references(() => users.id),
  leaderId: text("leader_id").references(() => users.id),
  batchId: text("batch_id").notNull().references(() => batches.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Council = typeof councils.$inferSelect;
export type InsertCouncil = typeof councils.$inferInsert;

// ─── Goals ───────────────────────────────────────────────
export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  goalType: text("goal_type", { enum: ["enrollment", "personal", "professional"] }).notNull(),
  goalStatement: text("goal_statement").notNull(),
  specificDetails: text("specific_details"),
  measurableCriteria: text("measurable_criteria"),
  achievableResources: text("achievable_resources"),
  relevantAlignment: text("relevant_alignment"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  excitingMotivation: text("exciting_motivation"),
  rewardingBenefits: text("rewarding_benefits"),
  valuesDeclaration: text("values_declaration"),
  status: text("status", { enum: ["draft", "in_progress", "completed", "archived"] })
    .notNull()
    .default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// ─── Weekly Milestones ───────────────────────────────────
export const weeklyMilestones = sqliteTable("weekly_milestones", {
  id: text("id").primaryKey(),
  goalId: text("goal_id").notNull().references(() => goals.id),
  weekNumber: integer("week_number").notNull(),
  weekStartDate: text("week_start_date"),
  weekEndDate: text("week_end_date"),
  milestoneDescription: text("milestone_description"),
  actions: text("actions"),       // JSON: [{text: string, done: boolean}]
  results: text("results"),       // JSON: [{text: string, done: boolean}]
  cumulativePercentage: integer("cumulative_percentage").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type WeeklyMilestone = typeof weeklyMilestones.$inferSelect;

// ─── Action Plans ────────────────────────────────────────
export const actionPlans = sqliteTable("action_plans", {
  id: text("id").primaryKey(),
  goalId: text("goal_id").notNull().references(() => goals.id),
  weekNumber: integer("week_number").notNull(),
  actionDescription: text("action_description").notNull(),
  supportNeeded: text("support_needed"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── Attendance ──────────────────────────────────────────
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  weekNumber: integer("week_number").notNull(),
  meetingStatus: text("meeting_status", {
    enum: ["present", "late", "absent", "no_data"],
  }).default("no_data"),
  callMon: text("call_mon"),
  callTue: text("call_tue"),
  callWed: text("call_wed"),
  callThu: text("call_thu"),
  callFri: text("call_fri"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── Chat Messages ───────────────────────────────────────
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull().references(() => users.id),
  recipientId: text("recipient_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  type: text("type", { enum: ["coach", "ai"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── Notifications ───────────────────────────────────────
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", {
    enum: ["milestone_reminder", "weekly_checkin", "goal_completion", "council", "batch", "low_progress"],
  }).notNull(),
  read: integer("read").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── Buddies ─────────────────────────────────────────────
export const buddies = sqliteTable("buddies", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  buddyId: text("buddy_id").notNull().references(() => users.id),
  councilId: text("council_id").notNull().references(() => councils.id),
});

// ─── Declarations ────────────────────────────────────────
export const declarations = sqliteTable("declarations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

### Database Client Setup (src/lib/db/index.ts)

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

### Drizzle Config (drizzle.config.ts)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
```

### Database Migration

After defining schema, run:
```bash
npx drizzle-kit push
```

---

## Authentication Implementation

### Password Utilities (src/lib/auth/password.ts)

```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### JWT Utilities (src/lib/auth/jwt.ts)

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  role: "head_coach" | "coach" | "council_leader" | "student";
}

export async function createAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function createRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
```

### Next.js Middleware (src/middleware.ts)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const publicPaths = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for access token
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Role-based route protection
    if (pathname.startsWith("/l1") && payload.role !== "head_coach") {
      return NextResponse.redirect(new URL("/l2", request.url));
    }
    if (pathname.startsWith("/l2") && payload.role === "student") {
      return NextResponse.redirect(new URL("/l3", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)"],
};
```

---

## Server Actions Implementation

### Pattern: Goal Server Actions (src/lib/actions/goals.ts)

```typescript
"use server";

import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const createGoalSchema = z.object({
  goalType: z.enum(["enrollment", "personal", "professional"]),
  goalStatement: z.string().min(10, "Goal statement must be at least 10 characters"),
  specificDetails: z.string().optional(),
  measurableCriteria: z.string().optional(),
  achievableResources: z.string().optional(),
  relevantAlignment: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  excitingMotivation: z.string().optional(),
  rewardingBenefits: z.string().optional(),
  valuesDeclaration: z.string().optional(),
});

export async function createGoal(formData: z.infer<typeof createGoalSchema>) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "student" && user.role !== "council_leader") {
    throw new Error("Only students can create goals");
  }

  const validated = createGoalSchema.parse(formData);
  const now = new Date();

  await db.insert(goals).values({
    id: createId(),
    userId: user.userId,
    ...validated,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/l3");
  return { success: true };
}

export async function getMyGoals() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  return db.select().from(goals).where(eq(goals.userId, user.userId));
}

export async function updateGoal(goalId: string, updates: Partial<z.infer<typeof createGoalSchema>>) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
  if (!goal || goal.userId !== user.userId) {
    throw new Error("Forbidden");
  }

  await db.update(goals).set({ ...updates, updatedAt: new Date() }).where(eq(goals.id, goalId));
  revalidatePath("/l3");
  return { success: true };
}

export async function getAllGoals() {
  const user = await getAuthUser();
  if (!user || user.role !== "head_coach") throw new Error("Forbidden");

  return db.select().from(goals);
}
```

### Pattern: Attendance Server Actions (src/lib/actions/attendance.ts)

```typescript
"use server";

import { db } from "@/lib/db";
import { attendance } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/jwt";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";

export async function updateAttendance(
  userId: string,
  weekNumber: number,
  updates: {
    meetingStatus?: "present" | "late" | "absent" | "no_data";
    callMon?: string;
    callTue?: string;
    callWed?: string;
    callThu?: string;
    callFri?: string;
  }
) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  // Only coaches and HC can update attendance
  if (user.role !== "coach" && user.role !== "head_coach") {
    throw new Error("Forbidden");
  }

  const existing = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.userId, userId), eq(attendance.weekNumber, weekNumber)))
    .limit(1);

  const now = new Date();

  if (existing.length > 0) {
    await db
      .update(attendance)
      .set({ ...updates, updatedAt: now })
      .where(eq(attendance.id, existing[0].id));
  } else {
    await db.insert(attendance).values({
      id: createId(),
      userId,
      weekNumber,
      ...updates,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/l3");
  return { success: true };
}

export async function getStudentAttendance(userId: string) {
  return db.select().from(attendance).where(eq(attendance.userId, userId));
}
```

---

## Frontend Implementation

### State-Based Navigation (src/app/(dashboard)/layout.tsx)

```typescript
"use client";

import { useState, createContext, useContext } from "react";
import NavBar from "@/components/dashboard/NavBar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import OfflineIndicator from "@/components/layout/OfflineIndicator";

interface NavigationContextType {
  currentPage: "L1" | "L2" | "L3";
  setCurrentPage: (page: "L1" | "L2" | "L3") => void;
  selectedCouncil: any | null;
  setSelectedCouncil: (council: any | null) => void;
  selectedStudent: any | null;
  setSelectedStudent: (student: any | null) => void;
  selectedGoal: "enrollment" | "personal" | "professional";
  setSelectedGoal: (goal: "enrollment" | "personal" | "professional") => void;
  activeL3Tab: "attendance" | "goals";
  setActiveL3Tab: (tab: "attendance" | "goals") => void;
}

export const NavigationContext = createContext<NavigationContextType>(null!);
export const useNavigation = () => useContext(NavigationContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<"L1" | "L2" | "L3">("L1");
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState<"enrollment" | "personal" | "professional">("enrollment");
  const [activeL3Tab, setActiveL3Tab] = useState<"attendance" | "goals">("attendance");

  return (
    <NavigationContext.Provider
      value={{
        currentPage, setCurrentPage,
        selectedCouncil, setSelectedCouncil,
        selectedStudent, setSelectedStudent,
        selectedGoal, setSelectedGoal,
        activeL3Tab, setActiveL3Tab,
      }}
    >
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <NavBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          <OfflineIndicator />
        </div>
      </div>
    </NavigationContext.Provider>
  );
}
```

### Navigation Flow
| From | Action | Destination |
|------|--------|-------------|
| L1 | Click council card | L2 (council selected) |
| L2 | Click attendance "View" | L3 Attendance tab |
| L2 | Click goal % button | L3 Goals tab (goal selected) |
| L3 | Click "Back to Council" | L2 |
| L3 | Switch tab | Toggle between Attendance/Goals |

### Role-Based Login Destinations
| Role | Destination |
|------|-------------|
| Head Coach | L1 (Batch Overview) |
| Coach | L2 (Council Detail) |
| Council Leader | L3 (Goals tab) |
| Student | L3 (Goals tab) |

---

## Offline Functionality Implementation

### Service Worker (public/sw.js)

```javascript
const CACHE_NAME = "goalgetter-v1";
const urlsToCache = ["/", "/login", "/l1", "/l2", "/l3"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-goals") {
    event.waitUntil(syncPendingUpdates());
  }
});

async function syncPendingUpdates() {
  // Implemented in offline/sync.ts - triggered via postMessage
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "SYNC_TRIGGERED" }));
  });
}
```

### IndexedDB Utilities (src/lib/offline/db.ts)

```typescript
import { openDB, type IDBPDatabase } from "idb";

interface GoalGetterDB {
  goals: { key: string; value: any };
  milestones: { key: string; value: any };
  pendingUpdates: { key: number; value: { action: string; data: any; timestamp: number } };
}

let dbInstance: IDBPDatabase<GoalGetterDB> | null = null;

export async function getOfflineDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<GoalGetterDB>("goalgetter-offline", 1, {
    upgrade(db) {
      db.createObjectStore("goals", { keyPath: "id" });
      db.createObjectStore("milestones", { keyPath: "id" });
      db.createObjectStore("pendingUpdates", { keyPath: "id", autoIncrement: true });
    },
  });

  return dbInstance;
}

export async function queueOfflineAction(action: string, data: any) {
  const db = await getOfflineDB();
  await db.add("pendingUpdates", { action, data, timestamp: Date.now() } as any);
}

export async function processPendingUpdates() {
  const db = await getOfflineDB();
  const pending = await db.getAll("pendingUpdates");

  for (const update of pending) {
    try {
      const response = await fetch(`/api/${update.action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update.data),
      });

      if (response.ok) {
        await db.delete("pendingUpdates", update.id);
      }
    } catch (error) {
      console.error("Failed to sync update:", error);
    }
  }
}
```

### Offline Hook (src/hooks/useOffline.ts)

```typescript
"use client";

import { useState, useEffect } from "react";
import { processPendingUpdates, getOfflineDB } from "@/lib/offline/db";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      processPendingUpdates();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPending = async () => {
      const db = await getOfflineDB();
      const count = await db.count("pendingUpdates");
      setPendingCount(count);
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, pendingCount };
}
```

---

## Testing Implementation

### Test Pattern (src/lib/actions/__tests__/goals.test.ts)

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/lib/auth/jwt", () => ({
  getAuthUser: vi.fn(),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

import { getAuthUser } from "@/lib/auth/jwt";

describe("Goal Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated users", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const { createGoal } = await import("@/lib/actions/goals");

    await expect(
      createGoal({
        goalType: "enrollment",
        goalStatement: "Test goal statement for enrollment",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("should reject non-student roles from creating goals", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      userId: "coach-1",
      role: "coach",
    });
    const { createGoal } = await import("@/lib/actions/goals");

    await expect(
      createGoal({
        goalType: "enrollment",
        goalStatement: "Test goal statement for enrollment",
      })
    ).rejects.toThrow("Only students can create goals");
  });
});
```

Run tests with:
```bash
npx vitest run
```

---

## Development Workflow

### Phase 1: Foundation Setup
1. Initialize Next.js 15 project with TypeScript
2. Install dependencies: `drizzle-orm @libsql/client bcrypt jose tailwindcss @tanstack/react-query zod react-hook-form recharts`
3. Set up shadcn/ui components
4. Define database schema in `src/lib/db/schema.ts`
5. Configure Drizzle for Turso (or local SQLite for dev)
6. Run `npx drizzle-kit push` to create tables
7. Test database connectivity

### Phase 2: Authentication
1. Implement password hash/verify utilities
2. Create JWT utilities with jose
3. Build login API route and server action
4. Set up Next.js middleware for route protection
5. Create login page with shadcn/ui form
6. Test authentication flow

### Phase 3: 3-Level Navigation & Views
1. Create dashboard layout with NavigationContext
2. Build NavBar component (L1/L2/L3 buttons with role-based access)
3. Build L1Dashboard component (batch overview, council cards)
4. Build L2CouncilDetail component (student list with goal/attendance buttons)
5. Build L3StudentDetail component with tabbed Attendance + Goals views
6. Test drill-down flow: L1 -> L2 -> L3 for all roles

### Phase 4: Goal Management
1. Create S.M.A.R.T.e.r. goal creation form
2. Implement goal CRUD server actions
3. Build weekly milestone tracker component
4. Implement live progress calculation (checked items / total items)
5. Add SMART assessment badges
6. Test goal creation and tracking

### Phase 5: Attendance Tracking
1. Build meetings grid component (12 weeks, paint mode)
2. Build calls table component (M-T-W-Th-F, paint mode)
3. Build intensives/workshops table
4. Implement attendance server actions
5. Calculate consistency score
6. Test attendance tracking

### Phase 6: Advanced Features
1. Implement council management UI (HC only)
2. Build Coach/AI chat panels
3. Add buddy system
4. Add declarations
5. Implement dark mode toggle
6. Create seed data migration from v3.00 prototype

### Phase 7: Offline Functionality
1. Create service worker (public/sw.js)
2. Implement IndexedDB utilities
3. Build OfflineIndicator component
4. Add useOffline hook
5. Test offline sync scenarios

### Phase 8: Notifications & Exports
1. Build in-app notification system (bell icon, dropdown)
2. Set up email service (Resend/SendGrid)
3. Implement PDF export (student, council, batch)
4. Implement CSV export
5. Add automated scheduling (cron via Vercel)
6. Test notifications and exports

### Phase 9: Polish & Launch
1. Implement Recharts dashboards (progress charts, trends)
2. Add micro-interactions and celebration animations
3. Test responsive design (mobile, tablet, desktop)
4. Run Lighthouse audit and optimize performance
5. User acceptance testing

---

## Key Implementation Notes

### 1. Type Safety
- **Always use TypeScript strict mode**
- Define Zod schemas for all server action inputs
- Use Drizzle's `$inferSelect` and `$inferInsert` for type inference
- Never use `any` type without explicit justification

### 2. Error Handling
- Throw descriptive errors in server actions
- Display user-friendly error messages with toast notifications
- Implement loading states for all async operations
- Handle offline scenarios gracefully with IndexedDB queue

### 3. Performance
- Use TanStack Query for caching and deduplication
- Implement pagination for large datasets (councils, goals)
- Optimize database queries with proper indexing
- Use Next.js dynamic imports for code splitting

### 4. Security
- **Never trust client-side data** - always validate in server actions
- Enforce role-based access control in every server action
- Use parameterized queries (Drizzle handles this automatically)
- Store JWT in HttpOnly cookies only (never localStorage)
- Hash passwords with bcrypt (10 salt rounds)

### 5. Offline-First
- Cache read operations in IndexedDB
- Queue write operations when offline
- Sync pending updates on reconnection
- Show offline indicator and pending sync count

### 6. Testing
- Test all server actions with different user roles
- Verify authorization logic (students can't access coach data)
- Test offline sync scenarios
- Aim for 80%+ code coverage

---

## Environment Variables

### Local Development (.env.local)

```env
# Database (local SQLite for development)
DATABASE_URL=file:./local.db

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-min-32-characters-long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional - add when implementing notifications)
# RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Production (Vercel Environment Variables)

```env
# Database (Turso)
DATABASE_URL=libsql://your-db-name.turso.io
DATABASE_AUTH_TOKEN=your-turso-auth-token

# JWT Secret
JWT_SECRET=production-secret-key-min-32-characters

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## Common Pitfalls to Avoid

1. **Using localStorage for JWT** - Always use HttpOnly cookies
2. **Forgetting `"use server"` directive** on server actions
3. **Not validating inputs** in server actions (always use Zod)
4. **Missing role checks** in server actions (check `getAuthUser().role`)
5. **Not handling loading states** in React components
6. **Hardcoding user IDs** instead of using `getAuthUser().userId`
7. **Not testing offline functionality** thoroughly
8. **Ignoring TypeScript errors** (fix all before deployment)
9. **Using `jsonwebtoken` instead of `jose`** (jose is edge-compatible)
10. **Not running `drizzle-kit push`** after schema changes

---

## Deployment Checklist

- [ ] All tests passing (`npx vitest run`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Database schema pushed to Turso (`npx drizzle-kit push`)
- [ ] Environment variables set in Vercel dashboard
- [ ] Seed data loaded in production database
- [ ] Offline functionality tested
- [ ] Responsive design verified on mobile
- [ ] PDF/CSV exports working
- [ ] Dark mode toggle working
- [ ] Performance optimized (< 2s page load)
- [ ] Lighthouse score > 90

---

## Resources

- **PRD_GoalGetter.md:** Detailed business requirements and user stories
- **GoalGetter_v3_00_*.html:** Functional prototype (UI/data reference)
- **Drizzle ORM Docs:** https://orm.drizzle.team/docs/overview
- **Turso Docs:** https://docs.turso.tech
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui Components:** https://ui.shadcn.com
- **jose JWT Docs:** https://github.com/panva/jose
- **TanStack Query:** https://tanstack.com/query

---

**Document End**

This PRP provides a complete blueprint for building GoalGetter with Next.js 15, Turso, and Vercel. Follow the implementation workflow, use the provided code patterns, and reference the PRD_GoalGetter.md for business context.
