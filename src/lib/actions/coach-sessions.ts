"use server";

import { db } from "@/lib/db";
import { coachSessions, coachDocuments, users } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach } from "@/lib/auth/jwt";
import { canAccessStudent } from "@/lib/auth/access";
import { eq, and, isNull, isNotNull, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { llmChat } from "@/lib/llm";
import { createNotification } from "@/lib/actions/notifications";
import { nerRedact, sanitizePII, PRIVACY_CLAUSE } from "@/lib/utils/sanitize-pii";

function requireCoach() {
  return getAuthUser().then((user) => {
    if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
      throw new Error("Forbidden");
    }
    return user;
  });
}

export async function createCoachSession(
  studentId: string | null,
  sessionType: string,
  weekNumber: number,
  destination: "student" | "general" = "student"
) {
  const user = await requireCoach();
  const now = new Date();
  const id = createId();
  const [row] = await db
    .insert(coachSessions)
    .values({
      id,
      coachId: user.userId,
      studentId: destination === "student" ? studentId : null,
      weekNumber,
      sessionType,
      destination,
      transcript: null,
      aiSummary: null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateSessionTranscript(sessionId: string, transcript: string) {
  const user = await requireCoach();
  await db
    .update(coachSessions)
    .set({ transcript, updatedAt: new Date() })
    .where(and(eq(coachSessions.id, sessionId), eq(coachSessions.coachId, user.userId)));
}

export async function getCoachSessions(studentId: string) {
  const user = await requireCoach();
  const rows = await db
    .select()
    .from(coachSessions)
    .where(
      and(
        eq(coachSessions.coachId, user.userId),
        eq(coachSessions.studentId, studentId),
        // Only return sessions that have actual content
        isNotNull(coachSessions.transcript)
      )
    )
    .orderBy(coachSessions.createdAt);
  return rows.reverse();
}

export async function getGeneralSessions() {
  const user = await requireCoach();
  const rows = await db
    .select()
    .from(coachSessions)
    .where(
      and(
        eq(coachSessions.coachId, user.userId),
        isNull(coachSessions.studentId),
        isNotNull(coachSessions.transcript)
      )
    )
    .orderBy(coachSessions.createdAt);
  return rows.reverse();
}

// Scrub [Name]: speaker tags → [Coach]: / [Student]: for privacy before sending to LLM
function anonymizeTranscript(transcript: string): string {
  let coachTagged = false;
  const studentLabel = "[Student]:";
  return transcript.replace(/\[([^\]]+)\]:/g, (_, name) => {
    const lower = name.trim().toLowerCase();
    if (lower === "coach" || lower === "head coach" || lower === "hc") return "[Coach]:";
    if (!coachTagged) { coachTagged = true; return "[Coach]:"; }
    return studentLabel;
  });
}

export async function generateSessionSummary(sessionId: string) {
  const user = await requireCoach();
  const [session] = await db
    .select()
    .from(coachSessions)
    .where(and(eq(coachSessions.id, sessionId), eq(coachSessions.coachId, user.userId)));

  if (!session) throw new Error("Session not found");
  if (!session.transcript) throw new Error("No transcript to summarize");

  // Anonymize speaker tags, then NER-redact any remaining names/orgs in the transcript body
  const safeTranscript = await nerRedact(anonymizeTranscript(session.transcript));

  let prompt: string;
  if (session.destination === "general") {
    prompt = `${PRIVACY_CLAUSE}

Analyze these coaching notes for methodology insights.
Context: LEAP 99 program, GROW + SMARTER framework.
Notes: "${safeTranscript}"
Return ONLY valid JSON: {"summary":"...","keyInsights":["..."],"methodologyNotes":["..."],"applicableTo":["..."]}`;
  } else {
    prompt = `${PRIVACY_CLAUSE}

Analyze this ${session.sessionType} coaching session using GROW framework and SMARTER goals methodology.
Week ${session.weekNumber}. Speakers are labeled [Coach] and [Student].
Transcript: "${safeTranscript}"
Return ONLY valid JSON: {"summary":"...","keyPoints":["..."],"actionItems":["..."],"growAlignment":{"goal":"...","reality":"...","options":["..."],"wayForward":"..."},"sentiment":"positive","coachingTone":"...","studentEngagement":"high"}`;
  }

  const raw = await llmChat([{ role: "user", content: prompt }], { tier: "smart", maxTokens: 1024 });
  const match = raw.match(/\{[\s\S]*\}/);
  const aiSummary = match ? match[0] : JSON.stringify({ summary: raw, keyPoints: [], actionItems: [] });

  await db
    .update(coachSessions)
    .set({ aiSummary, updatedAt: new Date() })
    .where(eq(coachSessions.id, sessionId));

  return JSON.parse(aiSummary);
}

export async function publishSessionDocument(
  sessionId: string,
  title: string,
  content: string
) {
  const user = await requireCoach();
  const [session] = await db
    .select()
    .from(coachSessions)
    .where(and(eq(coachSessions.id, sessionId), eq(coachSessions.coachId, user.userId)));

  if (!session || !session.studentId) throw new Error("Session not found or has no student");

  const now = new Date();
  const docId = createId();

  await db.insert(coachDocuments).values({
    id: docId,
    sessionId,
    studentId: session.studentId,
    title,
    content,
    readAt: null,
    createdAt: now,
  });

  await db
    .update(coachSessions)
    .set({ status: "published", updatedAt: now })
    .where(eq(coachSessions.id, sessionId));

  await createNotification({
    userId: session.studentId,
    type: "council",
    title: "New coach document",
    message: title,
  });

  return { success: true };
}

export async function getStudentDocuments(studentId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (!(await canAccessStudent(user, studentId))) {
    throw new Error("Forbidden");
  }
  const rows = await db
    .select()
    .from(coachDocuments)
    .where(eq(coachDocuments.studentId, studentId))
    .orderBy(coachDocuments.createdAt);
  return rows.reverse();
}

export async function markDocumentRead(documentId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  await db
    .update(coachDocuments)
    .set({ readAt: new Date() })
    .where(eq(coachDocuments.id, documentId));
}

export async function deleteSession(sessionId: string) {
  const user = await requireCoach();
  await db
    .delete(coachSessions)
    .where(and(eq(coachSessions.id, sessionId), eq(coachSessions.coachId, user.userId)));
  return { success: true };
}

export async function getAllCoachSessionsForHC() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const coaches = alias(users, "coaches");
  const students = alias(users, "students");

  const rows = await db
    .select({
      id: coachSessions.id,
      coachId: coachSessions.coachId,
      coachName: coaches.name,
      studentId: coachSessions.studentId,
      studentName: students.name,
      weekNumber: coachSessions.weekNumber,
      sessionType: coachSessions.sessionType,
      destination: coachSessions.destination,
      aiSummary: coachSessions.aiSummary,
      hcFlag: coachSessions.hcFlag,
      hcOneLiner: coachSessions.hcOneLiner,
      createdAt: coachSessions.createdAt,
    })
    .from(coachSessions)
    .leftJoin(coaches, eq(coachSessions.coachId, coaches.id))
    .leftJoin(students, eq(coachSessions.studentId, students.id))
    .where(eq(coachSessions.status, "published"))
    .orderBy(desc(coachSessions.createdAt))
    .limit(50);

  return rows;
}

export async function flagSessionForHC(sessionId: string) {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const [session] = await db
    .select()
    .from(coachSessions)
    .where(eq(coachSessions.id, sessionId));

  if (!session || !session.aiSummary) return null;

  const safeSummary = await nerRedact(session.aiSummary);
  const prompt = `${PRIVACY_CLAUSE}

You are the head coach reviewing a coaching session AI summary.
Classify this session and write a one-sentence HC takeaway.

Session summary: ${safeSummary}

Respond ONLY with valid JSON: {"flag": "needs_attention"|"at_risk"|"great_progress"|"routine", "oneLiner": "max 25 word sentence for HC"}

Rules:
- needs_attention: student struggling, coach off-track, urgent action required
- at_risk: warning signs, missed targets, low engagement
- great_progress: breakthrough moment, student excelling, celebrate
- routine: normal session, no concerns`;

  const raw = await llmChat([{ role: "user", content: prompt }], { tier: "fast", maxTokens: 256 });
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;

  const { flag, oneLiner } = JSON.parse(match[0]);

  await db
    .update(coachSessions)
    .set({ hcFlag: flag, hcOneLiner: oneLiner, updatedAt: new Date() })
    .where(eq(coachSessions.id, sessionId));

  return { flag, oneLiner };
}

export async function deleteBlankSessions() {
  const user = await requireCoach();
  const result = await db
    .delete(coachSessions)
    .where(and(eq(coachSessions.coachId, user.userId), isNull(coachSessions.transcript)));
  return result;
}
