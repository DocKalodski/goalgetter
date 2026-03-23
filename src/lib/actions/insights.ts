"use server";

import { db } from "@/lib/db";
import {
  users,
  councils,
  goals,
  weeklyMilestones,
  declarations,
  actionPlans,
  aiAnalyses,
  aiAnalysisIssues,
} from "@/lib/db/schema";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { eq, and, inArray, desc, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { runInsightsAnalysis } from "@/lib/analysis/insights-engine";
import { getCurrentWeek } from "@/lib/progress";

// ─── Shared helpers ─────────────────────────────────────────────

async function fetchAllData() {
  return Promise.all([
    db
      .select({ id: users.id, name: users.name, role: users.role, councilId: users.councilId })
      .from(users),
    db
      .select({ id: councils.id, name: councils.name, coachId: councils.coachId })
      .from(councils),
    db
      .select({
        id: goals.id, userId: goals.userId, goalType: goals.goalType,
        goalStatement: goals.goalStatement, valuesDeclaration: goals.valuesDeclaration,
      })
      .from(goals),
    db
      .select({
        id: weeklyMilestones.id, goalId: weeklyMilestones.goalId,
        weekNumber: weeklyMilestones.weekNumber,
        cumulativePercentage: weeklyMilestones.cumulativePercentage,
        actions: weeklyMilestones.actions,
      })
      .from(weeklyMilestones),
    db
      .select({ userId: declarations.userId, text: declarations.text })
      .from(declarations),
    db
      .select({ goalId: actionPlans.goalId, weekNumber: actionPlans.weekNumber })
      .from(actionPlans),
  ]);
}

function scopeDataToCouncils(
  data: Awaited<ReturnType<typeof fetchAllData>>,
  councilIds: string[]
) {
  const [allUsers, allCouncils, allGoals, allMilestones, allDeclarations, allActionPlans] = data;
  const councilSet = new Set(councilIds);

  const scopedCouncils = allCouncils.filter((c) => councilSet.has(c.id));
  const scopedUsers = allUsers.filter(
    (u) => (u.councilId && councilSet.has(u.councilId)) || scopedCouncils.some((c) => c.coachId === u.id)
  );
  const scopedUserIds = new Set(scopedUsers.map((u) => u.id));
  const scopedGoals = allGoals.filter((g) => scopedUserIds.has(g.userId));
  const scopedGoalIds = new Set(scopedGoals.map((g) => g.id));
  const scopedMilestones = allMilestones.filter((m) => scopedGoalIds.has(m.goalId));
  const scopedDeclarations = allDeclarations.filter((d) => scopedUserIds.has(d.userId));
  const scopedActionPlans = allActionPlans.filter((ap) => scopedGoalIds.has(ap.goalId));

  return {
    councils: scopedCouncils,
    users: scopedUsers,
    goals: scopedGoals,
    milestones: scopedMilestones,
    declarations: scopedDeclarations,
    actionPlans: scopedActionPlans,
  };
}

async function persistAnalysis(
  userId: string,
  result: ReturnType<typeof runInsightsAnalysis>,
  councilIds?: string[]
) {
  const now = new Date();

  // Auto-dismiss stale alignment_gap issues for entities that appear in the new findings.
  // Without this, the dedup key (entityId:category) prevents updated language from replacing old records.
  const newAlignmentEntityIds = [
    ...new Set(
      result.findings
        .filter((f) => f.category === "alignment_gap")
        .map((f) => f.entityId)
    ),
  ];
  if (newAlignmentEntityIds.length > 0) {
    await db
      .update(aiAnalysisIssues)
      .set({ status: "dismissed", resolvedNote: "Superseded by updated analysis", updatedAt: now })
      .where(
        and(
          eq(aiAnalysisIssues.category, "alignment_gap"),
          inArray(aiAnalysisIssues.entityId, newAlignmentEntityIds),
          inArray(aiAnalysisIssues.status, ["open", "in_progress"])
        )
      );
  }

  // Dedup: find existing open/in_progress issues
  const existingIssues = await db
    .select({ entityId: aiAnalysisIssues.entityId, category: aiAnalysisIssues.category })
    .from(aiAnalysisIssues)
    .where(inArray(aiAnalysisIssues.status, ["open", "in_progress"]));

  const existingKeys = new Set(existingIssues.map((i) => `${i.entityId}:${i.category}`));

  const newFindings = result.findings.filter(
    (f) => !existingKeys.has(`${f.entityId}:${f.category}`)
  );
  const analysisId = createId();

  await db.insert(aiAnalyses).values({
    id: analysisId,
    analyzedBy: userId,
    summary: result.summary,
    issuesFound: newFindings.length,
    issuesResolved: 0,
    createdAt: now,
  });

  for (const finding of newFindings) {
    await db.insert(aiAnalysisIssues).values({
      id: createId(),
      analysisId,
      category: finding.category,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      resolutions: finding.resolutions?.length
        ? JSON.stringify(finding.resolutions)
        : null,
      entityType: finding.entityType,
      entityId: finding.entityId,
      entityName: finding.entityName,
      councilId: finding.councilId || null,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
  }

  const issues = await db
    .select()
    .from(aiAnalysisIssues)
    .where(eq(aiAnalysisIssues.analysisId, analysisId));

  return {
    id: analysisId,
    summary: result.summary,
    totalFindings: result.findings.length,
    newIssues: newFindings.length,
    skippedDuplicates: result.findings.length - newFindings.length,
    createdAt: now,
    issues,
  };
}

// ─── Head Coach: Full batch analysis ────────────────────────────

export async function runAnalysis() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) throw new Error("Forbidden");

  const allData = await fetchAllData();
  const [allUsers, allCouncils, allGoals, allMilestones, allDeclarations, allActionPlans] = allData;
  const currentWeek = await getCurrentWeek();

  const result = runInsightsAnalysis({
    councils: allCouncils,
    users: allUsers,
    goals: allGoals,
    milestones: allMilestones,
    declarations: allDeclarations,
    actionPlans: allActionPlans,
    currentWeek,
  });

  return persistAnalysis(user.userId, result);
}

// ─── Coach: Council-scoped analysis ─────────────────────────────

export async function runCoachAnalysis() {
  const user = await getAuthUser();
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    throw new Error("Forbidden");
  }

  const coachCouncils = await db
    .select({ id: councils.id })
    .from(councils)
    .where(eq(councils.coachId, user.userId));

  const councilIds = coachCouncils.map((c) => c.id);
  if (councilIds.length === 0) {
    return {
      id: "",
      summary: "No councils assigned. No analysis to run.",
      totalFindings: 0,
      newIssues: 0,
      skippedDuplicates: 0,
      createdAt: new Date(),
      issues: [],
    };
  }

  const allData = await fetchAllData();
  const scoped = scopeDataToCouncils(allData, councilIds);
  const currentWeek = await getCurrentWeek();

  const result = runInsightsAnalysis({ ...scoped, currentWeek });
  return persistAnalysis(user.userId, result, councilIds);
}

