"use server";

import { db } from "@/lib/db";
import {
  users,
  councils,
  goals,
  declarations,
  batches,
  weeklyMilestones,
} from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, and, inArray, lte, desc } from "drizzle-orm";
import { getCurrentWeek, getUserProgress } from "@/lib/progress";
import { computeCurrentWeekFromDate } from "@/lib/utils/week-targets";

export type WeekHistoryEntry = {
  week: number;
  enrollment: { results: number; actionPlan: number };
  personal: { results: number; actionPlan: number };
  professional: { results: number; actionPlan: number };
  total: { results: number; actionPlan: number };
};

// Get the coach's council(s) and IDs
async function getCoachContext(userId: string, role?: string) {
  let isFullView = role === "head_coach";
  if (role === "coach" && !isFullView) {
    const [u] = await db
      .select({ canViewAllCouncils: users.canViewAllCouncils })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    isFullView = (u?.canViewAllCouncils ?? 0) === 1;
  }

  const coachCouncils = isFullView
    ? await db.select().from(councils)
    : await db.select().from(councils).where(eq(councils.coachId, userId));

  const councilIds = coachCouncils.map((c) => c.id);
  let students: typeof allStudents = [];
  let allStudents: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    councilId: string | null;
  }[] = [];

  if (councilIds.length > 0) {
    allStudents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        councilId: users.councilId,
      })
      .from(users)
      .where(
        and(inArray(users.role, ["student", "council_leader"]), inArray(users.councilId, councilIds))
      );
    students = allStudents;
  }

  return { councils: coachCouncils, students, councilIds };
}

export async function getCoachMetrics() {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden");
  }

  const currentWeek = await getCurrentWeek();
  const { councils: coachCouncils, students } = await getCoachContext(
    user.userId,
    user.role
  );

  const [batchRow] = await db.select({ id: batches.id, startDate: batches.startDate, weeklyTargets: batches.weeklyTargets, totalWeeks: batches.totalWeeks }).from(batches).limit(1);
  const batchStartDate = batchRow?.startDate ?? "2026-02-02";
  const batchId = batchRow?.id ?? "";
  // Compute reporting week from real calendar date, not DB setting
  const dateComputedCurrentWeek = computeCurrentWeekFromDate(batchStartDate, batchRow?.totalWeeks ?? 12);
  const reportingWeek = Math.max(1, dateComputedCurrentWeek - 1);

  let weeklyTargets: Record<string, { min: number; max: number }> = {};
  if (batchRow?.weeklyTargets) {
    const raw = JSON.parse(batchRow.weeklyTargets);
    for (const [k, v] of Object.entries(raw)) {
      if (v && typeof v === "object" && "min" in (v as object) && "max" in (v as object)) {
        weeklyTargets[k] = v as { min: number; max: number };
      } else {
        const n = Number(v) || 0;
        weeklyTargets[k] = { min: Math.max(0, n - 2), max: Math.min(100, n + 2) };
      }
    }
  }

  const batchTotalWeeks = batchRow?.totalWeeks ?? 12;

  // Coach's own goal progress
  const ownProgress = await getUserProgress(user.userId, currentWeek, batchTotalWeeks);
  const ownAvg = Math.round(
    (ownProgress.enrollment + ownProgress.personal + ownProgress.professional) / 3
  );
  const ownResultsAvg = Math.round(
    (ownProgress.enrollmentResults + ownProgress.personalResults + ownProgress.professionalResults) / 3
  );
  const ownCurrentWeekAvg = Math.round(
    (ownProgress.enrollmentCurrentWeek + ownProgress.personalCurrentWeek + ownProgress.professionalCurrentWeek) / 3
  );

  // Council goal achievement: avg of all students' avg progress
  let totalPct = 0;
  let totalEnrR = 0, totalPerR = 0, totalProR = 0;
  let totalEnrA = 0, totalPerA = 0, totalProA = 0;
  for (const student of students) {
    const prog = await getUserProgress(student.id, currentWeek, batchTotalWeeks);
    totalPct += (prog.enrollment + prog.personal + prog.professional) / 3;
    totalEnrR += prog.enrollmentResults;
    totalPerR += prog.personalResults;
    totalProR += prog.professionalResults;
    totalEnrA += prog.enrollmentCurrentWeek;
    totalPerA += prog.personalCurrentWeek;
    totalProA += prog.professionalCurrentWeek;
  }
  const n = students.length || 1;
  const enrollmentResults = Math.round(totalEnrR / n);
  const personalResults = Math.round(totalPerR / n);
  const professionalResults = Math.round(totalProR / n);
  const councilGoalAchievement =
    students.length > 0
      ? Math.round((enrollmentResults + personalResults + professionalResults) / 3)
      : 0;
  const enrollmentActionPlan = Math.round(totalEnrA / n);
  const personalActionPlan = Math.round(totalPerA / n);
  const professionalActionPlan = Math.round(totalProA / n);

  // Count pending approvals (goals + milestones + declarations)
  let pendingCount = 0;
  for (const student of students) {
    const pendingGoals = await db
      .select({ id: goals.id })
      .from(goals)
      .where(and(eq(goals.userId, student.id), eq(goals.approvalStatus, "pending")));
    pendingCount += pendingGoals.length;

    const pendingDecls = await db
      .select({ id: declarations.id })
      .from(declarations)
      .where(
        and(
          eq(declarations.userId, student.id),
          eq(declarations.approvalStatus, "pending")
        )
      );
    pendingCount += pendingDecls.length;
  }

  return {
    councilCount: coachCouncils.length,
    councilNames: coachCouncils.map((c) => c.name),
    studentCount: students.length,
    councilGoalAchievement,
    enrollmentResults,
    personalResults,
    professionalResults,
    enrollmentActionPlan,
    personalActionPlan,
    professionalActionPlan,
    ownGoalProgress: ownAvg,
    ownGoalResults: ownResultsAvg,
    ownGoalCurrentWeek: ownCurrentWeekAvg,
    pendingApprovals: pendingCount,
    currentWeek,
    batchStartDate,
    batchId,
    weeklyTargets,
    reportingWeek,
  };
}

