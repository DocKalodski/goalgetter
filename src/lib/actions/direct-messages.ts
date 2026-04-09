"use server";

import { db } from "@/lib/db";
import { directMessages, users } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach } from "@/lib/auth/jwt";
import { eq, and, asc, isNull, desc, inArray, not } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

/** Fetch all messages for a coach–student thread */
export async function getDirectMessages(studentId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isStudent = user.userId === studentId;

  if (!isCoach && !isStudent) throw new Error("Forbidden");

  return db
    .select()
    .from(directMessages)
    .where(eq(directMessages.studentId, studentId))
    .orderBy(asc(directMessages.createdAt));
}

/** Send a message in the coach–student thread */
export async function sendDirectMessage(studentId: string, content: string, imageUrl?: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isStudent = user.userId === studentId;

  if (!isCoach && !isStudent) throw new Error("Forbidden");

  const trimmed = content.trim();
  if (!trimmed && !imageUrl) return { success: false, error: "Empty message" };

  await db.insert(directMessages).values({
    id: createId(),
    studentId,
    senderId: user.userId,
    senderName: user.name ?? user.email,
    senderRole: user.role,
    content: trimmed || "",
    imageUrl: imageUrl ?? null,
    createdAt: new Date(),
  });

  return { success: true };
}

/** Mark all unread messages (sent by the other party) as read */
export async function markDirectMessagesRead(studentId: string) {
  const user = await getAuthUser();
  if (!user) return;

  await db
    .update(directMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(directMessages.studentId, studentId),
        isNull(directMessages.readAt),
        not(eq(directMessages.senderId, user.userId))
      )
    );
}

// ─── Crisis Scanner — HC only ─────────────────────────────────────────────────

const CRISIS_PATTERNS = [
  { type: "life_threat" as const, keywords: ["suicide", "suicidal", "kill myself", "want to die", "end my life", "hurt myself", "self harm", "no reason to live", "better off dead", "can't go on", "can't take it anymore"] },
  { type: "quit" as const, keywords: ["i quit", "i'm done", "giving up", "give up", "can't do this", "dropping out", "leaving the program", "withdraw", "i want out", "i'm leaving", "quit leap", "quit the program"] },
  { type: "help_signal" as const, keywords: ["please help", "need help", "help me", "i need support", "nobody cares", "no one helps", "feeling lost", "i don't know what to do", "desperate", "overwhelmed", "breaking down"] },
];

export interface CrisisFlag {
  messageId: string;
  studentId: string;
  studentName: string | null;
  senderId: string;
  senderName: string | null;
  senderRole: string | null;
  content: string;
  createdAt: Date;
  flagType: "life_threat" | "quit" | "help_signal" | "unanswered_help";
  matchedKeyword: string;
}

export async function getCrisisSignals(): Promise<CrisisFlag[]> {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden: HC only");

  const now = new Date();
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch all DMs (full scan — HC override)
  const allMessages = await db
    .select({
      id: directMessages.id,
      studentId: directMessages.studentId,
      senderId: directMessages.senderId,
      senderName: directMessages.senderName,
      senderRole: directMessages.senderRole,
      content: directMessages.content,
      readAt: directMessages.readAt,
      createdAt: directMessages.createdAt,
    })
    .from(directMessages)
    .orderBy(desc(directMessages.createdAt))
    .limit(2000);

  // Build student name map
  const studentIds = [...new Set(allMessages.map((m) => m.studentId))];
  const studentRows = studentIds.length > 0
    ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, studentIds))
    : [];
  const nameMap: Record<string, string | null> = {};
  for (const s of studentRows) nameMap[s.id] = s.name;

  const flags: CrisisFlag[] = [];
  const seen = new Set<string>();

  for (const msg of allMessages) {
    const lower = msg.content.toLowerCase();
    for (const pattern of CRISIS_PATTERNS) {
      for (const kw of pattern.keywords) {
        if (lower.includes(kw)) {
          const key = `${msg.id}-${pattern.type}`;
          if (!seen.has(key)) {
            seen.add(key);
            flags.push({
              messageId: msg.id,
              studentId: msg.studentId,
              studentName: nameMap[msg.studentId] ?? null,
              senderId: msg.senderId,
              senderName: msg.senderName,
              senderRole: msg.senderRole,
              content: msg.content,
              createdAt: msg.createdAt,
              flagType: pattern.type,
              matchedKeyword: kw,
            });
          }
          break;
        }
      }
    }

    // Unanswered help: sent by student >24h ago, never read, no coach reply after it
    if (
      msg.senderRole === "student" &&
      !msg.readAt &&
      msg.createdAt < cutoff24h &&
      (lower.includes("help") || lower.includes("support") || lower.includes("confused"))
    ) {
      const key = `${msg.id}-unanswered`;
      if (!seen.has(key)) {
        seen.add(key);
        // Check if any coach replied after this message
        const replies = allMessages.filter(
          (r) => r.studentId === msg.studentId &&
            r.senderRole !== "student" &&
            r.createdAt > msg.createdAt
        );
        if (replies.length === 0) {
          flags.push({
            messageId: msg.id,
            studentId: msg.studentId,
            studentName: nameMap[msg.studentId] ?? null,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderRole: msg.senderRole,
            content: msg.content,
            createdAt: msg.createdAt,
            flagType: "unanswered_help",
            matchedKeyword: "no reply in 24h+",
          });
        }
      }
    }
  }

  // Sort: life_threat first, then quit, then help_signal, then unanswered
  const order = { life_threat: 0, quit: 1, help_signal: 2, unanswered_help: 3 };
  return flags.sort((a, b) => order[a.flagType] - order[b.flagType]);
}

/** Count unread messages sent TO the current user in a thread */
export async function getUnreadCount(studentId: string) {
  const user = await getAuthUser();
  if (!user) return 0;

  const rows = await db
    .select()
    .from(directMessages)
    .where(
      and(
        eq(directMessages.studentId, studentId),
        isNull(directMessages.readAt)
      )
    );

  // Only count messages not sent by the current user
  return rows.filter((m) => m.senderId !== user.userId).length;
}
