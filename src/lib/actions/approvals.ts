"use server";

import { db } from "@/lib/db";
import {
  users,
  goals,
  declarations,
  weeklyMilestones,
  councils,
} from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

// ─── Helper: Check if coach owns student's council ─────────────────────────

async function coachOwnsStudent(coachUserId: string, studentId: string) {
  // Find coach's council
  const [council] = await db
    .select()
    .from(councils)
    .where(eq(councils.coachId, coachUserId))
    .limit(1);
  if (!council) return false;

  // Check student belongs to that council
  const [student] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.councilId, council.id)))
    .limit(1);
  return !!student;
}

// ─── Head Coach: Approve/Reject Coach ──────────────────────────────────────

export async function approveCoach(
  coachId: string,
  status: "approved" | "rejected"
) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden: only the head coach can approve coaches");
  }

  const [coach] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, coachId), eq(users.role, "coach")))
    .limit(1);
  if (!coach) throw new Error("Coach not found");

  await db
    .update(users)
    .set({
      approvalStatus: status,
      approvedBy: user.userId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, coachId));

  revalidatePath("/l1");
  return { success: true };
}

// ─── Coach: Approve/Reject Student Milestone ───────────────────────────────

export async function approveMilestone(
  milestoneId: string,
  status: "approved" | "rejected"
) {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden: only coaches can approve milestones");
  }

  // Get milestone and its goal to find the student
  const [milestone] = await db
    .select()
    .from(weeklyMilestones)
    .where(eq(weeklyMilestones.id, milestoneId))
    .limit(1);
  if (!milestone) throw new Error("Milestone not found");

  const [goal] = await db
    .select()
    .from(goals)
    .where(eq(goals.id, milestone.goalId))
    .limit(1);
  if (!goal) throw new Error("Goal not found");

  // Verify coach owns this student (unless head_coach)
  if (user.role === "coach") {
    const owns = await coachOwnsStudent(user.userId, goal.userId);
    if (!owns) throw new Error("Forbidden: student not in your council");
  }

  await db
    .update(weeklyMilestones)
    .set({
      approvalStatus: status,
      approvedBy: user.userId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(weeklyMilestones.id, milestoneId));

  revalidatePath("/l3");
  return { success: true };
}

// ─── Coach: Approve/Reject Student Declaration ─────────────────────────────

export async function approveDeclaration(
  declarationId: string,
  status: "approved" | "rejected"
) {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden: only coaches can approve declarations");
  }

  const [declaration] = await db
    .select()
    .from(declarations)
    .where(eq(declarations.id, declarationId))
    .limit(1);
  if (!declaration) throw new Error("Declaration not found");

  // Verify coach owns this student (unless head_coach)
  if (user.role === "coach") {
    const owns = await coachOwnsStudent(user.userId, declaration.userId);
    if (!owns) throw new Error("Forbidden: student not in your council");
  }

  await db
    .update(declarations)
    .set({
      approvalStatus: status,
      approvedBy: user.userId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(declarations.id, declarationId));

  revalidatePath("/l3");
  return { success: true };
}

// ─── Coach: Approve/Reject Student Goal ────────────────────────────────────

export async function approveGoal(
  goalId: string,
  status: "approved" | "rejected"
) {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden: only coaches can approve goals");
  }

  const [goal] = await db
    .select()
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);
  if (!goal) throw new Error("Goal not found");

  // Verify coach owns this student (unless head_coach)
  if (user.role === "coach") {
    const owns = await coachOwnsStudent(user.userId, goal.userId);
    if (!owns) throw new Error("Forbidden: student not in your council");
  }

  await db
    .update(goals)
    .set({
      approvalStatus: status,
      approvedBy: user.userId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(goals.id, goalId));

  revalidatePath("/l3");
  return { success: true };
}

// ─── Get Pending Approvals for Coach ───────────────────────────────────────

export async function getPendingApprovals() {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden");
  }

  const results: {
    type: "coach" | "declaration" | "goal" | "milestone";
    id: string;
    studentName: string | null;
    studentId: string;
    detail: string;
    createdAt: Date;
  }[] = [];

  if (user.role === "head_coach") {
    // Pending coach approvals
    const pendingCoaches = await db
      .select()
      .from(users)
      .where(
        and(eq(users.role, "coach"), eq(users.approvalStatus, "pending"))
      );
    for (const coach of pendingCoaches) {
      results.push({
        type: "coach",
        id: coach.id,
        studentName: coach.name,
        studentId: coach.id,
        detail: `Coach: ${coach.name} (${coach.email})`,
        createdAt: coach.createdAt,
      });
    }
  }

  // Find students in coach's council(s)
  let studentIds: string[] = [];
  if (user.role === "coach") {
    const coachCouncils = await db
      .select()
      .from(councils)
      .where(eq(councils.coachId, user.userId));
    const councilIds = coachCouncils.map((c) => c.id);

    for (const cId of councilIds) {
      const students = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.councilId, cId));
      studentIds.push(...students.map((s) => s.id));
    }
  } else {
    // Head coach sees all students
    const allStudents = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.role, ["student", "council_leader"]));
    studentIds = allStudents.map((s) => s.id);
  }

  // Pending declarations
  for (const sid of studentIds) {
    const pendingDecls = await db
      .select()
      .from(declarations)
      .where(
        and(
          eq(declarations.userId, sid),
          eq(declarations.approvalStatus, "pending")
        )
      );
    const [student] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, sid))
      .limit(1);

    for (const decl of pendingDecls) {
      results.push({
        type: "declaration",
        id: decl.id,
        studentName: student?.name || null,
        studentId: sid,
        detail: `Declaration: "${decl.text}"`,
        createdAt: decl.createdAt,
      });
    }

    // Pending goals
    const pendingGoals = await db
      .select()
      .from(goals)
      .where(
        and(eq(goals.userId, sid), eq(goals.approvalStatus, "pending"))
      );
    for (const goal of pendingGoals) {
      results.push({
        type: "goal",
        id: goal.id,
        studentName: student?.name || null,
        studentId: sid,
        detail: `${goal.goalType} Goal: "${goal.goalStatement.substring(0, 80)}..."`,
        createdAt: goal.createdAt,
      });
    }

    // Pending milestones
    const studentGoals = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.userId, sid));
    for (const sg of studentGoals) {
      const pendingMs = await db
        .select()
        .from(weeklyMilestones)
        .where(
          and(
            eq(weeklyMilestones.goalId, sg.id),
            eq(weeklyMilestones.approvalStatus, "pending")
          )
        );
      for (const ms of pendingMs) {
        if (ms.milestoneDescription || ms.actions) {
          results.push({
            type: "milestone",
            id: ms.id,
            studentName: student?.name || null,
            studentId: sid,
            detail: `Week ${ms.weekNumber}: ${ms.milestoneDescription || "Milestone"}`,
            createdAt: ms.createdAt,
          });
        }
      }
    }
  }

  return results;
}
