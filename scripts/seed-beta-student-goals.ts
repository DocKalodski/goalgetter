/**
 * Seeds sample goals + milestones for beta_student@leap99.test
 * Run: npx tsx scripts/seed-beta-student-goals.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

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
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const SAMPLE_GOALS = [
  {
    goalType: "enrollment" as const,
    goalStatement: "Recruit 3 qualified distributors into the LEAP program by Week 12",
    specificDetails: "Target warm market contacts and existing network connections",
    measurableCriteria: "3 signed distributor agreements with at least 1 active recruit",
    achievableResources: "LEAP training materials, upline support, and weekly coaching sessions",
    relevantAlignment: "Aligned with building a sustainable network and income stream",
    excitingMotivation: "Financial freedom and helping others grow through the same opportunity",
    rewardingBenefits: "Passive income, rank advancement, and leadership recognition",
    // cumulativePercentage per week (out of 100 for full program)
    milestones: [
      { week: 1, pct: 8,  milestone: "Identify 20 warm market contacts", actions: [{ text: "List 20 names from contacts", done: true }, { text: "Sort by likelihood to join", done: true }], results: [{ text: "20-name list completed", done: true }] },
      { week: 2, pct: 17, milestone: "Make first 10 outreach calls", actions: [{ text: "Call 5 contacts (Mon–Wed)", done: true }, { text: "Call 5 contacts (Thu–Fri)", done: true }], results: [{ text: "10 calls completed, 3 interested", done: true }] },
      { week: 3, pct: 25, milestone: "Conduct 3 business presentations", actions: [{ text: "Schedule 3 presentation appointments", done: true }, { text: "Prepare presentation deck", done: true }], results: [{ text: "3 presentations done, 1 follow-up", done: true }] },
      { week: 4, pct: 33, milestone: "Follow up with all interested prospects", actions: [{ text: "Send follow-up messages to interested prospects", done: true }, { text: "Schedule 1-on-1 Q&A calls", done: true }], results: [{ text: "2 prospects ready to sign", done: true }] },
      { week: 5, pct: 42, milestone: "Sign first distributor", actions: [{ text: "Complete onboarding with first recruit", done: true }, { text: "Orient recruit to LEAP tools", done: true }], results: [{ text: "1 distributor signed and onboarded", done: true }] },
      { week: 6, pct: 50, milestone: "Continue prospecting second recruit", actions: [{ text: "10 new outreach messages", done: true }, { text: "Attend 1 LEAP event with prospect", done: true }], results: [{ text: "Second prospect in final decision stage", done: true }] },
      { week: 7, pct: 58, milestone: "Close second distributor", actions: [{ text: "Final follow-up call with 2nd prospect", done: false }, { text: "Prepare signing documents", done: false }], results: [{ text: "Second distributor signed", done: false }] },
    ],
  },
  {
    goalType: "personal" as const,
    goalStatement: "Build a daily mindset and wellness routine that sustains peak performance throughout LEAP 99",
    specificDetails: "Morning journaling, 30-min exercise, and evening reflection every day",
    measurableCriteria: "5 out of 7 days per week compliance tracked in habit tracker",
    achievableResources: "LEAP mindset modules, accountability partner, and coaching check-ins",
    relevantAlignment: "Personal growth is the foundation for leading and inspiring others",
    excitingMotivation: "Becoming the best version of myself to model for my team",
    rewardingBenefits: "Improved energy, focus, confidence, and resilience",
    milestones: [
      { week: 1, pct: 8,  milestone: "Set up morning routine", actions: [{ text: "Design 30-min morning routine", done: true }, { text: "Set alarm 30 min earlier", done: true }], results: [{ text: "Routine defined and started", done: true }] },
      { week: 2, pct: 17, milestone: "Complete 5/7 days of routine", actions: [{ text: "Journal every morning", done: true }, { text: "30 min exercise daily", done: true }], results: [{ text: "6/7 days completed Week 2", done: true }] },
      { week: 3, pct: 25, milestone: "Add evening reflection", actions: [{ text: "Write 3 wins + 1 lesson nightly", done: true }, { text: "Review next day's priorities", done: true }], results: [{ text: "Evening routine established", done: true }] },
      { week: 4, pct: 33, milestone: "Maintain streak through busy week", actions: [{ text: "Stick to routine despite events", done: true }, { text: "Adjust timing if needed but don't skip", done: true }], results: [{ text: "5/7 days maintained during full schedule", done: true }] },
      { week: 5, pct: 42, milestone: "Add mindset reading 15 min/day", actions: [{ text: "Read personal development book 15 min AM", done: true }, { text: "Share 1 insight with accountability partner", done: true }], results: [{ text: "Reading habit added to routine", done: true }] },
      { week: 6, pct: 50, milestone: "Mid-program reflection and reset", actions: [{ text: "Write mid-program self-assessment", done: true }, { text: "Adjust routine based on what's working", done: true }], results: [{ text: "Assessment done, routine optimized", done: true }] },
      { week: 7, pct: 58, milestone: "Coach one team member on mindset", actions: [{ text: "Share routine with a downline", done: false }, { text: "Check in on their progress", done: false }], results: [{ text: "Mentored 1 team member on habits", done: false }] },
    ],
  },
  {
    goalType: "professional" as const,
    goalStatement: "Achieve Silver rank and develop 2 active downlines into consistent performers by Week 12",
    specificDetails: "Reach Silver rank criteria and mentor 2 downlines to hit their weekly targets",
    measurableCriteria: "Silver rank badge + 2 downlines averaging 60%+ action step completion",
    achievableResources: "Rank qualification guide, LEAP coaching framework, weekly team huddles",
    relevantAlignment: "Professional growth means building a team, not just a business",
    excitingMotivation: "Leaving a legacy and proving the system works through my team's success",
    rewardingBenefits: "Rank bonuses, leadership recognition, and team culture impact",
    milestones: [
      { week: 1, pct: 8,  milestone: "Review Silver rank requirements", actions: [{ text: "Study rank qualification criteria", done: true }, { text: "Identify gap between current and Silver", done: true }], results: [{ text: "Gap analysis completed", done: true }] },
      { week: 2, pct: 17, milestone: "Identify 2 coachable downlines", actions: [{ text: "Assess current downlines' commitment level", done: true }, { text: "Select 2 for focused mentoring", done: true }], results: [{ text: "2 downlines selected for mentoring", done: true }] },
      { week: 3, pct: 25, milestone: "Begin weekly 1-on-1 with each mentee", actions: [{ text: "Schedule weekly check-ins with Mentee A", done: true }, { text: "Schedule weekly check-ins with Mentee B", done: true }], results: [{ text: "Both mentees have structured weekly support", done: true }] },
      { week: 4, pct: 33, milestone: "Reach Bronze rank milestones", actions: [{ text: "Submit Bronze rank requirements", done: true }, { text: "Celebrate with team", done: true }], results: [{ text: "Bronze rank confirmed", done: true }] },
      { week: 5, pct: 42, milestone: "Mentees hit 60% action step completion", actions: [{ text: "Review both mentees' weekly trackers", done: true }, { text: "Provide targeted coaching on weak areas", done: true }], results: [{ text: "Mentee A: 65%, Mentee B: 60%", done: true }] },
      { week: 6, pct: 50, milestone: "Build toward Silver requirements", actions: [{ text: "Track personal volume + downline volume", done: true }, { text: "Identify final gap to Silver", done: true }], results: [{ text: "80% of Silver requirements met", done: true }] },
      { week: 7, pct: 58, milestone: "Final push to Silver rank", actions: [{ text: "Complete remaining Silver volume requirements", done: false }, { text: "Submit Silver rank application", done: false }], results: [{ text: "Silver rank achieved", done: false }] },
    ],
  },
];

async function main() {
  console.log("Seeding sample goals for beta_student@leap99.test...");

  const [student] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "beta_student@leap99.test"))
    .limit(1);

  if (!student) {
    console.error("beta_student@leap99.test not found. Run seed-beta-users.ts first.");
    process.exit(1);
  }

  console.log(`  Found student: ${student.id}`);

  // Clear existing goals for this student
  const existingGoals = await db
    .select({ id: schema.goals.id })
    .from(schema.goals)
    .where(eq(schema.goals.userId, student.id));

  for (const g of existingGoals) {
    await db.delete(schema.weeklyMilestones).where(eq(schema.weeklyMilestones.goalId, g.id));
    await db.delete(schema.goals).where(eq(schema.goals.id, g.id));
  }
  if (existingGoals.length > 0) console.log(`  Cleared ${existingGoals.length} existing goals`);

  const now = new Date();

  for (const goalData of SAMPLE_GOALS) {
    const goalId = createId();

    await db.insert(schema.goals).values({
      id: goalId,
      userId: student.id,
      goalType: goalData.goalType,
      goalStatement: goalData.goalStatement,
      specificDetails: goalData.specificDetails,
      measurableCriteria: goalData.measurableCriteria,
      achievableResources: goalData.achievableResources,
      relevantAlignment: goalData.relevantAlignment,
      excitingMotivation: goalData.excitingMotivation,
      rewardingBenefits: goalData.rewardingBenefits,
      status: "active",
      approvalStatus: "approved",
      createdAt: now,
      updatedAt: now,
    });

    for (const m of goalData.milestones) {
      await db.insert(schema.weeklyMilestones).values({
        id: createId(),
        goalId,
        weekNumber: m.week,
        milestoneDescription: m.milestone,
        actions: JSON.stringify(m.actions),
        results: JSON.stringify(m.results),
        cumulativePercentage: m.pct,
        approvalStatus: "approved",
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`  ✓ ${goalData.goalType} goal + ${goalData.milestones.length} milestones`);
  }

  console.log("\nDone! Login with: studentleap99beta2");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
