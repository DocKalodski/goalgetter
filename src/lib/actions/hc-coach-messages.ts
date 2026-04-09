"use server";

import { db } from "@/lib/db";
import { hcCoachMessages } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/jwt";
import { eq, and, asc, isNull } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

/** Fetch all messages in a HC↔Coach thread */
export async function getHcCoachMessages(coachId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const isHC = user.role === "head_coach";
  const isOwnThread = user.userId === coachId;

  if (!isHC && !isOwnThread) throw new Error("Forbidden");

  return db
    .select()
    .from(hcCoachMessages)
    .where(eq(hcCoachMessages.coachId, coachId))
    .orderBy(asc(hcCoachMessages.createdAt));
}

/** Send a message in a HC↔Coach thread */
export async function sendHcCoachMessage(coachId: string, content: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const isHC = user.role === "head_coach";
  const isOwnThread = user.userId === coachId;

  if (!isHC && !isOwnThread) throw new Error("Forbidden");

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: "Empty message" };

  await db.insert(hcCoachMessages).values({
    id: createId(),
    coachId,
    senderId: user.userId,
    senderName: user.name ?? user.email,
    senderRole: user.role,
    content: trimmed,
    createdAt: new Date(),
  });

  return { success: true };
}

/** Mark all unread messages in the thread as read */
export async function markHcCoachRead(coachId: string) {
  const user = await getAuthUser();
  if (!user) return;

  await db
    .update(hcCoachMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(hcCoachMessages.coachId, coachId),
        isNull(hcCoachMessages.readAt)
      )
    );
}

/** Count unread messages not sent by current user */
export async function getHcCoachUnreadCount(coachId: string) {
  const user = await getAuthUser();
  if (!user) return 0;

  const rows = await db
    .select()
    .from(hcCoachMessages)
    .where(
      and(
        eq(hcCoachMessages.coachId, coachId),
        isNull(hcCoachMessages.readAt)
      )
    );

  return rows.filter((m) => m.senderId !== user.userId).length;
}
