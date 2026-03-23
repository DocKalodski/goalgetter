"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function getMyNotifications() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

export async function markNotificationRead(notificationId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(notifications)
    .set({ read: 1 })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, user.userId)
      )
    );

  return { success: true };
}

export async function sendMilestoneReminder(data: {
  studentId: string;
  weekNumber: number;
  goalType: string;
  milestoneDescription?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };
  if (user.role !== "coach" && user.role !== "head_coach") {
    return { success: false, error: "Forbidden" };
  }

  const weekLabel = `Week ${data.weekNumber}`;
  const goalLabel = data.goalType.charAt(0).toUpperCase() + data.goalType.slice(1);

  await db.insert(notifications).values({
    id: createId(),
    userId: data.studentId,
    title: `Milestone Reminder — ${goalLabel} Goal, ${weekLabel}`,
    message: data.milestoneDescription
      ? `Your coach is checking in on your ${weekLabel} milestone: "${data.milestoneDescription}". Please update your progress.`
      : `Your coach is checking in on your ${goalLabel} goal for ${weekLabel}. Please update your milestone progress.`,
    type: "milestone_reminder",
    read: 0,
    createdAt: new Date(),
  });

  return { success: true };
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: "milestone_reminder" | "weekly_checkin" | "goal_completion" | "council" | "batch" | "low_progress";
}) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "coach" && user.role !== "head_coach") {
    throw new Error("Forbidden: only coaches can create notifications");
  }

  await db.insert(notifications).values({
    id: createId(),
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    read: 0,
    createdAt: new Date(),
  });

  return { success: true };
}
