"use server";

import { db } from "@/lib/db";
import {
  users,
  councils,
  declarations,
} from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, and, inArray, desc } from "drizzle-orm";
import { getCurrentWeek, getTotalWeeks, getUserProgress } from "@/lib/progress";

export async function getBatchMetrics() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const [currentWeek, totalWeeks] = await Promise.all([getCurrentWeek(), getTotalWeeks()]);

  const allCoaches = await db
    .select()
    .from(users)
    .where(inArray(users.role, ["coach", "head_coach"]));

  const allStudents = await db
    .select()
    .from(users)
    .where(inArray(users.role, ["student", "council_leader"]));

  // Calculate team goal achievement: avg of all students' avg progress
  let totalPct = 0;
  let count = 0;
  for (const student of allStudents) {
    const prog = await getUserProgress(student.id, currentWeek, totalWeeks);
    const avg = (prog.enrollment + prog.personal + prog.professional) / 3;
    totalPct += avg;
    count++;
  }

  return {
    coachCount: allCoaches.length,
    studentCount: allStudents.length,
    teamGoalAchievement: count > 0 ? Math.round(totalPct / count) : 0,
    currentWeek,
  };
}

export async function getCoachesWithDetails() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const [currentWeek, totalWeeks] = await Promise.all([getCurrentWeek(), getTotalWeeks()]);

  const allCoaches = await db
    .select()
    .from(users)
    .where(inArray(users.role, ["coach", "head_coach"]));

  const allCouncils = await db.select().from(councils);

  const result = [];
  for (const coach of allCoaches) {
    // Coach's declaration
    const [decl] = await db
      .select({ text: declarations.text })
      .from(declarations)
      .where(eq(declarations.userId, coach.id))
      .orderBy(desc(declarations.updatedAt))
      .limit(1);

    // Coach's own goal progress
    const prog = await getUserProgress(coach.id, currentWeek, totalWeeks);
    const avgGoalAchievement = Math.round(
      (prog.enrollment + prog.personal + prog.professional) / 3
    );

    // Councils assigned to this coach (head_coach oversees all councils)
    const coachCouncils = coach.role === "head_coach"
      ? allCouncils
      : allCouncils.filter((c) => c.coachId === coach.id);

    // Get students in coach's councils
    const councilIds = coachCouncils.map((c) => c.id);
    let councilStudents: typeof allCoaches = [];
    if (councilIds.length > 0) {
      councilStudents = await db
        .select()
        .from(users)
        .where(
          and(inArray(users.role, ["student", "council_leader"]), inArray(users.councilId, councilIds))
        );
    }

    // Council avg progress
    let councilTotal = 0;
    let councilCount = 0;
    for (const s of councilStudents) {
      const sp = await getUserProgress(s.id, currentWeek, totalWeeks);
      councilTotal += (sp.enrollment + sp.personal + sp.professional) / 3;
      councilCount++;
    }

    result.push({
      id: coach.id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
      approvalStatus: coach.approvalStatus,
      declaration: decl?.text || null,
      councils: coachCouncils.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      studentCount: councilStudents.length,
      enrollmentProgress: prog.enrollment,
      personalProgress: prog.personal,
      professionalProgress: prog.professional,
      enrollmentResults: prog.enrollmentResults,
      personalResults: prog.personalResults,
      professionalResults: prog.professionalResults,
      enrollmentCurrentWeek: prog.enrollmentCurrentWeek,
      personalCurrentWeek: prog.personalCurrentWeek,
      professionalCurrentWeek: prog.professionalCurrentWeek,
      avgGoalAchievement,
      councilAvgProgress:
        councilCount > 0 ? Math.round(councilTotal / councilCount) : 0,
    });
  }

  return result;
}

export async function getAllStudentsWithDetails() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const [currentWeek, totalWeeks] = await Promise.all([getCurrentWeek(), getTotalWeeks()]);

  const allStudents = await db
    .select()
    .from(users)
    .where(inArray(users.role, ["student", "council_leader"]));

  const allCouncils = await db.select().from(councils);
  const allUsers = await db.select({ id: users.id, name: users.name }).from(users);

  const result = [];
  for (const student of allStudents) {
    const [decl] = await db
      .select({ text: declarations.text })
      .from(declarations)
      .where(eq(declarations.userId, student.id))
      .orderBy(desc(declarations.updatedAt))
      .limit(1);

    const prog = await getUserProgress(student.id, currentWeek, totalWeeks);
    const avgGoalAchievement = Math.round(
      (prog.enrollment + prog.personal + prog.professional) / 3
    );

    const council = allCouncils.find((c) => c.id === student.councilId);
    const coach = council
      ? allUsers.find((u) => u.id === council.coachId)
      : null;

    result.push({
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      declaration: decl?.text || null,
      councilId: council?.id || null,
      councilName: council?.name || "Unassigned",
      coachName: coach?.name || "Unassigned",
      enrollmentProgress: prog.enrollment,
      personalProgress: prog.personal,
      professionalProgress: prog.professional,
      enrollmentResults: prog.enrollmentResults,
      personalResults: prog.personalResults,
      professionalResults: prog.professionalResults,
      enrollmentCurrentWeek: prog.enrollmentCurrentWeek,
      personalCurrentWeek: prog.personalCurrentWeek,
      professionalCurrentWeek: prog.professionalCurrentWeek,
      avgGoalAchievement,
    });
  }

  return result;
}

