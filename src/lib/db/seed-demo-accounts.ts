/**
 * Seed Demo Accounts for GG
 * Creates 11 demo users (HC + 2 coaches + 8 students) with real goals from APA
 *
 * Run: npx tsx src/lib/db/seed-demo-accounts.ts
 */

import { db } from "./index";
import { users, goals } from "./schema";
import { hashPassword } from "@/lib/auth/password";
import { createId } from "@paralleldrive/cuid2";

// Real goal templates from LEAP 99 APA
const GOAL_TEMPLATES = {
  set1: {
    enrollment: {
      goal: "Complete FLEX course on emotional intelligence",
      specific: "Attend all 4 FLEX sessions on EI modules",
      measurable: "Achieve 80%+ on EI assessment",
      achievable: "Use LEAP 99 resources + peer coaching",
      relevant: "Aligns with LEAP 99 EI pathway",
      excitement: "Excited to deepen emotional awareness",
      reward: "Better conflict resolution skills",
      values: "Integrity, Self-awareness, Growth mindset",
    },
    personal: {
      goal: "Establish consistent morning fitness routine",
      specific: "Jog or yoga 3x per week, 30 min minimum",
      measurable: "Complete 12 sessions in 4 weeks",
      achievable: "Use home equipment + park nearby",
      relevant: "Supports physical health & stress management",
      excitement: "Looking forward to increased energy",
      reward: "Improved stamina and mental clarity",
      values: "Health, Discipline, Self-care",
    },
    professional: {
      goal: "Lead one mentoring session with peer",
      specific: "Coach one peer on goal-setting framework",
      measurable: "Complete mentoring session + feedback",
      achievable: "Use PEAR model from APA training",
      relevant: "Builds leadership capabilities",
      excitement: "Excited to help others grow",
      reward: "Develop coaching skills",
      values: "Service, Leadership, Empowerment",
    },
  },
  set2: {
    enrollment: {
      goal: "Master ALC (Affinity Learning Community) skills",
      specific: "Attend all ALC sessions + complete 3 peer interviews",
      measurable: "Document 5 key learnings from ALC",
      achievable: "Active participation in assigned ALC",
      relevant: "Core to LEAP 99 community learning",
      excitement: "Energized by peer learning connections",
      reward: "Expanded network and fresh perspectives",
      values: "Community, Collaboration, Curiosity",
    },
    personal: {
      goal: "Develop mindfulness practice",
      specific: "Daily meditation or journaling, 15 min",
      measurable: "Maintain 20-day streak",
      achievable: "Use Insight Timer app + journal",
      relevant: "Enhances emotional regulation",
      excitement: "Curious about meditation benefits",
      reward: "Greater inner peace and clarity",
      values: "Mindfulness, Balance, Reflection",
    },
    professional: {
      goal: "Complete one project-based leadership challenge",
      specific: "Lead small team project or initiative",
      measurable: "Deliver project on time with team feedback",
      achievable: "Leverage LEAP 99 project opportunities",
      relevant: "Demonstrates applied leadership",
      excitement: "Motivated by tangible impact",
      reward: "Proven leadership track record",
      values: "Excellence, Impact, Accountability",
    },
  },
  set3: {
    enrollment: {
      goal: "Participate fully in 2 intensive workshops",
      specific: "Attend both scheduled intensives + all pre-work",
      measurable: "Complete reflection journal after each",
      achievable: "Committed LEAP 99 participant",
      relevant: "Intensives are core learning events",
      excitement: "Anticipating breakthrough moments",
      reward: "Major skill development + inspiration",
      values: "Growth, Commitment, Transformation",
    },
    personal: {
      goal: "Improve work-life balance",
      specific: "Set work boundaries (no emails after 7pm)",
      measurable: "Track compliance for 4 weeks",
      achievable: "Turn off work notifications",
      relevant: "Prevents burnout, improves wellbeing",
      excitement: "Looking forward to family time",
      reward: "Reduced stress and better relationships",
      values: "Balance, Family, Wellbeing",
    },
    professional: {
      goal: "Give feedback to three peers",
      specific: "Conduct 1-on-1 feedback sessions with 3 peers",
      measurable: "Receive confirmation of positive impact",
      achievable: "Use feedback frameworks from training",
      relevant: "Builds coaching and communication skills",
      excitement: "Passionate about peer development",
      reward: "Stronger peer relationships",
      values: "Honesty, Support, Growth",
    },
  },
};

