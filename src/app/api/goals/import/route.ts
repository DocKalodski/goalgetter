import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { getAuthUser, isCoach } from "@/lib/auth/jwt";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();

  if (!user || !isCoach(user)) {
    return NextResponse.json(
      { error: "Coaches only" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { studentId, goals: goalList } = body;

    if (!studentId || !Array.isArray(goalList)) {
      return NextResponse.json(
        { error: "Invalid format: needs studentId and goals array" },
        { status: 400 }
      );
    }

    const now = new Date();
    const importedGoals = [];

    for (const goal of goalList) {
      const goalId = createId();
      await db.insert(goals).values({
        id: goalId,
        userId: studentId,
        goalType: goal.goalType || "personal",
        goalStatement: goal.goalStatement || "",
        specificDetails: goal.specificDetails,
        measurableCriteria: goal.measurableCriteria,
        achievableResources: goal.achievableResources,
        relevantAlignment: goal.relevantAlignment,
        excitingMotivation: goal.excitingMotivation,
        rewardingBenefits: goal.rewardingBenefits,
        valuesDeclaration: goal.valuesDeclaration,
        status: "draft",
        approvalStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });
      importedGoals.push(goalId);
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${importedGoals.length} goals`,
      goalIds: importedGoals,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    );
  }
}