// ─── Shared: Analysis history (coach sees own, HC sees all) ─────

export async function getAnalysisHistory() {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) {
    throw new Error("Forbidden");
  }

  if (user.role === "head_coach") {
    return db.select().from(aiAnalyses).orderBy(desc(aiAnalyses.createdAt));
  }

  // Coach sees only their own analyses
  return db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.analyzedBy, user.userId))
    .orderBy(desc(aiAnalyses.createdAt));
}

export async function getAnalysisDetail(analysisId: string) {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) {
    throw new Error("Forbidden");
  }

  const [analysis] = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.id, analysisId))
    .limit(1);

  if (!analysis) throw new Error("Analysis not found");

  // Coach can only see their own analyses
  if (user.role === "coach" && analysis.analyzedBy !== user.userId) {
    throw new Error("Forbidden");
  }

  const issues = await db
    .select()
    .from(aiAnalysisIssues)
    .where(eq(aiAnalysisIssues.analysisId, analysisId));

  return { ...analysis, issues };
}

export async function updateIssueStatus(
  issueId: string,
  newStatus: "in_progress" | "resolved" | "dismissed",
  resolvedNote?: string
) {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) {
    throw new Error("Forbidden");
  }

  const [issue] = await db
    .select()
    .from(aiAnalysisIssues)
    .where(eq(aiAnalysisIssues.id, issueId))
    .limit(1);

  if (!issue) throw new Error("Issue not found");

  // Coach can only update issues from their own analyses
  if (user.role === "coach") {
    const [analysis] = await db
      .select({ analyzedBy: aiAnalyses.analyzedBy })
      .from(aiAnalyses)
      .where(eq(aiAnalyses.id, issue.analysisId))
      .limit(1);
    if (analysis && analysis.analyzedBy !== user.userId) {
      throw new Error("Forbidden");
    }
  }

  const validTransitions: Record<string, string[]> = {
    open: ["in_progress", "dismissed"],
    in_progress: ["resolved", "dismissed"],
  };

  if (!validTransitions[issue.status]?.includes(newStatus)) {
    throw new Error(`Invalid transition: ${issue.status} → ${newStatus}`);
  }

  const now = new Date();
  await db
    .update(aiAnalysisIssues)
    .set({
      status: newStatus,
      resolvedBy:
        newStatus === "resolved" || newStatus === "dismissed"
          ? user.userId
          : issue.resolvedBy,
      resolvedAt:
        newStatus === "resolved" || newStatus === "dismissed" ? now : issue.resolvedAt,
      resolvedNote:
        newStatus === "resolved" ? (resolvedNote || null) : issue.resolvedNote,
      updatedAt: now,
    })
    .where(eq(aiAnalysisIssues.id, issueId));

  if (newStatus === "resolved" || newStatus === "dismissed") {
    await db.run(
      sql`UPDATE ai_analyses SET issues_resolved = issues_resolved + 1 WHERE id = ${issue.analysisId}`
    );
  }

  return { success: true };
}

export async function getOpenIssues() {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach")) {
    throw new Error("Forbidden");
  }

  if (user.role === "head_coach") {
    return db
      .select()
      .from(aiAnalysisIssues)
      .where(inArray(aiAnalysisIssues.status, ["open", "in_progress"]))
      .orderBy(
        sql`CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END`,
        desc(aiAnalysisIssues.createdAt)
      );
  }

  // Coach: only see issues from their own analyses
  const coachAnalyses = await db
    .select({ id: aiAnalyses.id })
    .from(aiAnalyses)
    .where(eq(aiAnalyses.analyzedBy, user.userId));

  const analysisIds = coachAnalyses.map((a) => a.id);
  if (analysisIds.length === 0) return [];

  return db
    .select()
    .from(aiAnalysisIssues)
    .where(
      and(
        inArray(aiAnalysisIssues.analysisId, analysisIds),
        inArray(aiAnalysisIssues.status, ["open", "in_progress"])
      )
    )
    .orderBy(
      sql`CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END`,
      desc(aiAnalysisIssues.createdAt)
    );
}
