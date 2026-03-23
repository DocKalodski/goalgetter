import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { actionStepVersions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/upgrade/apply?goalId=xxx  — get version history
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goalId = req.nextUrl.searchParams.get("goalId");
  if (!goalId) return NextResponse.json({ error: "goalId required" }, { status: 400 });

  const versions = await db
    .select()
    .from(actionStepVersions)
    .where(eq(actionStepVersions.goalId, goalId))
    .orderBy(desc(actionStepVersions.versionNum));

  return NextResponse.json({ versions });
}

// POST /api/upgrade/apply — save coach-approved action step upgrade
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalId, weekNumber, steps, upgradeReason, misalignmentSummary, suggestionsJson } = await req.json();

  // Get current max version
  const existing = await db
    .select({ versionNum: actionStepVersions.versionNum })
    .from(actionStepVersions)
    .where(eq(actionStepVersions.goalId, goalId))
    .orderBy(desc(actionStepVersions.versionNum))
    .limit(1);

  const nextVersion = existing.length > 0 ? existing[0].versionNum + 1 : 1;

  const version = {
    id: nanoid(),
    goalId,
    weekNumber: weekNumber || 1,
    versionNum: nextVersion,
    stepsJson: JSON.stringify(steps),
    upgradeReason: upgradeReason || null,
    misalignmentSummary: misalignmentSummary || null,
    suggestionsJson: suggestionsJson ? JSON.stringify(suggestionsJson) : null,
    approvedByCoach: 1,
    approvedAt: new Date(),
    createdAt: new Date(),
  };

  await db.insert(actionStepVersions).values(version);
  return NextResponse.json({ version }, { status: 201 });
}
