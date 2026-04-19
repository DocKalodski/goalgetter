import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const APA_ORIGIN = process.env.APA_ORIGIN || "http://localhost:3002";
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": APA_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

interface ApaMilestone {
  weekNumber: number;
  weekDates?: string;
  cumulativePercentage: number;
  description: string;
  actions?: Array<{ text: string; days?: number[] }>;
}

interface ApaGoal {
  templateId?: string;
  goalStatement: string;
  specificDetails?: string | null;
  measurableCriteria?: string | null;
  achievableResources?: string | null;
  relevantAlignment?: string | null;
  endDate?: string | null;
  excitingMotivation?: string | null;
  rewardingBenefits?: string | null;
  milestones: ApaMilestone[];
}

interface ApaData {
  version: string;
  participant?: { name?: string; declaration?: string };
  wheelOfLife?: { scores?: Record<string, number> };
  goals: {
    enrollment?: ApaGoal;
    personal?: ApaGoal;
    professional?: ApaGoal;
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "head_coach" && user.role !== "coach" && user.role !== "developer")) {
      return NextResponse.json({ error: "Unauthorized. Coaches only." }, { status: 403, headers: corsHeaders() });
    }

    const body = await request.json() as { studentId: string; apaData: ApaData };
    const { studentId, apaData } = body;

    if (!studentId || !apaData) {
      return NextResponse.json({ error: "Missing studentId or apaData" }, { status: 400 });
    }
    if (apaData.version !== "apa-1.0") {
      return NextResponse.json({ error: "Unsupported APA version. Expected apa-1.0." }, { status: 400 });
    }

    const [student] = await db.select().from(schema.users).where(eq(schema.users.id, studentId)).limit(1);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const now = new Date();

    // 1. Set wheel of life scores
    if (apaData.wheelOfLife?.scores) {
      await db.update(schema.users)
        .set({ wheelOfLife: JSON.stringify(apaData.wheelOfLife.scores), updatedAt: now })
        .where(eq(schema.users.id, studentId));
    }

    // 2. Upsert declaration (pending coach approval)
    if (apaData.participant?.declaration) {
      const declText = apaData.participant.declaration.trim();
      const [existingDecl] = await db
        .select()
        .from(schema.declarations)
        .where(eq(schema.declarations.userId, studentId))
        .limit(1);

      if (existingDecl) {
        await db.update(schema.declarations)
          .set({ text: declText, approvalStatus: "pending", approvedBy: null, approvedAt: null, updatedAt: now })
          .where(eq(schema.declarations.id, existingDecl.id));
      } else {
        await db.insert(schema.declarations).values({
          id: createId(),
          userId: studentId,
          text: declText,
          approvalStatus: "pending",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 3. Clear existing goals + milestones
    const existingGoals = await db.select().from(schema.goals).where(eq(schema.goals.userId, studentId));
    for (const g of existingGoals) {
      await db.delete(schema.weeklyMilestones).where(eq(schema.weeklyMilestones.goalId, g.id));
    }
    if (existingGoals.length > 0) {
      await db.delete(schema.goals).where(eq(schema.goals.userId, studentId));
    }

    // 4. Insert goals + milestones
    const goalTypes: Array<"enrollment" | "personal" | "professional"> = ["enrollment", "personal", "professional"];
    let goalsInserted = 0;
    let milestonesInserted = 0;

    for (const type of goalTypes) {
      const goalData = apaData.goals[type];
      if (!goalData) continue;

      const goalId = createId();
      await db.insert(schema.goals).values({
        id: goalId,
        userId: studentId,
        goalType: type,
        goalStatement: goalData.goalStatement,
        specificDetails: goalData.specificDetails || null,
        measurableCriteria: goalData.measurableCriteria || null,
        achievableResources: goalData.achievableResources || null,
        relevantAlignment: goalData.relevantAlignment || null,
        endDate: goalData.endDate || null,
        excitingMotivation: goalData.excitingMotivation || null,
        rewardingBenefits: goalData.rewardingBenefits || null,
        status: "active",
        approvalStatus: "approved",
        createdAt: now,
        updatedAt: now,
      });
      goalsInserted++;

      for (const m of goalData.milestones) {
        // Use template action steps if present; otherwise seed description as a single action step
        const actionItems = m.actions && m.actions.length > 0
          ? m.actions.map(a => ({ text: a.text, done: false, days: a.days ?? [] }))
          : [{ text: m.description, done: false, days: [] }];
        const actionStep = JSON.stringify(actionItems);
        await db.insert(schema.weeklyMilestones).values({
          id: createId(),
          goalId,
          weekNumber: m.weekNumber,
          milestoneDescription: m.description,
          actions: actionStep,
          cumulativePercentage: Math.round(m.cumulativePercentage),
          approvalStatus: m.weekNumber < goalData.milestones.length ? "approved" : "pending",
          createdAt: now,
          updatedAt: now,
        });
        milestonesInserted++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${goalsInserted} goals and ${milestonesInserted} milestones for ${student.name || student.email}.`,
      goalsInserted,
      milestonesInserted,
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error("[import/apa] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
