# PRODUCT REQUIREMENTS PROMPT (PRP)

## GoalGetter - LEAP Goal Tracking Application

**Version:** 4.0
**Last Updated:** March 7, 2026
**Author:** Product Team
**Target Platform:** Claude Code
**Context Engineering:** P.A.R.T. Framework (Prompt, Artifacts, Resources, Tools)

---

## PART 1: SYSTEM IDENTITY

<system_identity>

## Agent Role & Objective

You are an expert full-stack TypeScript engineer building GoalGetter, a comprehensive goal tracking and progress management system for the LEAP (Leadership Excellence Achievement Program) that implements the S.M.A.R.T.e.r. goal framework with hierarchical role-based access control, offline-first PWA architecture, and automated notifications.

### Primary Objective

Build a production-ready Next.js 15 web application that enables head coaches, coaches, and students to track goal achievement across a 12-week program using a 3-level drill-down navigation model, deployed to Vercel with Turso database.

### Core Responsibilities

1. Implement a 4-tier role hierarchy (Head Coach > Coach > Council Leader > Student) with JWT-based authentication and role-based route protection
2. Build a 3-level drill-down navigation (L1: Batch Overview, L2: Council Detail, L3: Student Detail with Attendance + Goals tabs)
3. Create S.M.A.R.T.e.r. goal management with 12-week milestone tracking, live progress calculation, and offline sync
4. Deliver vibrant professional UI using shadcn/ui with Tailwind CSS 4, responsive design, and dark mode

### Success Metrics

- All Vitest tests passing with 80%+ code coverage
- Role-based access control enforced at middleware and server action levels
- Offline functionality with IndexedDB queue and background sync
- PDF/CSV exports for student, council, and batch levels
- TypeScript strict mode with zero type errors
- Page load time < 2 seconds on 3G connection
- Responsive design working on 320px+ screens

### Constraints

- Must use Next.js 15 App Router (not Pages Router)
- Must use Turso (hosted libSQL) for production; local SQLite for development
- Must use jose for JWT (not jsonwebtoken - jose is edge-compatible)
- Must store JWT in HttpOnly cookies (never localStorage)
- Must use Server Actions for data mutations (not tRPC)
- Must use the GoalGetter v3.00 HTML prototype as UI/UX and data reference, but improve the design

</system_identity>

---

## PART 2: TECHNOLOGY CONTEXT

<technology_stack>

## Technology Stack

### Core
- **Language:** TypeScript 5 (strict mode)
- **Framework:** Next.js 15 (App Router)
- **Database:** Turso (hosted SQLite/libSQL) - production; better-sqlite3 - development
- **ORM:** Drizzle ORM (libSQL dialect)

### Frontend
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui (copy-paste, zero runtime deps)
- **State:** TanStack Query (React Query) for server state, caching
- **Forms:** React Hook Form + Zod for validation with type inference
- **Charts:** Recharts for dashboard visualizations
- **Offline:** Service Workers + IndexedDB (Serwist)
- **PWA:** Installable Progressive Web App

### Backend
- **API:** Next.js Server Actions + API Routes
- **Auth:** bcrypt (10 salt rounds) + jose JWT (HS256)
- **Token Storage:** HttpOnly, Secure, SameSite=Strict cookies
- **Email:** Resend or SendGrid (notifications, optional for MVP)

### Development Tools
- **Testing:** Vitest (unit + integration, 80%+ coverage)
- **Linting:** ESLint + Prettier
- **CI/CD:** Vercel Git integration (auto-deploy on push)
- **Local DB:** SQLite via better-sqlite3

</technology_stack>

---

## PART 3: MODULE SPECIFICATIONS

<module_specifications>

## Module 1: Authentication & Authorization

### Purpose
Secure email/password authentication with JWT tokens and role-based route protection for 4 user roles.

### Input Schema
```typescript
// Login
{ email: string; password: string }

// Register (HC creates users)
{ email: string; password: string; name: string; role: UserRole; councilId?: string }
```

