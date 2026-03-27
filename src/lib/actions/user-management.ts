"use server";

import { db } from "@/lib/db";
import { users, councils, batches } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Head Coach: Add a Coach ──────────────────────────────────────────────

const addCoachSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  batchId: z.string().optional(),
});

export async function addCoach(data: z.infer<typeof addCoachSchema>) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden: only the head coach can add coaches");
  }

  const validated = addCoachSchema.parse(data);

  // Check for duplicate email
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1);
  if (existing.length > 0) {
    return { success: false, error: "Email already registered" };
  }

  // Get the batch ID (use first batch if not specified)
  let batchId: string | undefined = validated.batchId;
  if (!batchId) {
    const [batch] = await db.select().from(batches).limit(1);
    batchId = batch?.id ?? undefined;
  }

  const passwordHash = await hashPassword(validated.password);
  const now = new Date();
  const id = createId();

  await db.insert(users).values({
    id,
    email: validated.email,
    passwordHash,
    name: validated.name,
    role: "coach",
    batchId,
    approvalStatus: "approved",
    approvedBy: user.userId,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/l1");
  return { success: true, id };
}

// ─── Coach: Add a Student ─────────────────────────────────────────────────

const addStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  councilId: z.string().optional(),
});

export async function addStudent(data: z.infer<typeof addStudentSchema>) {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden: only coaches can add students");
  }

  const validated = addStudentSchema.parse(data);

  // Check for duplicate email
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1);
  if (existing.length > 0) {
    return { success: false, error: "Email already registered" };
  }

  // Determine which council to assign the student to
  let councilId: string | undefined = validated.councilId;
  if (!councilId && user.role === "coach") {
    // Find the coach's council
    const [council] = await db
      .select()
      .from(councils)
      .where(eq(councils.coachId, user.userId))
      .limit(1);
    councilId = council?.id ?? undefined;
  }

  // Get batch from council
  let batchId: string | undefined;
  if (councilId) {
    const [council] = await db
      .select()
      .from(councils)
      .where(eq(councils.id, councilId))
      .limit(1);
    batchId = council?.batchId ?? undefined;
  }

  // Fallback: if still no batchId, use the first batch (head coach adding unassigned student)
  if (!batchId) {
    const [batch] = await db.select().from(batches).limit(1);
    batchId = batch?.id ?? undefined;
  }

  const passwordHash = await hashPassword(validated.password);
  const now = new Date();
  const id = createId();

  await db.insert(users).values({
    id,
    email: validated.email,
    passwordHash,
    name: validated.name,
    role: "student",
    councilId: councilId ?? undefined,
    batchId,
    approvalStatus: "approved", // Students are auto-approved when added by coach
    approvedBy: user.userId,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/l2");
  return { success: true, id };
}

// ─── Head Coach: Update a Coach ───────────────────────────────────────────

const updateCoachSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export async function updateCoach(
  coachId: string,
  data: z.infer<typeof updateCoachSchema>
) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden: only the head coach can update coaches");
  }

  const validated = updateCoachSchema.parse(data);

  // Check coach exists
  const [coach] = await db
    .select()
    .from(users)
    .where(eq(users.id, coachId))
    .limit(1);
  if (!coach || coach.role !== "coach") {
    return { success: false, error: "Coach not found" };
  }

  // Check email uniqueness (excluding current coach)
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1);
  if (existing.length > 0 && existing[0].id !== coachId) {
    return { success: false, error: "Email already in use" };
  }

  await db
    .update(users)
    .set({
      name: validated.name,
      email: validated.email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, coachId));

  revalidatePath("/l1");
  return { success: true };
}

// ─── Head Coach: Delete a Coach ───────────────────────────────────────────

export async function deleteCoach(coachId: string) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden: only the head coach can delete coaches");
  }

  // Check coach exists
  const [coach] = await db
    .select()
    .from(users)
    .where(eq(users.id, coachId))
    .limit(1);
  if (!coach || coach.role !== "coach") {
    return { success: false, error: "Coach not found" };
  }

  // Prevent deletion if coach has assigned councils
  const assignedCouncils = await db
    .select({ id: councils.id, name: councils.name })
    .from(councils)
    .where(eq(councils.coachId, coachId));

  if (assignedCouncils.length > 0) {
    const councilNames = assignedCouncils.map((c) => c.name).join(", ");
    return {
      success: false,
      error: `Cannot delete: coach is assigned to council(s): ${councilNames}. Reassign councils first.`,
    };
  }

  await db.delete(users).where(eq(users.id, coachId));

  revalidatePath("/l1");
  return { success: true };
}

// ─── Get Coaches List (Head Coach only) ────────────────────────────────────

export async function getCoaches() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden");
  }

  const coaches = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      approvalStatus: users.approvalStatus,
      canViewAllCouncils: users.canViewAllCouncils,
      permissions: users.permissions,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "coach"));

  // Get council info for each coach
  const result = [];
  for (const coach of coaches) {
    const [council] = await db
      .select({ id: councils.id, name: councils.name })
      .from(councils)
      .where(eq(councils.coachId, coach.id))
      .limit(1);

    result.push({
      ...coach,
      councilName: council?.name || "Unassigned",
      councilId: council?.id || null,
    });
  }

  return result;
}

// ─── Head Coach: Toggle coach "view all councils" permission ───────────────

export async function toggleCoachAllCouncilsView(coachId: string, grant: boolean) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    throw new Error("Forbidden");
  }

  const [coach] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, coachId))
    .limit(1);

  if (!coach || coach.role !== "coach") {
    return { success: false, error: "Coach not found" };
  }

  await db
    .update(users)
    .set({ canViewAllCouncils: grant ? 1 : 0, updatedAt: new Date() })
    .where(eq(users.id, coachId));

  return { success: true };
}

// ─── Head Coach / Developer: Update coach HC-module permissions ───────────

export async function updateCoachPermissions(coachId: string, permissions: string[]) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const [coach] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, coachId))
    .limit(1);

  if (!coach || coach.role !== "coach") return { success: false, error: "Coach not found" };

  await db
    .update(users)
    .set({ permissions: permissions.length ? JSON.stringify(permissions) : null, updatedAt: new Date() })
    .where(eq(users.id, coachId));

  return { success: true };
}

// ─── Head Coach / Coach: Update a Student ─────────────────────────────────

export async function updateStudent(studentId: string, data: { name: string; email: string }) {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) throw new Error("Forbidden");
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0 && existing[0].id !== studentId) return { success: false, error: "Email already in use" };
  await db.update(users).set({ name: data.name, email: data.email, updatedAt: new Date() }).where(eq(users.id, studentId));
  return { success: true };
}

// ─── Head Coach: Delete a Student ─────────────────────────────────────────

export async function deleteStudent(studentId: string) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");
  await db.update(users).set({ councilId: null, updatedAt: new Date() }).where(eq(users.id, studentId));
  await db.delete(users).where(eq(users.id, studentId));
  return { success: true };
}

// ─── Get Students in Council (Coach view) ──────────────────────────────────

export async function getCouncilStudentsList(councilId?: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "coach" && user.role !== "head_coach") {
    throw new Error("Forbidden");
  }

  let targetCouncilId = councilId;
  if (!targetCouncilId && user.role === "coach") {
    const [council] = await db
      .select()
      .from(councils)
      .where(eq(councils.coachId, user.userId))
      .limit(1);
    targetCouncilId = council?.id;
  }

  if (!targetCouncilId) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      approvalStatus: users.approvalStatus,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.councilId, targetCouncilId));
}
