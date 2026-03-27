import { NextRequest, NextResponse } from "next/server";
import { llmChat } from "@/lib/llm";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { nerRedact, PRIVACY_CLAUSE } from "@/lib/utils/sanitize-pii";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// POST /api/upgrade/analyze — coaches only
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only coaches can use the upgrade analyzer
  if (user.role !== "coach" && user.role !== "head_coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { goalStatement, goalType, currentWeek, actionStepsPct, milestonePct, currentSteps, missedMilestones } = await req.json();

  if (actionStepsPct < 100 || milestonePct >= 100) {
    return NextResponse.json({
      misaligned: false,
      message: "No misalignment detected — milestones on track or actions not yet complete.",
    });
  }

  // NER redact all free-form text before sending to LLM
  const [safeGoal, ...safeRest] = await Promise.all([
    nerRedact(goalStatement),
    ...(missedMilestones || []).map((m: string) => nerRedact(m)),
    ...(currentSteps || []).map((s: string) => nerRedact(s)),
  ]);
  const safeMissed = safeRest.slice(0, (missedMilestones || []).length);
  const safeSteps = safeRest.slice((missedMilestones || []).length);

  const prompt = `${PRIVACY_CLAUSE}

You are a LEAP 99 coaching AI. A student has completed 100% of their action steps but their milestone is not met.

Goal type: ${goalType}
Goal: ${safeGoal}
Current Week: ${currentWeek}
Action Steps Completion: ${actionStepsPct}%
Milestone Completion: ${milestonePct}%
Missed Milestones: ${safeMissed.join(", ") || "not specified"}

Current Action Steps:
${safeSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

The student completed all their steps but didn't hit their milestone. This means the steps were not effective enough.
Generate 3-5 UPGRADED action steps that would actually drive milestone achievement.

Return ONLY valid JSON:
{
  "misalignmentSummary": "1-2 sentence explanation of the gap",
  "suggestions": [
    {"old": "existing step or null if new", "new": "upgraded/new step description", "reason": "why this is more effective"}
  ]
}

Make suggestions specific, measurable, and directly tied to the goal. Focus on higher-leverage activities.`;

  try {
    const text = await llmChat([{ role: "user", content: prompt }], { tier: "smart", maxTokens: 768 });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };

    return NextResponse.json({ misaligned: true, ...result });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
