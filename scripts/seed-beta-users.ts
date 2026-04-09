/**
 * Seeds beta test users for GoalGetter Beta v2.
 * Run once: npx tsx scripts/seed-beta-users.ts
 *
 * Passcodes:
 *   hcleap99beta2      → L99HCoach  (Head Coach view)
 *   coachleap99beta2   → L99Coach   (Coach view / L2)
 *   studentleap99beta2 → L99Student (Student view)
 *   buddyleap99beta2   → L99Buddy   (Student view)
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local */ }

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../src/lib/db/schema";
import bcrypt from "bcrypt";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

// ─── Beta user definitions ────────────────────────────────────────────────────

const BETA_USERS = [
  {
    email: "beta_hc@leap99.test",
    password: "hcleap99beta2",
    name: "L99HCoach",
    role: "head_coach" as const,
    canViewAllCouncils: 1,
  },
  {
    email: "beta_coach@leap99.test",
    password: "coachleap99beta2",
    name: "L99Coach",
    role: "coach" as const,
    canViewAllCouncils: 0,
  },
  {
    email: "beta_student@leap99.test",
    password: "studentleap99beta2",
    name: "L99Student",
    role: "student" as const,
    canViewAllCouncils: 0,
  },
  {
    email: "beta_buddy@leap99.test",
    password: "buddyleap99beta2",
    name: "L99Buddy",
    role: "student" as const,
    canViewAllCouncils: 0,
  },
  {
    email: "beta_tester2@leap99.test",
    password: "tester2leap99beta2",
    name: "Beta Tester2",
    role: "student" as const,
    canViewAllCouncils: 0,
  },
];

// ─── Beta Tester2 APA data ───────────────────────────────────────────────────

const TESTER2_WHEEL: Record<string, number> = {
  physical_health: 5, mental_wellness: 5, relationships: 5, romance: 5,
  family_home: 5, fun_recreation: 5, career_satisfaction: 5, work_environment: 5,
  skills_abilities: 5, income_finances: 5, professional_growth: 5, purpose_spirituality: 5,
};

const TESTER2_DECLARATION = "I am unstoppable";

