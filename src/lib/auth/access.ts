import { db } from "@/lib/db";
import { users, councils } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { JWTPayload } from "./jwt";

/**
 * Returns true if the authenticated user is allowed to read/write data for targetStudentId.
 * - head_coach / canViewAllCouncils: always allowed
 * - student / council_leader: only their own userId
 * - coach: only students whose councilId maps to a council where coachId === user.userId
 */
export async function canAccessStudent(
  user: JWTPayload,
  targetStudentId: string
): Promise<boolean> {
  if (user.role === "head_coach" || user.canViewAllCouncils) return true;

  if (user.role === "student" || user.role === "council_leader") {
    return user.userId === targetStudentId;
  }

  if (user.role === "coach") {
    // Coaches can browse all councils in L2 — allow access to any student
    // who is assigned to a council (has a councilId).
    const [student] = await db
      .select({ councilId: users.councilId })
      .from(users)
      .where(eq(users.id, targetStudentId))
      .limit(1);

    return !!student?.councilId;
  }

  return false;
}