export async function getCoachStudentsWithDetails() {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden");
  }

  const [currentWeek, batchForStudents] = await Promise.all([
    getCurrentWeek(),
    db.select({ totalWeeks: batches.totalWeeks }).from(batches).limit(1).then(r => r[0]),
  ]);
  const studentListTotalWeeks = batchForStudents?.totalWeeks ?? 12;

  const { councils: coachCouncils, students } = await getCoachContext(
    user.userId,
    user.role
  );

  const councilMap = new Map(coachCouncils.map((c) => [c.id, c.name]));

  const result = [];
  for (const student of students) {
    const [decl] = await db
      .select({ text: declarations.text })
      .from(declarations)
      .where(eq(declarations.userId, student.id))
      .orderBy(desc(declarations.updatedAt))
      .limit(1);

    const prog = await getUserProgress(student.id, currentWeek, studentListTotalWeeks);
    const avgGoalAchievement = Math.round(
      (prog.enrollment + prog.personal + prog.professional) / 3
    );

    result.push({
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      declaration: decl?.text || null,
      councilName: student.councilId
        ? councilMap.get(student.councilId) || "Unknown"
        : "Unassigned",
      enrollmentProgress: prog.enrollment,
      personalProgress: prog.personal,
      professionalProgress: prog.professional,
      avgGoalAchievement,
    });
  }

  return result;
}

// Returns per-week milestone & action-step averages for all students under this coach.
// Used by PerformanceBanner dropdown + chart.
export async function getTeamWeeklyHistory(): Promise<WeekHistoryEntry[]> {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) throw new Error("Forbidden");

  const currentWeek = await getCurrentWeek();
  const [batchRow] = await db.select({ totalWeeks: batches.totalWeeks }).from(batches).limit(1);
  const totalWeeks = batchRow?.totalWeeks ?? 12;

  const { students } = await getCoachContext(user.userId, user.role);
  if (students.length === 0) return [];

  const studentIds = students.map((s) => s.id);

  // Fetch all weekly milestone rows for all students up to currentWeek
  const allRows = await db
    .select({
      userId: goals.userId,
      goalType: goals.goalType,
      weekNumber: weeklyMilestones.weekNumber,
      cumulativePercentage: weeklyMilestones.cumulativePercentage,
    })
    .from(weeklyMilestones)
    .innerJoin(goals, eq(weeklyMilestones.goalId, goals.id))
    .where(and(inArray(goals.userId, studentIds), lte(weeklyMilestones.weekNumber, currentWeek)));

  const result: WeekHistoryEntry[] = [];

  for (let week = 1; week <= currentWeek; week++) {
    const cap = Math.round((week / totalWeeks) * 100);
    let eTotal = 0, pTotal = 0, proTotal = 0;

    for (const studentId of studentIds) {
      const getLatest = (type: string) => {
        const rows = allRows
          .filter(r => r.userId === studentId && r.goalType === type && r.weekNumber <= week && (r.cumulativePercentage || 0) > 0)
          .sort((a, b) => b.weekNumber - a.weekNumber);
        const latest = rows[0];
        if (!latest) return 0;
        const latestCap = Math.round((latest.weekNumber / totalWeeks) * 100);
        return Math.min(latest.cumulativePercentage || 0, latestCap);
      };
      eTotal += getLatest("enrollment");
      pTotal += getLatest("personal");
      proTotal += getLatest("professional");
    }

    const n = studentIds.length;
    const e = Math.round(eTotal / n);
    const p = Math.round(pTotal / n);
    const pro = Math.round(proTotal / n);

    // Action steps: derived from cumulative progress (completed weeks / elapsed weeks × 100)
    const actionPlan = (pct: number) => {
      const derived = Math.round((pct * totalWeeks) / 100);
      return Math.min(100, week > 0 ? Math.round((derived / week) * 100) : 0);
    };

    result.push({
      week,
      enrollment: { results: e, actionPlan: actionPlan(e) },
      personal: { results: p, actionPlan: actionPlan(p) },
      professional: { results: pro, actionPlan: actionPlan(pro) },
      total: {
        results: Math.round((e + p + pro) / 3),
        actionPlan: Math.round((actionPlan(e) + actionPlan(p) + actionPlan(pro)) / 3),
      },
    });
  }

  return result;
}
