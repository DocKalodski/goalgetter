"use server";

import { db } from "@/lib/db";
import { goals, declarations, users, councils, weeklyMilestones } from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, and, inArray, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import Anthropic from "@anthropic-ai/sdk";

export interface MilestoneAlignmentData {
  weekNumber: number;
  milestoneDescription: string | null;
  actions: string | null;
}

export interface GoalAlignment {
  goalId: string;
  goalType: "enrollment" | "personal" | "professional";
  goalStatement: string;
  values: string | null;
  milestones: MilestoneAlignmentData[];
}

export interface AlignmentData {
  declaration: string | null;
  goals: GoalAlignment[];
}

export async function getStudentAlignment(studentId: string): Promise<AlignmentData> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  // Get declaration
  const [decl] = await db
    .select()
    .from(declarations)
    .where(eq(declarations.userId, studentId))
    .limit(1);

  // Get goals
  const studentGoals = await db
    .select({
      goalId: goals.id,
      goalType: goals.goalType,
      goalStatement: goals.goalStatement,
      values: goals.valuesDeclaration,
    })
    .from(goals)
    .where(eq(goals.userId, studentId));

  // Get milestones for all goals (for action plan alignment)
  const goalIds = studentGoals.map((g) => g.goalId);
  const allMilestones =
    goalIds.length > 0
      ? await db
          .select({
            goalId: weeklyMilestones.goalId,
            weekNumber: weeklyMilestones.weekNumber,
            milestoneDescription: weeklyMilestones.milestoneDescription,
            actions: weeklyMilestones.actions,
          })
          .from(weeklyMilestones)
          .where(inArray(weeklyMilestones.goalId, goalIds))
      : [];

  return {
    declaration: decl?.text ?? null,
    goals: studentGoals.map((g) => ({
      goalId: g.goalId,
      goalType: g.goalType as "enrollment" | "personal" | "professional",
      goalStatement: g.goalStatement,
      values: g.values,
      milestones: allMilestones
        .filter((m) => m.goalId === g.goalId)
        .map((m) => ({
          weekNumber: m.weekNumber,
          milestoneDescription: m.milestoneDescription,
          actions: m.actions,
        })),
    })),
  };
}

// ─── Coach: Update a student's declaration ──────────────────────

export async function updateDeclarationForStudent(studentId: string, text: string) {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "coach" && user.role !== "head_coach") throw new Error("Forbidden: only coaches can update student declarations");

  if (!text || text.trim().length === 0) {
    return { success: false, error: "Declaration text is required" };
  }

  // Coaches: verify student is in their council. Head coaches can update any student.
  if (user.role === "coach") {
    const [council] = await db
      .select()
      .from(councils)
      .where(eq(councils.coachId, user.userId))
      .limit(1);

    if (council) {
      const [student] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, studentId), eq(users.councilId, council.id)))
        .limit(1);
      if (!student) throw new Error("Forbidden: student not in your council");
    } else {
      throw new Error("Forbidden: no council found");
    }
  }

  const now = new Date();
  const existing = await db
    .select()
    .from(declarations)
    .where(eq(declarations.userId, studentId))
    .orderBy(desc(declarations.updatedAt))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(declarations)
      .set({ text: text.trim(), updatedAt: now })
      .where(eq(declarations.id, existing[0].id));
  } else {
    await db.insert(declarations).values({
      id: createId(),
      userId: studentId,
      text: text.trim(),
      approvalStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/l3");
  return { success: true };
}

// ─── AI: Deep Declaration × Goal Fit Assessment ─────────────────

export interface DeclarationFitResult {
  overallScore: number;
  ambitionScore: number;
  thematicScore: number;
  specificityScore: number;
  analysis: string;
  suggestedTweak: string;
}

export async function assessGoalDeclarationFit(
  goalStatement: string,
  declaration: string,
  valuesDeclaration: string | null,
  goalType: string
): Promise<DeclarationFitResult> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });

  const prompt = `You are evaluating how well a student's goal statement honors their personal declaration in a 12-week goal achievement program (LEAP 99).

DECLARATION (the student's big commitment):
"${declaration}"

GOAL TYPE: ${goalType}

GOAL STATEMENT:
"${goalStatement}"

${valuesDeclaration ? `VALUES the student listed:\n"${valuesDeclaration}"\n` : ""}

Evaluate across 3 dimensions (each 0–100):

1. **Ambition Alignment** — Does the goal's ambition level match the commitment intensity of the declaration? A strong declaration with a vague or low-bar goal = low score.

2. **Thematic Alignment** — Does the goal reflect the deeper "why" or spirit expressed in the declaration? Mismatched themes (declaration about family, goal about career with no connection) = low score.

3. **Specificity Fit** — Is the goal concrete and measurable enough to actually honor the declaration? "I want to improve" vs "I will close 8 deals by Week 10" = big difference.

Then provide:
- **analysis**: 2–3 sentence honest but encouraging assessment of the gap (or alignment) between the declaration and the goal
- **suggestedTweak**: ONE specific, minimal rewrite of the goal statement that would better honor the declaration. Keep it to 1–2 sentences. Be concrete — name numbers, dates, activities where possible.

Respond ONLY with valid JSON in this exact format:
{
  "ambitionScore": <0-100>,
  "thematicScore": <0-100>,
  "specificityScore": <0-100>,
  "analysis": "<2-3 sentences>",
  "suggestedTweak": "<1-2 sentence goal rewrite>"
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (handle any leading/trailing text)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response format");

  const parsed = JSON.parse(jsonMatch[0]);

  const ambition = Math.min(100, Math.max(0, Number(parsed.ambitionScore) || 0));
  const thematic = Math.min(100, Math.max(0, Number(parsed.thematicScore) || 0));
  const specificity = Math.min(100, Math.max(0, Number(parsed.specificityScore) || 0));
  const overall = Math.round((ambition + thematic + specificity) / 3);

  return {
    overallScore: overall,
    ambitionScore: ambition,
    thematicScore: thematic,
    specificityScore: specificity,
    analysis: parsed.analysis || "",
    suggestedTweak: parsed.suggestedTweak || "",
  };
}