const DEMO_ACCOUNTS = [
  // HC
  {
    id: "demo_hc",
    email: "hc@leap99.test",
    name: "Head Coach Demo",
    role: "head_coach" as const,
    councilId: null,
  },
  // Coach Iya (Kinder)
  {
    id: "demo_coach_iya",
    email: "coach.iya@leap99.test",
    name: "Coach Iya (Kinder)",
    role: "coach" as const,
    councilId: "council_kinder",
  },
  // Coach RJ (Mary-g)
  {
    id: "demo_coach_rj",
    email: "coach.rj@leap99.test",
    name: "Coach RJ (Mary-g)",
    role: "coach" as const,
    councilId: "council_maryg",
  },
  // Students under Coach Iya
  {
    id: "demo_student_1a",
    email: "student.1a@leap99.test",
    name: "Demo Student 1a (Kinder)",
    role: "student" as const,
    councilId: "council_kinder",
    coachId: "demo_coach_iya",
    goalSet: "set1",
  },
  {
    id: "demo_student_1b",
    email: "student.1b@leap99.test",
    name: "Demo Student 1b (Kinder)",
    role: "student" as const,
    councilId: "council_kinder",
    coachId: "demo_coach_iya",
    goalSet: "set2",
  },
  {
    id: "demo_student_1c",
    email: "student.1c@leap99.test",
    name: "Demo Student 1c (Kinder)",
    role: "student" as const,
    councilId: "council_kinder",
    coachId: "demo_coach_iya",
    goalSet: "set3",
  },
  {
    id: "demo_student_1d",
    email: "student.1d@leap99.test",
    name: "Demo Student 1d (Kinder)",
    role: "student" as const,
    councilId: "council_kinder",
    coachId: "demo_coach_iya",
    goalSet: "set1",
  },
  // Students under Coach RJ
  {
    id: "demo_student_2a",
    email: "student.2a@leap99.test",
    name: "Demo Student 2a (Mary-g)",
    role: "student" as const,
    councilId: "council_maryg",
    coachId: "demo_coach_rj",
    goalSet: "set2",
  },
  {
    id: "demo_student_2b",
    email: "student.2b@leap99.test",
    name: "Demo Student 2b (Mary-g)",
    role: "student" as const,
    councilId: "council_maryg",
    coachId: "demo_coach_rj",
    goalSet: "set3",
  },
  {
    id: "demo_student_2c",
    email: "student.2c@leap99.test",
    name: "Demo Student 2c (Mary-g)",
    role: "student" as const,
    councilId: "council_maryg",
    coachId: "demo_coach_rj",
    goalSet: "set1",
  },
  {
    id: "demo_student_2d",
    email: "student.2d@leap99.test",
    name: "Demo Student 2d (Mary-g)",
    role: "student" as const,
    councilId: "council_maryg",
    coachId: "demo_coach_rj",
    goalSet: "set2",
  },
];

async function seedDemoAccounts() {
  console.log("🌱 Seeding demo accounts...");

  const now = new Date();
  const passwordHash = await hashPassword("demo123");

  // 1. Create or update users
  for (const account of DEMO_ACCOUNTS) {
    const { goalSet, coachId, ...userData } = account as any;

    try {
      await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email,
          passwordHash,
          name: userData.name,
          role: userData.role,
          councilId: userData.councilId,
          approvalStatus: "approved",
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: userData.name,
            updatedAt: now,
          },
        });

      console.log(`✓ ${userData.name}`);
    } catch (err) {
      console.error(`✗ Failed to create ${userData.name}:`, err);
    }
  }

  // 2. Create goals for students
  for (const account of DEMO_ACCOUNTS) {
    if (account.role !== "student") continue;

    const goalSet = (GOAL_TEMPLATES as any)[account.goalSet as any];
    if (!goalSet) continue;

    const goalTypes = ["enrollment", "personal", "professional"] as const;

    for (const goalType of goalTypes) {
      const template = goalSet[goalType];

      try {
        await db
          .insert(goals)
          .values({
            id: createId(),
            userId: account.id,
            goalType,
            goalStatement: template.goal,
            specificDetails: template.specific,
            measurableCriteria: template.measurable,
            achievableResources: template.achievable,
            relevantAlignment: template.relevant,
            excitingMotivation: template.excitement,
            rewardingBenefits: template.reward,
            valuesDeclaration: template.values,
            status: "in_progress",
            approvalStatus: "approved",
            approvedAt: now,
            createdAt: now,
            updatedAt: now,
          });
      } catch (err) {
        console.error(
          `✗ Failed to create ${goalType} goal for ${account.name}:`,
          err
        );
      }
    }

    console.log(`✓ Goals created for ${account.name}`);
  }

  console.log("\n✅ Demo accounts seeded successfully!");
  console.log(
    "\nDemo Passcodes for LoginForm:\n" +
      "HC: hc@leap99.test\n" +
      "Coach Iya: coach.iya@leap99.test\n" +
      "Coach RJ: coach.rj@leap99.test\n" +
      "Student 1a-1d: student.1a@leap99.test, etc.\n"
  );
}

seedDemoAccounts().catch(console.error);