const TESTER2_GOALS = [
  {
    type: "enrollment" as const,
    statement: "To finally close the gap between intention and action — this is the week I actually start, as a loving, committed, and courageous person, I reach out through referrals,social media at least 7 times a week, and enroll 1 FLEX student and 1 ALC student by June 21, 2026.",
    milestones: [
      { week: 1, pct: 25,  desc: "Build system: 50-person warm list · FLEX + ALC pitch scripts · morning,evening block locked · obstacle plan for \"fear of rejection,following up consistently\" | Schedule: FLEX 298 May 9–10 · FLEX 299 May 16–17 · ALC 256 Jun 5–7 · ALC 257 Jun 12–14 · Graduation Jun 21" },
      { week: 2, pct: 38,  desc: "Execute outreach: 15+ conversations · 5 discovery calls · FLEX 298 May 9–10 Abenson HQ Muñoz — be at the door" },
      { week: 3, pct: 50,  desc: "Close FLEX pipeline · FLEX 299 May 16–17 SMX Aura + 1st Workshop May 17 — be at the door, embrace the energy" },
      { week: 4, pct: 58,  desc: "Enroll 1st FLEX student · 2nd Intensive May 23–24 UP BGC — be at door · ALC pipeline 30+ conversations" },
      { week: 5, pct: 65,  desc: "ALC orientation calls · 3+ prospects in proposal · FLEX student thriving · ALC 256 Jun 5–7 urgency planted" },
      { week: 6, pct: 75,  desc: "Enroll 1st ALC student · ALC 256 Jun 5–7 SMX Aura · be at the door · document your process" },
      { week: 7, pct: 100, desc: "Goal complete · ALC 257 Jun 12–14 SMX Aura · 2nd Workshop Jun 14 · testimony drafted" },
      { week: 8, pct: 100, desc: "Both clients thriving · testimony ready Jun 19 · Graduation Jun 20–21 · next cohort waitlist locked" },
    ],
  },
  {
    type: "personal" as const,
    statement: "To be a joyful beginner again — and stop letting comparison steal what I love, as a loving, committed, and courageous person, I commit fully to local travel (province / region) — planning and preparing in at least 3 dedicated sessions per week — and present documented proof of the journey by June 21, 2026.",
    milestones: [
      { week: 1, pct: 25,  desc: "Declare the experience publicly; make 1 concrete booking step; name and break your blocking belief; start savings" },
      { week: 2, pct: 38,  desc: "Experience BOOKED or concretely committed; itinerary drafted; ₱1000 transferred (₱2000 saved)" },
      { week: 3, pct: 50,  desc: "Preparation deepens; 1st Workshop May 17 — how does aliveness show up here?" },
      { week: 4, pct: 63,  desc: "Midpoint; ₱4000 saved; 2nd Intensive May 23–24" },
      { week: 5, pct: 75,  desc: "Savings on track (₱5000 saved); countdown building" },
      { week: 6, pct: 88,  desc: "ALC Jun 5–7; final countdown — everything confirmed" },
      { week: 7, pct: 100, desc: "EXPERIENCE WEEK — local travel (province / region),bucket list item — LIVE IT FULLY; 2nd Workshop Jun 14" },
      { week: 8, pct: 100, desc: "Experience completed; evidence compiled; testimony submitted; Graduation Jun 20–21" },
    ],
  },
  {
    type: "professional" as const,
    statement: "To stay the course past the point where I've always quit before, as a loving, committed, and courageous person, I dedicate at least 2 hours per day to building and selling my freelance skills offer and reach out to at least 5 prospects per week, and earn at least ₱14999 in additional monthly income by June 21, 2026.",
    milestones: [
      { week: 1, pct: 25,  desc: "Define offer: what, for whom, at what rate; 30-person warm list; pitch drafted; Wk 2 schedule locked" },
      { week: 2, pct: 38,  desc: "10+ conversations; 3 discovery calls; first proposal sent; income tracker started" },
      { week: 3, pct: 50,  desc: "Proposals followed up; FIRST INCOME EARNED; 1st Workshop May 17" },
      { week: 4, pct: 63,  desc: "Pipeline growing; referral ask made; 2nd Intensive May 23–24; monthly income pace building" },
      { week: 5, pct: 75,  desc: "Income stream consistent; 2 active clients/gigs; referrals activated; monthly pace building" },
      { week: 6, pct: 88,  desc: "Run rate ₱10499+; testimonials captured; next month pre-sold; ALC Jun 5–7" },
      { week: 7, pct: 100, desc: "TARGET +₱14999 HIT or confirmed; 2nd Workshop Jun 14; income model documented" },
      { week: 8, pct: 100, desc: "Month confirmed; extra income active; testimony ready Jun 19; Graduation Jun 20–21" },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding beta users...");

  const [firstBatch] = await db.select().from(schema.batches).limit(1);
  if (!firstBatch) {
    console.error("No batch found. Please create a batch first.");
    process.exit(1);
  }

  // Part 2: starts April 27, 2026 — 8 weeks + FLEX/ALC program events
  const programEvents = [
    { id: "flex-298-d1", name: "FLEX 298 Day 1 — Doors Open (Abenson HQ Muñoz)", date: "2026-05-09", type: "event" },
    { id: "flex-298-d2", name: "FLEX 298 Day 2 — Embrazzo Graduation (Abenson HQ Muñoz)", date: "2026-05-10", type: "event" },
    { id: "flex-299-d1", name: "FLEX 299 Day 1 — Doors Open (SMX Aura)", date: "2026-05-16", type: "event" },
    { id: "flex-299-d2", name: "FLEX 299 Day 2 — Embrazzo Graduation (SMX Aura)", date: "2026-05-17", type: "event" },
    { id: "workshop-1",  name: "1st Workshop", date: "2026-05-17", type: "event" },
    { id: "intensive-2-d1", name: "2nd Intensive Day 1 (UP BGC)", date: "2026-05-23", type: "intensive" },
    { id: "intensive-2-d2", name: "2nd Intensive Day 2 (UP BGC)", date: "2026-05-24", type: "intensive" },
    { id: "alc-256-d1", name: "ALC 256 Day 1 — Doors Open (SMX Aura)", date: "2026-06-05", type: "event" },
    { id: "alc-256-d2", name: "ALC 256 Day 2", date: "2026-06-06", type: "event" },
    { id: "alc-256-d3", name: "ALC 256 Day 3 — Embrazzo Graduation (SMX Aura)", date: "2026-06-07", type: "event" },
    { id: "alc-257-d1", name: "ALC 257 Day 1 — Doors Open (SMX Aura)", date: "2026-06-12", type: "event" },
    { id: "alc-257-d2", name: "ALC 257 Day 2", date: "2026-06-13", type: "event" },
    { id: "alc-257-d3", name: "ALC 257 Day 3 — Embrazzo Graduation (SMX Aura)", date: "2026-06-14", type: "event" },
    { id: "workshop-2",  name: "2nd Workshop", date: "2026-06-14", type: "event" },
    { id: "intensive-3-d1", name: "3rd Intensive Day 1 — Graduation", date: "2026-06-19", type: "intensive" },
    { id: "intensive-3-d2", name: "3rd Intensive Day 2 — Graduation", date: "2026-06-20", type: "intensive" },
    { id: "intensive-3-d3", name: "3rd Intensive Day 3 — Graduation", date: "2026-06-21", type: "intensive" },
  ];

  await db
    .update(schema.batches)
    .set({ startDate: "2026-04-27", totalWeeks: 8, events: JSON.stringify(programEvents) })
    .where(eq(schema.batches.id, firstBatch.id));
  console.log("  ✓ Batch updated: start=2026-04-27, totalWeeks=8, FLEX/ALC/Workshop/Intensive events seeded");

  const now = new Date();

  // 1. Upsert users (HC and Coach first — no council needed yet)
  const userIds: Record<string, string> = {};

  for (const u of BETA_USERS) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, u.email))
      .limit(1);

    const hash = await bcrypt.hash(u.password, 12);

    if (existing.length > 0) {
      await db
        .update(schema.users)
        .set({ passwordHash: hash, name: u.name, canViewAllCouncils: u.canViewAllCouncils })
        .where(eq(schema.users.email, u.email));
      userIds[u.name] = existing[0].id;
      console.log(`  ✓ Updated: ${u.email} → ${u.name}`);
    } else {
      const id = createId();
      await db.insert(schema.users).values({
        id,
        email: u.email,
        passwordHash: hash,
        name: u.name,
        role: u.role,
        councilId: null, // assigned below after council is created
        batchId: firstBatch.id,
        approvalStatus: "approved",
        canViewAllCouncils: u.canViewAllCouncils,
        createdAt: now,
        updatedAt: now,
      });
      userIds[u.name] = id;
      console.log(`  ✓ Created: ${u.email} → ${u.name}`);
    }
  }

  // Refresh IDs from DB in case some already existed
  for (const u of BETA_USERS) {
    const [row] = await db.select().from(schema.users).where(eq(schema.users.email, u.email)).limit(1);
    if (row) userIds[u.name] = row.id;
  }

  const coachId  = userIds["L99Coach"];
  const studentId = userIds["L99Student"];
  const buddyId  = userIds["L99Buddy"];

  // 2. Create or update "Unstoppable Council"
  const [existingCouncil] = await db
    .select()
    .from(schema.councils)
    .where(eq(schema.councils.name, "Unstoppable Council"))
    .limit(1);

  let councilId: string;

  if (existingCouncil) {
    await db
      .update(schema.councils)
      .set({ coachId, updatedAt: now })
      .where(eq(schema.councils.id, existingCouncil.id));
    councilId = existingCouncil.id;
    console.log("  ✓ Updated: Unstoppable Council");
  } else {
    councilId = createId();
    await db.insert(schema.councils).values({
      id: councilId,
      name: "Unstoppable Council",
      coachId,
      batchId: firstBatch.id,
      createdAt: now,
      updatedAt: now,
    });
    console.log("  ✓ Created: Unstoppable Council");
  }

  // 3. Assign L99Coach, L99Student, L99Buddy to council
  await db
    .update(schema.users)
    .set({ councilId, updatedAt: now })
    .where(eq(schema.users.email, "beta_coach@leap99.test"));

  await db
    .update(schema.users)
    .set({ councilId, updatedAt: now })
    .where(eq(schema.users.email, "beta_student@leap99.test"));

  await db
    .update(schema.users)
    .set({ councilId, updatedAt: now })
    .where(eq(schema.users.email, "beta_buddy@leap99.test"));

  console.log("  ✓ Assigned L99Coach + L99Student + L99Buddy → Unstoppable Council");

  // 4. Buddy pair: L99Student ↔ L99Buddy
  const existingBuddy = await db
    .select()
    .from(schema.buddies)
    .where(eq(schema.buddies.studentId, studentId))
    .limit(1);

  if (existingBuddy.length === 0) {
    await db.insert(schema.buddies).values({
      id: createId(),
      studentId,
      buddyId,
      councilId,
    });
    // Reciprocal pair
    await db.insert(schema.buddies).values({
      id: createId(),
      studentId: buddyId,
      buddyId: studentId,
      councilId,
    });
    console.log("  ✓ Created buddy pair: L99Student ↔ L99Buddy");
  } else {
    console.log("  ℹ Buddy pair already exists — skipping");
  }

  // 5. Declaration for L99Student
  const existingDecl = await db
    .select()
    .from(schema.declarations)
    .where(eq(schema.declarations.userId, studentId))
    .limit(1);

  if (existingDecl.length === 0) {
    await db.insert(schema.declarations).values({
      id: createId(),
      userId: studentId,
      text: "I'll do whatever it takes!",
      approvalStatus: "approved",
      approvedBy: coachId,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    console.log("  ✓ Created declaration: \"I'll do whatever it takes!\" for L99Student");
  } else {
    console.log("  ℹ Declaration already exists — skipping");
  }

  // 6. Sample goals + milestones for L99Student — always reset
  // Delete existing milestones first, then goals
  const existingGoals = await db
    .select()
    .from(schema.goals)
    .where(eq(schema.goals.userId, studentId));

  for (const g of existingGoals) {
    await db.delete(schema.weeklyMilestones).where(eq(schema.weeklyMilestones.goalId, g.id));
  }
  if (existingGoals.length > 0) {
    await db.delete(schema.goals).where(eq(schema.goals.userId, studentId));
    console.log(`  ✓ Cleared ${existingGoals.length} existing goal(s) for L99Student`);
  }

  // Cumulative %s aligned to LEAP 99 Part 2 weekly targets:
  // W1:0–10 | W2:10–37.5 | W3:37.5–50 | W4:50–62.5 | W5:62.5–75 | W6:75–87.5 | W7:87.5–100 | W8:100
  const WEEK_PCTS = [25, 38, 50, 63, 75, 88, 100, 100] as const;

  const sampleGoals = [
    {
      type: "enrollment" as const,
      statement: "As a loving, committed, and courageous presence · enroll 2 FLEX and 2 ALC students by June 19, 2026 through daily referral outreach.",
      weekPcts: WEEK_PCTS,
      milestones: [
        // W1: Apr 27–May 3 — Clarity of Declaration & Goals
        "Clarify personal declaration and enrollment goal; identify 20 warm market contacts; send first outreach to 5.",
        // W2: May 4–10 — Action Plans Finalized; 1st FLEX (298) enrollment
        "Finalize enrollment action plan; conduct 5 discovery conversations; enroll 1st FLEX 298 student.",
        // W3: May 11–17 — 2nd FLEX (299) enrollment | 1st Workshop week
        "Enroll 2nd FLEX 299 student; attend 1st Workshop; begin ALC pipeline with 3 prospects.",
        // W4: May 18–24 — LEAP 99 2nd Intensive week
        "Attend LEAP 99 2nd Intensive; conduct 3 ALC discovery calls; advance 2 ALC prospects.",
        // W5: May 25–31 — 62.5–75% personal & professional goals
        "Follow up with all ALC prospects; confirm 1 ALC 257 enrollment application submitted.",
        // W6: Jun 1–7 — 1st ALC (257) enrollment
        "Enroll 1st ALC 257 student; open pipeline for 2nd ALC 258 with 3 new contacts.",
        // W7: Jun 8–14 — 2nd ALC (258) enrollment | 2nd Workshop week
        "Enroll 2nd ALC 258 student; attend 2nd Workshop; document full enrollment process.",
        // W8: Jun 15–19 — 100% | LEAP 99 3rd Intensive
        "100% enrollment goal complete; attend LEAP 99 3rd Intensive; submit final enrollment report to coach.",
      ],
    },
    {
      type: "personal" as const,
      statement: "Embody resilience and gratitude through a daily morning journaling practice, 6/7 days/week, for 8 weeks — becoming the person I want to be.",
      weekPcts: WEEK_PCTS,
      milestones: [
        // W1: Clarity of Declaration & Goals
        "Clarify personal declaration; set up journal + morning routine; complete 6/7 days.",
        // W2: Action Plans Finalized
        "Finalize personal action plan; journal 6/7 days; identify 1 limiting belief from entries.",
        // W3: 37.5–50% | 1st Workshop week
        "Journal 6/7 days; attend 1st Workshop; write gratitude list of 10 items every morning.",
        // W4: 50–62.5% | 2nd Intensive week
        "Journal 6/7 days; attend LEAP 99 2nd Intensive; reflect on resilience moment from the week.",
        // W5: 62.5–75%
        "Journal 6/7 days; share one key insight with buddy or coach this week.",
        // W6: 75–87.5%
        "Journal 6/7 days; review 5 weeks of entries; identify 3 personal growth themes.",
        // W7: 87.5–100% | 2nd Workshop week
        "Journal 6/7 days; attend 2nd Workshop; write reflection on identity shift over 7 weeks.",
        // W8: 100% | 3rd Intensive week
        "Journal 6/7 days; attend LEAP 99 3rd Intensive; write final testimony of becoming — share with council.",
      ],
    },
    {
      type: "professional" as const,
      statement: "Complete a project management mini-course and apply learnings to lead one council initiative by June 19, 2026.",
      weekPcts: WEEK_PCTS,
      milestones: [
        // W1: Clarity of Goals
        "Clarify professional goal; enroll in PM mini-course; complete Module 1 (Introduction to PM).",
        // W2: Action Plans Finalized
        "Complete Module 2; finalize professional action plan; draft scope statement for council initiative.",
        // W3: 37.5–50% | 1st Workshop week
        "Complete Module 3; attend 1st Workshop; identify stakeholders and create simple project plan.",
        // W4: 50–62.5% | 2nd Intensive week
        "Complete Module 4; attend LEAP 99 2nd Intensive; present project plan to council for feedback.",
        // W5: 62.5–75%
        "Complete Module 5; begin execution of council initiative Week 1 tasks.",
        // W6: 75–87.5%
        "Complete Modules 6–7; deliver mid-point update to council; adjust plan based on feedback.",
        // W7: 87.5–100% | 2nd Workshop week
        "Complete course; attend 2nd Workshop; finalize all council initiative deliverables.",
        // W8: 100% | 3rd Intensive week
        "100% professional goal complete; attend LEAP 99 3rd Intensive; submit final initiative report to coach.",
      ],
    },
  ];

  for (const g of sampleGoals) {
    const goalId = createId();
    await db.insert(schema.goals).values({
      id: goalId,
      userId: studentId,
      goalType: g.type,
      goalStatement: g.statement,
      status: "active",
      approvalStatus: "approved",
      createdAt: now,
      updatedAt: now,
    });

    for (let w = 1; w <= 8; w++) {
      const desc = g.milestones[w - 1];
      await db.insert(schema.weeklyMilestones).values({
        id: createId(),
        goalId,
        weekNumber: w,
        milestoneDescription: desc,
        actions: JSON.stringify([{ text: desc, done: false }]),
        cumulativePercentage: g.weekPcts[w - 1],
        approvalStatus: w < 8 ? "approved" : "pending",
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`  ✓ ${g.type} goal + 8 milestones (25→38→50→63→75→88→100→100%) for L99Student`);
  }

  // 7. Beta Tester2: declaration + wheel + goals
  const tester2Id = userIds["Beta Tester2"];
  if (tester2Id) {
    // Assign to Unstoppable Council
    await db.update(schema.users)
      .set({ councilId, updatedAt: now })
      .where(eq(schema.users.email, "beta_tester2@leap99.test"));

    // Declaration
    const [existT2Decl] = await db.select().from(schema.declarations).where(eq(schema.declarations.userId, tester2Id)).limit(1);
    if (existT2Decl) {
      await db.update(schema.declarations)
        .set({ text: TESTER2_DECLARATION, approvalStatus: "approved", approvedBy: coachId, approvedAt: now, updatedAt: now })
        .where(eq(schema.declarations.id, existT2Decl.id));
    } else {
      await db.insert(schema.declarations).values({
        id: createId(), userId: tester2Id, text: TESTER2_DECLARATION,
        approvalStatus: "approved", approvedBy: coachId, approvedAt: now, createdAt: now, updatedAt: now,
      });
    }

    // Wheel of life
    await db.update(schema.users)
      .set({ wheelOfLife: JSON.stringify(TESTER2_WHEEL), updatedAt: now })
      .where(eq(schema.users.id, tester2Id));

    // Goals + milestones — always reset
    const existT2Goals = await db.select().from(schema.goals).where(eq(schema.goals.userId, tester2Id));
    for (const g of existT2Goals) {
      await db.delete(schema.weeklyMilestones).where(eq(schema.weeklyMilestones.goalId, g.id));
    }
    if (existT2Goals.length > 0) {
      await db.delete(schema.goals).where(eq(schema.goals.userId, tester2Id));
    }

    for (const g of TESTER2_GOALS) {
      const goalId = createId();
      await db.insert(schema.goals).values({
        id: goalId, userId: tester2Id, goalType: g.type, goalStatement: g.statement,
        status: "active", approvalStatus: "approved", createdAt: now, updatedAt: now,
      });
      for (const m of g.milestones) {
        await db.insert(schema.weeklyMilestones).values({
          id: createId(), goalId, weekNumber: m.week, milestoneDescription: m.desc,
          actions: JSON.stringify([{ text: m.desc, done: false }]),
          cumulativePercentage: m.pct,
          approvalStatus: m.week < 8 ? "approved" : "pending",
          createdAt: now, updatedAt: now,
        });
      }
      console.log(`  ✓ ${g.type} goal + 8 milestones for Beta Tester2`);
    }
    console.log("  ✓ Beta Tester2 → Unstoppable Council (declaration + wheel + 3 goals)");
  }

  console.log("\nBeta users ready:");
  console.log("  hcleap99beta2      → L99HCoach  (Head Coach view)");
  console.log("  coachleap99beta2   → L99Coach   (Coach view / L2 → Unstoppable Council)");
  console.log("  studentleap99beta2 → L99Student (Student view)");
  console.log("  buddyleap99beta2   → L99Buddy   (Student view)");
  console.log("  tester2leap99beta2 → Beta Tester2 (Student view → Unstoppable Council)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
