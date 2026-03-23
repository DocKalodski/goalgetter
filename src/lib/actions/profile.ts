"use server";

import { db } from "@/lib/db";
import { users, declarations } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { eq, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Get My Profile ────────────────────────────────────────────────────────

export async function getMyProfile() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const [profile] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      councilId: users.councilId,
      batchId: users.batchId,
      approvalStatus: users.approvalStatus,
    })
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);

  if (!profile) throw new Error("User not found");

  // Get declaration
  const [declaration] = await db
    .select()
    .from(declarations)
    .where(eq(declarations.userId, user.userId))
    .limit(1);

  return {
    ...profile,
    declaration: declaration
      ? {
          id: declaration.id,
          text: declaration.text,
          approvalStatus: declaration.approvalStatus,
        }
      : null,
  };
}

// ─── Update My Profile ─────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export async function updateMyProfile(
  data: z.infer<typeof updateProfileSchema>
) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const validated = updateProfileSchema.parse(data);

  // Check email uniqueness if changing
  if (validated.email) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1);
    if (existing.length > 0 && existing[0].id !== user.userId) {
      return { success: false, error: "Email already in use" };
    }
  }

  await db
    .update(users)
    .set({ ...validated, updatedAt: new Date() })
    .where(eq(users.id, user.userId));

  revalidatePath("/l3");
  return { success: true };
}

// ─── Change My Password ────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function changeMyPassword(
  data: z.infer<typeof changePasswordSchema>
) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const validated = changePasswordSchema.parse(data);

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.userId))
    .limit(1);
  if (!dbUser) throw new Error("User not found");

  const isValid = await verifyPassword(
    validated.currentPassword,
    dbUser.passwordHash
  );
  if (!isValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await hashPassword(validated.newPassword);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, user.userId));

  return { success: true };
}

// ─── Update My Declaration (Student) ───────────────────────────────────────

export async function updateMyDeclaration(text: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  if (!text || text.trim().length === 0) {
    return { success: false, error: "Declaration text is required" };
  }

  const now = new Date();
  const existing = await db
    .select()
    .from(declarations)
    .where(eq(declarations.userId, user.userId))
    .orderBy(desc(declarations.updatedAt))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(declarations)
      .set({
        text: text.trim(),
        approvalStatus: "pending", // Reset to pending when edited
        approvedBy: null,
        approvedAt: null,
        updatedAt: now,
      })
      .where(eq(declarations.id, existing[0].id));
  } else {
    await db.insert(declarations).values({
      id: createId(),
      userId: user.userId,
      text: text.trim(),
      approvalStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/l3");
  return { success: true };
}
