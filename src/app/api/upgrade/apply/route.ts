import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { actionStepVersions, goals } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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

// Resolve goalId → studentId and verify access
async function verifyGoalAccess(user: Awaited<ReturnType<typeof getUser>>, goalId: string) {
  if (!user) return false;
  const [goal] = await db
    .select({ userId: goals.userId })
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);
  if (!goal) return false;
  return canAccessStudent(user, goal.userId);
}

// GET /api/upgrade/apply?goalId=xxx — get version history
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goalId = req.nextUrl.searchParams.get("goalId");
  if (!goalId) return NextResponse.json({ error: "goalId required" }, { status: 400 });

  if (!(await verifyGoalAccess(user, goalId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const versions = await db
    .select()
    .from(actionStepVersions)
    .where(eq(actionStepVersions.goalId, goalId))
    .orderBy(desc(actionStepVersions.versionNum));

  return NextResponse.json({ versions });
}

// POST /api/upgrade/apply — coaches only, save action step upgrade
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "coach" && user.role !== "head_coach") {
    return NextResponse.json({ error: "Forbidden: coaches only" }, { status: 403 });
  }

  const { goalId, weekNumber, steps, upgradeReason, misalignmentSummary, suggestionsJson } = await req.json();

  if (!(await verifyGoalAccess(user, goalId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
