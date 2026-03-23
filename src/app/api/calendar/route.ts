import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/calendar?studentId=xxx
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = req.nextUrl.searchParams.get("studentId") || user.userId;

  const events = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.studentId, studentId))
    .orderBy(calendarEvents.eventDate);

  return NextResponse.json({ events });
}

// POST /api/calendar — create event
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date();

  // Prevent past-date event creation (future-only rule)
  const today = now.toISOString().split("T")[0];
  if (body.eventDate < today) {
    return NextResponse.json({ error: "Cannot create events in the past" }, { status: 400 });
  }

  const event = {
    id: nanoid(),
    studentId: body.studentId || user.userId,
    title: body.title,
    eventDate: body.eventDate,
    eventType: body.eventType,
    linkedId: body.linkedId ?? null,
    goalType: body.goalType ?? null,
    reminderSent: 0,
    reminderType: body.reminderType ?? null,
    createdAt: now,
  };

  await db.insert(calendarEvents).values(event);
  return NextResponse.json({ event }, { status: 201 });
}

// PATCH /api/calendar — mark reminder sent
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db
    .update(calendarEvents)
    .set({ reminderSent: 1 })
    .where(eq(calendarEvents.id, id));

  return NextResponse.json({ success: true });
}
