import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journeyEntries } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/journey/entries?studentId=xxx
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = req.nextUrl.searchParams.get("studentId") || user.userId;
  const type = req.nextUrl.searchParams.get("type"); // optional filter

  const conditions = [eq(journeyEntries.studentId, studentId)];
  if (type) conditions.push(eq(journeyEntries.entryType, type as "oo" | "mm" | "cc" | "pp" | "aa"));

  const entries = await db
    .select()
    .from(journeyEntries)
    .where(and(...conditions))
    .orderBy(desc(journeyEntries.entryDate));

  return NextResponse.json({ entries });
}

// POST /api/journey/entries
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date();

  const entry = {
    id: nanoid(),
    studentId: body.studentId || user.userId,
    coachId: user.userId,
    entryType: body.entryType,
    entryDate: body.entryDate || now.toISOString().split("T")[0],
    weekNumber: body.weekNumber ?? null,
    transcriptId: body.transcriptId ?? null,
    // OO fields
    win: body.win ?? null,
    committed: body.committed ?? null,
    agenda: body.agenda ?? null,
    homework: body.homework ?? null,
    // MM fields
    meetingType: body.meetingType ?? null,
    meetingAgendaJson: body.meetingAgendaJson ? JSON.stringify(body.meetingAgendaJson) : null,
    attendeesJson: body.attendeesJson ? JSON.stringify(body.attendeesJson) : null,
    resolutions: body.resolutions ?? null,
    meetingMinutes: body.meetingMinutes ?? null,
    // CC fields
    callerName: body.callerName ?? null,
    calleeName: body.calleeName ?? null,
    callStartTime: body.callStartTime ?? null,
    callEndTime: body.callEndTime ?? null,
    callDurationMins: body.callDurationMins ?? null,
    callOutcome: body.callOutcome ?? null,
    // PP fields
    eventName: body.eventName ?? null,
    moduleTopic: body.moduleTopic ?? null,
    ppNotes: body.ppNotes ?? null,
    ppScoreNum: body.ppScoreNum ?? null,
    ppScoreDen: body.ppScoreDen ?? null,
    votesJson: body.votesJson ? JSON.stringify(body.votesJson) : null,
    choicesJson: body.choicesJson ? JSON.stringify(body.choicesJson) : null,
    coachObservations: body.coachObservations ?? null,
    // Approval
    approvalStatus: body.approvalStatus || "draft",
    approvedFields: body.approvedFields ? JSON.stringify(body.approvedFields) : null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(journeyEntries).values(entry);
  return NextResponse.json({ entry }, { status: 201 });
}

// PATCH /api/journey/entries  (update entry)
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Serialize JSON fields
  if (updates.meetingAgendaJson && typeof updates.meetingAgendaJson !== "string")
    updates.meetingAgendaJson = JSON.stringify(updates.meetingAgendaJson);
  if (updates.attendeesJson && typeof updates.attendeesJson !== "string")
    updates.attendeesJson = JSON.stringify(updates.attendeesJson);
  if (updates.votesJson && typeof updates.votesJson !== "string")
    updates.votesJson = JSON.stringify(updates.votesJson);
  if (updates.choicesJson && typeof updates.choicesJson !== "string")
    updates.choicesJson = JSON.stringify(updates.choicesJson);
  if (updates.approvedFields && typeof updates.approvedFields !== "string")
    updates.approvedFields = JSON.stringify(updates.approvedFields);

  await db
    .update(journeyEntries)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(journeyEntries.id, id));

  return NextResponse.json({ success: true });
}