export async function getCouncilRankings() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const [currentWeek, totalWeeks] = await Promise.all([getCurrentWeek(), getTotalWeeks()]);

  const allCouncils = await db.select().from(councils);
  const allUsers = await db
    .select({ id: users.id, name: users.name, role: users.role, councilId: users.councilId })
    .from(users);

  // Head coach name for display on council cards
  const headCoach = allUsers.find((u) => u.role === "head_coach");

  const rankings = [];
  for (const council of allCouncils) {
    const adminCoach = allUsers.find((u) => u.id === council.coachId);
    const leader = allUsers.find((u) => u.councilId === council.id && u.role === "council_leader");
    const students = allUsers.filter(
      (u) => u.councilId === council.id && (u.role === "student" || u.role === "council_leader")
    );

    let enrollmentTotal = 0;
    let personalTotal = 0;
    let professionalTotal = 0;
    let enrollmentResultsTotal = 0;
    let personalResultsTotal = 0;
    let professionalResultsTotal = 0;
    let enrollmentCWTotal = 0;
    let personalCWTotal = 0;
    let professionalCWTotal = 0;

    for (const student of students) {
      const prog = await getUserProgress(student.id, currentWeek, totalWeeks);
      enrollmentTotal += prog.enrollment;
      personalTotal += prog.personal;
      professionalTotal += prog.professional;
      enrollmentResultsTotal += prog.enrollmentResults;
      personalResultsTotal += prog.personalResults;
      professionalResultsTotal += prog.professionalResults;
      enrollmentCWTotal += prog.enrollmentCurrentWeek;
      personalCWTotal += prog.personalCurrentWeek;
      professionalCWTotal += prog.professionalCurrentWeek;
    }

    const count = students.length || 1;
    const enrollmentAvg = Math.round(enrollmentTotal / count);
    const personalAvg = Math.round(personalTotal / count);
    const professionalAvg = Math.round(professionalTotal / count);
    const enrollmentResultsAvg = Math.round(enrollmentResultsTotal / count);
    const personalResultsAvg = Math.round(personalResultsTotal / count);
    const professionalResultsAvg = Math.round(professionalResultsTotal / count);
    const enrollmentCWAvg = Math.round(enrollmentCWTotal / count);
    const personalCWAvg = Math.round(personalCWTotal / count);
    const professionalCWAvg = Math.round(professionalCWTotal / count);
    const avgGoalAchievement = Math.round(
      (enrollmentAvg + personalAvg + professionalAvg) / 3
    );
    const avgResults = Math.round(
      (enrollmentResultsAvg + personalResultsAvg + professionalResultsAvg) / 3
    );
    const avgCurrentWeek = Math.round(
      (enrollmentCWAvg + personalCWAvg + professionalCWAvg) / 3
    );

    rankings.push({
      id: council.id,
      name: council.name,
      coachName: headCoach?.name || "Unassigned",
      adminCoachName: adminCoach?.name || "Unassigned",
      leaderName: leader?.name || null,
      studentCount: students.length,
      enrollmentAvg,
      personalAvg,
      professionalAvg,
      enrollmentResultsAvg,
      personalResultsAvg,
      professionalResultsAvg,
      enrollmentCWAvg,
      personalCWAvg,
      professionalCWAvg,
      avgGoalAchievement,
      avgResults,
      avgCurrentWeek,
    });
  }

  // Sort by achievement descending
  rankings.sort((a, b) => b.avgGoalAchievement - a.avgGoalAchievement);

  // Add rank and status
  return rankings.map((r, i) => ({
    ...r,
    rank: i + 1,
    status:
      r.avgGoalAchievement >= 70
        ? ("on_track" as const)
        : r.avgGoalAchievement >= 40
        ? ("needs_attention" as const)
        : ("needs_support" as const),
  }));
}
