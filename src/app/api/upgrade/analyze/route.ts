import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// POST /api/upgrade/analyze
// Detects misalignment and generates upgraded action step suggestions
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalStatement, goalType, currentWeek, actionStepsPct, milestonePct, currentSteps, missedMilestones } = await req.json();

  // Misalignment check
  if (actionStepsPct < 100 || milestonePct >= 100) {
    return NextResponse.json({
      misaligned: false,
      message: "No misalignment detected — milestones on track or actions not yet complete.",
    });
  }

  const prompt = `You are a LEAP 99 coaching AI. A student has completed 100% of their action steps but their milestone is not met.

Goal (${goalType}): ${goalStatement}
Current Week: ${currentWeek}
Action Steps Completion: ${actionStepsPct}%
Milestone Completion: ${milestonePct}%
Missed Milestones: ${missedMilestones?.join(", ") || "not specified"}

Current Action Steps:
${(currentSteps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

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
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 768,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };

    return NextResponse.json({ misaligned: true, ...result });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
