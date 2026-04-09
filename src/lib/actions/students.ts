"use server";

import { db } from "@/lib/db";
import { users, declarations, goals, weeklyMilestones, batches, buddies, councils, directMessages } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/jwt";
import { eq, and, lte, desc, isNull, not } from "drizzle-orm";
import { getCurrentWeek, getUserProgress } from "@/lib/progress";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import type { WeekHistoryEntry } from "./coach-overview";

export async function getStudentDetail(studentId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const currentWeek = await getCurrentWeek();

  const [student] = await db
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (!student) throw new Error("Student not found");

  const prog = await getUserProgress(studentId, currentWeek);

  // Latest approved declaration (for display)
  const [approvedDecl] = await db
    .select({ id: declarations.id, text: declarations.text })
    .from(declarations)
    .where(and(eq(declarations.userId, studentId), eq(declarations.approvalStatus, "approved")))
    .orderBy(desc(declarations.updatedAt))
    .limit(1);

  // Latest pending declaration (awaiting coach approval)
  const [pendingDecl] = await db
    .select({ id: declarations.id, text: declarations.text })
    .from(declarations)
    .where(and(eq(declarations.userId, studentId), eq(declarations.approvalStatus, "pending")))
    .orderBy(desc(declarations.updatedAt))
    .limit(1);

  // Buddy name
  const [buddyRow] = await db
    .select({ buddyId: buddies.buddyId })
    .from(buddies)
    .where(eq(buddies.studentId, studentId))
    .limit(1);
  let buddyName: string | null = null;
  if (buddyRow) {
    const [buddyUser] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, buddyRow.buddyId)).limit(1);
    buddyName = buddyUser?.name ?? buddyUser?.email ?? null;
  }

  // Council + coach name
  let councilName: string | null = null;
  let coachName: string | null = null;
  if (student.councilId) {
    const [council] = await db.select({ name: councils.name, coachId: councils.coachId }).from(councils).where(eq(councils.id, student.councilId)).limit(1);
    if (council) {
      councilName = council.name;
      const [coach] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, council.coachId)).limit(1);
      coachName = coach?.name ?? coach?.email ?? null;
    }
  }

  // Unread DM count — messages sent by the OTHER party (coach→student or student→coach)
  const unreadMsgs = await db
    .select({ senderId: directMessages.senderId })
    .from(directMessages)
    .where(and(
      eq(directMessages.studentId, studentId),
      isNull(directMessages.readAt),
      not(eq(directMessages.senderId, user.userId))
    ));
  const unreadDmCount = unreadMsgs.length;

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    pendingName: student.pendingName ?? null,
    declaration: approvedDecl?.text ?? pendingDecl?.text ?? null,
    pendingDeclarationId: pendingDecl?.id ?? null,
    pendingDeclarationText: pendingDecl?.text ?? null,
    buddyName,
    councilName,
    coachName,
    enrollmentProgress: prog.enrollment,
    personalProgress: prog.personal,
    professionalProgress: prog.professional,
    enrollmentResults: prog.enrollmentResults,
    personalResults: prog.personalResults,
    professionalResults: prog.professionalResults,
    enrollmentCurrentWeek: prog.enrollmentCurrentWeek,
    personalCurrentWeek: prog.personalCurrentWeek,
    professionalCurrentWeek: prog.professionalCurrentWeek,
    unreadDmCount,
  };
}

// ─── Student: propose a name change (pending coach approval) ──────────────────

export async function saveStudentName(newName: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (!newName.trim()) return { success: false, error: "Name is required" };

  await db.update(users)
    .set({ pendingName: newName.trim(), updatedAt: new Date() })
    .where(eq(users.id, user.userId));

  revalidatePath("/l3");
  return { success: true };
}

// ─── Student: submit a new declaration (pending coach approval) ───────────────

export async function saveMyDeclaration(text: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (!text.trim()) return { success: false, error: "Declaration is required" };

  // Cancel any existing pending declaration first
  await db.update(declarations)
    .set({ approvalStatus: "rejected", updatedAt: new Date() })
    .where(and(eq(declarations.userId, user.userId), eq(declarations.approvalStatus, "pending")));

  await db.insert(declarations).values({
    id: createId(),
    userId: user.userId,
    text: text.trim(),
    approvalStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/l3");
  return { success: true };
}

// ─── Coach: approve or reject a pending name change ───────────────────────────

export async function approveStudentNameChange(studentId: string, approve: boolean) {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) throw new Error("Forbidden");

  const [student] = await db.select({ name: users.name, pendingName: users.pendingName })
    .from(users).where(eq(users.id, studentId)).limit(1);
  if (!student || !student.pendingName) return { success: false, error: "No pending name" };

  await db.update(users)
    .set({
      name: approve ? student.pendingName : student.name,
      pendingName: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, studentId));

  revalidatePath("/l3");
  return { success: true };
}

export async function getStudentWeeklyHistory(studentId: string): Promise<WeekHistoryEntry[]> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const currentWeek = await getCurrentWeek();
  const [batchRow] = await db.select({ totalWeeks: batches.totalWeeks }).from(batches).limit(1);
  const totalWeeks = batchRow?.totalWeeks ?? 12;

  const allRows = await db
    .select({
      goalType: goals.goalType,
      weekNumber: weeklyMilestones.weekNumber,
      cumulativePercentage: weeklyMilestones.cumulativePercentage,
    })
    .from(weeklyMilestones)
    .innerJoin(goals, eq(weeklyMilestones.goalId, goals.id))
    .where(and(eq(goals.userId, studentId), lte(weeklyMilestones.weekNumber, currentWeek)));

  const result: WeekHistoryEntry[] = [];

  for (let week = 1; week <= currentWeek; week++) {
    const cap = Math.round((week / totalWeeks) * 100);
    const get = (type: string) => {
      const rows = allRows
        .filter(r => r.goalType === type && r.weekNumber <= week && (r.cumulativePercentage || 0) > 0)
        .sort((a, b) => b.weekNumber - a.weekNumber);
      const latest = rows[0];
      if (!latest) return 0;
      const latestCap = Math.round((latest.weekNumber / totalWeeks) * 100);
      return Math.min(latest.cumulativePercentage || 0, latestCap);
    };
    const e = get("enrollment");
    const p = get("personal");
    const pro = get("professional");
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