### Output Schema
```typescript
// JWT Payload (minimal - stored in HttpOnly cookie)
{ userId: string; role: "head_coach" | "coach" | "council_leader" | "student" }
```

### Core Logic
```
1. User submits email + password
2. Server validates via bcrypt.compare()
3. Create access token (1h) + refresh token (7d) via jose SignJWT
4. Set tokens in HttpOnly cookies
5. Next.js middleware validates on every request
6. Role-based redirect: HC->L1, Coach->L2, Student/CL->L3(Goals)
```

### Code Patterns

#### Password Utilities (src/lib/auth/password.ts)
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

#### JWT Utilities (src/lib/auth/jwt.ts)
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
    maxAge: 60 * 60,
  });
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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

#### Next.js Middleware (src/middleware.ts)
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const publicPaths = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

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

### Error Handling
| Error Type | Handling Strategy | User Message |
|------------|-------------------|--------------|
| Invalid credentials | Return 401 | "Invalid email or password" |
| Token expired | Attempt refresh, redirect to login | "Session expired, please login again" |
| Insufficient role | Return 403, redirect | "You don't have access to this page" |

### Acceptance Criteria
- [ ] Email/password login with bcrypt verification
- [ ] JWT tokens stored in HttpOnly cookies
- [ ] Middleware protects routes by role
- [ ] Role-based login destinations work correctly

---

## Module 2: Goal Management (S.M.A.R.T.e.r.)

### Purpose
Enable students to create and track 3 goals using the S.M.A.R.T.e.r. framework with weekly milestone tracking.

### Input Schema
```typescript
const createGoalSchema = z.object({
  goalType: z.enum(["enrollment", "personal", "professional"]),
  goalStatement: z.string().min(10).max(500),
  specificDetails: z.string().max(500).optional(),
  measurableCriteria: z.string().max(300).optional(),
  achievableResources: z.string().max(300).optional(),
  relevantAlignment: z.string().max(300).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  excitingMotivation: z.string().max(200).optional(),
  rewardingBenefits: z.string().max(200).optional(),
  valuesDeclaration: z.string().max(500).optional(),
});
```

### Server Action Pattern (src/lib/actions/goals.ts)
```typescript
"use server";

import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

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
```

### Acceptance Criteria
- [ ] Students create exactly 3 goals (one per type)
- [ ] S.M.A.R.T.e.r. fields validate with Zod
- [ ] Goal status transitions: Draft -> In Progress -> Completed -> Archived
- [ ] Goal editing locked after week 1 completion

---

## Module 3: Weekly Milestone Tracking

### Purpose
Track weekly progress with action items, results, and cumulative percentages across 12 weeks per goal.

### Progress Calculation
```typescript
// Live Progress: checked items / total items
const liveProgress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

// Goal Progress: highest cumulative percentage across all milestones
const goalProgress = Math.max(...milestones.map(m => m.cumulativePercentage));

// Council Progress: average of all member goal progress
const councilProgress = memberGoalProgresses.reduce((a, b) => a + b, 0) / memberGoalProgresses.length;
```

### Acceptance Criteria
- [ ] 12-week grid with milestone descriptions
- [ ] Action/result checkboxes with add/remove/toggle
- [ ] Live progress auto-calculates
- [ ] Cumulative percentage updates correctly

---

## Module 4: Attendance Tracking

### Server Action Pattern (src/lib/actions/attendance.ts)
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
```

### Acceptance Criteria
- [ ] Meetings grid: 12 weeks with status toggles
- [ ] Calls table: M-T-W-Th-F per week
- [ ] Paint mode for quick-set operations
- [ ] Consistency score calculation
- [ ] Only coaches/HC can update attendance

---

## Module 5: 3-Level Navigation

### Purpose
State-based drill-down navigation from batch overview to student detail.

### Navigation Context (src/app/(dashboard)/layout.tsx)
```typescript
"use client";

