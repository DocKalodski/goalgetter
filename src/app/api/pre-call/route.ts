import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { batches } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/pre-call — returns the batch recurring call schedule
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [batch] = await db
    .select({ callTimes: batches.callTimes, weeklyMeetingDay: batches.weeklyMeetingDay, weeklyMeetingTime: batches.weeklyMeetingTime })
    .from(batches)
    .limit(1);

  if (!batch) return NextResponse.json({ callTimes: {}, weeklyMeetingDay: null, weeklyMeetingTime: null });

  return NextResponse.json({
    callTimes: batch.callTimes ? JSON.parse(batch.callTimes) : {},
    weeklyMeetingDay: batch.weeklyMeetingDay ?? null,
    weeklyMeetingTime: batch.weeklyMeetingTime ?? null,
  });
}
