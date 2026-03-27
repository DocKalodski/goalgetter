import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";
import { canAccessStudent } from "@/lib/auth/access";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/calendar?studentId=xxx
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = req.nextUrl.searchParams.get("studentId") || user.userId;

  if (!(await canAccessStudent(user, studentId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  const targetStudentId = body.studentId || user.userId;

  if (!(await canAccessStudent(user, targetStudentId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (body.eventDate < today) {
    return NextResponse.json({ error: "Cannot create events in the past" }, { status: 400 });
  }

  const event = {
    id: nanoid(),
    studentId: targetStudentId,
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
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify ownership of this event
  const [event] = await db
    .select({ studentId: calendarEvents.studentId })
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canAccessStudent(user, event.studentId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .update(calendarEvents)
    .set({ reminderSent: 1 })
    .where(eq(calendarEvents.id, id));

  return NextResponse.json({ success: true });
}
