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
    const [student] = await db
      .select({ councilId: users.councilId })
      .from(users)
      .where(eq(users.id, targetStudentId))
      .limit(1);

    if (!student?.councilId) return false;

    const [council] = await db
      .select({ id: councils.id })
      .from(councils)
      .where(
        and(
          eq(councils.id, student.councilId),
          eq(councils.coachId, user.userId)
        )
      )
      .limit(1);

    return !!council;
  }

  return false;
}