import { useState, createContext, useContext } from "react";

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

### Acceptance Criteria
- [ ] 3-level drill-down works for all roles
- [ ] Role-based access enforced at each level
- [ ] Back navigation works correctly
- [ ] Tab switching on L3 works

---

## Module 6: Offline Functionality (PWA)

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
```

### IndexedDB Utilities (src/lib/offline/db.ts)
```typescript
import { openDB, type IDBPDatabase } from "idb";

interface GoalGetterDB {
  goals: { key: string; value: any };
  milestones: { key: string; value: any };
  pendingUpdates: { key: number; value: { action: string; data: any; timestamp: number } };
}

export async function getOfflineDB() {
  return openDB<GoalGetterDB>("goalgetter-offline", 1, {
    upgrade(db) {
      db.createObjectStore("goals", { keyPath: "id" });
      db.createObjectStore("milestones", { keyPath: "id" });
      db.createObjectStore("pendingUpdates", { keyPath: "id", autoIncrement: true });
    },
  });
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
    const handleOnline = () => { setIsOnline(true); processPendingUpdates(); };
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

### Acceptance Criteria
- [ ] Service Worker caches static assets
- [ ] Offline goal updates queued in IndexedDB
- [ ] Auto-sync on reconnection
- [ ] Offline badge and pending count display

</module_specifications>

---

## PART 4: DATA MODELS

<data_models>

## Database Schema (src/lib/db/schema.ts)

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// --- Batches ---
export const batches = sqliteTable("batches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// --- Users ---
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

// --- Councils ---
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

// --- Goals ---
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

// --- Weekly Milestones ---
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

// --- Action Plans ---
export const actionPlans = sqliteTable("action_plans", {
  id: text("id").primaryKey(),
  goalId: text("goal_id").notNull().references(() => goals.id),
  weekNumber: integer("week_number").notNull(),
  actionDescription: text("action_description").notNull(),
  supportNeeded: text("support_needed"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// --- Attendance ---
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

// --- Chat Messages ---
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull().references(() => users.id),
  recipientId: text("recipient_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  type: text("type", { enum: ["coach", "ai"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// --- Notifications ---
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

// --- Buddies ---
export const buddies = sqliteTable("buddies", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  buddyId: text("buddy_id").notNull().references(() => users.id),
  councilId: text("council_id").notNull().references(() => councils.id),
});

// --- Declarations ---
export const declarations = sqliteTable("declarations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

## Database Client Setup (src/lib/db/index.ts)

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

## Drizzle Config (drizzle.config.ts)

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

</data_models>

---

## PART 5: IMPLEMENTATION GUIDE

<implementation_patterns>

## Implementation Patterns

### Error Handling Pattern
```typescript
// Server Action error handling
export async function serverAction(input: Input) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const validated = schema.parse(input);
    const result = await db.insert(table).values({ ...validated });
    revalidatePath("/path");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    throw error;
  }
}
```

### Configuration Pattern
```typescript
// src/lib/config.ts
export const config = {
  program: {
    name: "LEAP",
    totalWeeks: 12,
    startDate: "2026-02-02",
    endDate: "2026-04-26",
    goalTypes: ["enrollment", "personal", "professional"] as const,
  },
  auth: {
    saltRounds: 10,
    accessTokenExpiry: "1h",
    refreshTokenExpiry: "7d",
  },
  attendance: {
    statuses: ["present", "late", "absent", "no_data"] as const,
    callDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] as const,
  },
};
```

### Component Pattern
```typescript
// Server Component fetching data
import { getMyGoals } from "@/lib/actions/goals";

export default async function GoalsPage() {
  const goals = await getMyGoals();
  return <GoalsClient goals={goals} />;
}

// Client Component for interactivity
"use client";
export function GoalsClient({ goals }: { goals: Goal[] }) {
  // Interactive UI with React state
}
```

</implementation_patterns>

<environment_variables>

## Environment Variables

```bash
# =============================================================================
# .env.local - GoalGetter Local Development
# =============================================================================

# Database (local SQLite for development)
DATABASE_URL=file:./local.db

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-min-32-characters-long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional - add when implementing notifications)
# RESEND_API_KEY=re_xxxxxxxxxxxxx
```

```bash
# =============================================================================
# Production (Vercel Environment Variables)
# =============================================================================

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

</environment_variables>

<build_sequence>

## Build Sequence

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
4. Implement live progress calculation
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

</build_sequence>

---

## PART 6: TESTING REQUIREMENTS

<testing_requirements>

## Testing & Validation

### Test Framework
- **Vitest** for unit and integration tests
- **Target:** 80%+ code coverage

### Unit Test Pattern
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/jwt", () => ({
  getAuthUser: vi.fn(),
}));

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
  beforeEach(() => { vi.clearAllMocks(); });

  it("should reject unauthenticated users", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const { createGoal } = await import("@/lib/actions/goals");
    await expect(
      createGoal({ goalType: "enrollment", goalStatement: "Test goal statement" })
    ).rejects.toThrow("Unauthorized");
  });

  it("should reject non-student roles from creating goals", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ userId: "coach-1", role: "coach" });
    const { createGoal } = await import("@/lib/actions/goals");
    await expect(
      createGoal({ goalType: "enrollment", goalStatement: "Test goal statement" })
    ).rejects.toThrow("Only students can create goals");
  });
});
```

### Coverage Requirements
| Module | Minimum Coverage | Critical Paths |
|--------|------------------|----------------|
| Auth (password, jwt) | 90% | Login, token creation/verification, cookie management |
| Server Actions (goals, milestones, attendance) | 85% | CRUD operations, role-based access |
| Middleware | 90% | Route protection, role-based redirects |
| Offline (IndexedDB, sync) | 75% | Queue, process, conflict resolution |
| Components | 70% | Form submission, navigation, state changes |

### Security Tests
```typescript
describe("Security", () => {
  it("should prevent SQL injection via parameterized queries", async () => {
    // Drizzle ORM handles parameterization - verify no raw SQL
  });

  it("should prevent XSS via HttpOnly cookies", async () => {
    // Verify cookies have httpOnly: true flag
  });

  it("should enforce role-based access on every server action", async () => {
    // Test each action with unauthorized roles
  });
});
```

### Test Commands
```bash
# Run all tests
npx vitest run

# Run with coverage
npx vitest run --coverage

# Run in watch mode
npx vitest

# Type check
npx tsc --noEmit
```

### Pre-Deployment Checklist
- [ ] All Vitest tests pass (80%+ coverage)
- [ ] TypeScript strict mode clean (`tsc --noEmit`)
- [ ] Database schema pushed to Turso (`drizzle-kit push`)
- [ ] Environment variables set in Vercel
- [ ] Seed data loaded in production
- [ ] Offline functionality tested
- [ ] Responsive design verified on mobile
- [ ] PDF/CSV exports working
- [ ] Dark mode toggle working
- [ ] Lighthouse score > 90

</testing_requirements>

---

## PART 7: CONTEXT RESOURCES

<reference_documentation>

## Key Documentation Links

### Primary Framework
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Next.js App Router:** https://nextjs.org/docs/app
- **Next.js Server Actions:** https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

### Database
- **Drizzle ORM:** https://orm.drizzle.team/docs/overview
- **Drizzle + Turso:** https://orm.drizzle.team/docs/tutorials/drizzle-with-turso
- **Turso Docs:** https://docs.turso.tech

### UI Components
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS 4:** https://tailwindcss.com/docs
- **Recharts:** https://recharts.org

### Authentication
- **jose JWT:** https://github.com/panva/jose
- **Next.js Auth Guide:** https://nextjs.org/docs/app/guides/authentication

### PWA / Offline
- **Next.js PWA Guide:** https://nextjs.org/docs/app/guides/progressive-web-apps
- **Serwist:** https://serwist.pages.dev

### State Management
- **TanStack Query:** https://tanstack.com/query

</reference_documentation>

<reference_prototype>

## Reference Prototype

**File:** `GoalGetter_v3_00_week3_populated_by_Doc_Kalodski.html`

Use this HTML prototype as:
- **UI/UX reference** for layout, navigation flow, and component structure
- **Data model reference** for student data, councils, attendance, goals
- **Seed data source** for migrating 19 students, 3 councils, and week 1-3 progress

The prototype UI should be **improved** with vibrant professional design, shadcn/ui components, better visual hierarchy, and polished micro-interactions.

</reference_prototype>

---

## PART 8: SUCCESS CRITERIA

<success_criteria>

## Definition of Done

### Functional Requirements
- [ ] 4-tier role hierarchy with correct access control
- [ ] 3-level drill-down navigation (L1 -> L2 -> L3)
- [ ] S.M.A.R.T.e.r. goal creation with all 7 fields
- [ ] 12-week milestone tracking with live progress
- [ ] Attendance tracking with paint mode
- [ ] Council management (HC only)
- [ ] Coach-Student and AI chat
- [ ] Buddy system and declarations
- [ ] In-app + email notifications
- [ ] PDF/CSV exports at all levels
- [ ] Offline updates with sync
- [ ] Dark mode toggle
- [ ] Seed data from prototype

### Non-Functional Requirements
- [ ] Page load < 2 seconds on 3G
- [ ] API response < 500ms (95th percentile)
- [ ] Test coverage > 80%
- [ ] TypeScript strict mode, zero errors
- [ ] WCAG 2.1 Level AA
- [ ] PWA installable

### Quality Gates
1. All Vitest tests pass
2. TypeScript clean (`tsc --noEmit`)
3. Lighthouse score > 90
4. Security scan clean (no OWASP top 10)
5. Responsive design verified (320px-1920px)

### Deliverables
1. Working Next.js 15 application deployed to Vercel
2. Turso database with seed data
3. Test suite with 80%+ coverage
4. PWA manifest and service worker
5. Documentation (README with setup instructions)

</success_criteria>

---

## APPENDIX: Project Structure

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
│   │   ├── config.ts                 # App configuration constants
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
├── drizzle/                           # Generated migrations
├── drizzle.config.ts                 # Drizzle configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── vitest.config.ts                  # Vitest configuration
├── package.json
├── tsconfig.json
├── .env.local                        # Local environment variables
├── PRD.md                            # Product Requirements Document
└── PRP.md                            # This file
```

---

## Key Implementation Notes

1. **Type Safety:** Always use TypeScript strict mode. Define Zod schemas for all server action inputs. Use Drizzle's `$inferSelect` and `$inferInsert` for type inference. Never use `any` without justification.

2. **Security:** Never trust client-side data. Validate in server actions with Zod. Check `getAuthUser().role` in every server action. Store JWT in HttpOnly cookies only. Hash passwords with bcrypt (10 rounds).

3. **Performance:** Use TanStack Query for caching/deduplication. Implement pagination for large datasets. Use Next.js dynamic imports for code splitting.

4. **Offline-First:** Cache reads in IndexedDB. Queue writes when offline. Sync on reconnection. Show offline indicator and pending count.

5. **Common Pitfalls to Avoid:**
   - Using localStorage for JWT (use HttpOnly cookies)
   - Forgetting `"use server"` directive on server actions
   - Not validating inputs in server actions (always use Zod)
   - Missing role checks in server actions
   - Using `jsonwebtoken` instead of `jose` (jose is edge-compatible)
   - Not running `drizzle-kit push` after schema changes

---

**Document End**

This PRP provides a complete blueprint for building GoalGetter with Next.js 15, Turso, and Vercel. Follow the build sequence, use the provided code patterns, and reference the PRD.md for business context.
