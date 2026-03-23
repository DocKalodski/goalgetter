import { db } from "@/lib/db";
import { users, goals, weeklyMilestones, declarations, batches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ParsedExcelResult, ParsedActionItem } from "./parser";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChangeRecord {
  studentName: string;
  studentId: string | null;
  weekNumber: number | null;
  goalType: "enrollment" | "personal" | "professional" | null;
  entityType:
    | "action_item"
    | "milestone_desc"
    | "goal_statement"
    | "declaration"
    | "cumulative_pct";
  entityId: string | null;
  field: string;
  oldValue: string | null;
  newValue: string;
  changeType: "added" | "modified" | "removed";
}

export interface DiffSummary {
  totalChanges: number;
  byType: Record<"added" | "modified" | "removed", number>;
  byEntity: Record<string, number>;
  studentsAffected: string[];
  weeksAffected: number[];
  unmatchedStudents: string[];
}

const GOAL_TYPES = ["enrollment", "personal", "professional"] as const;

// ─── Name Resolution ─────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function resolveStudentByName(
  sheetName: string,
  allUsers: Array<{ id: string; name: string | null; role?: string | null }>
): (typeof allUsers)[0] | null {
  const normalized = normalizeName(sheetName);

  // Strategy 1: exact match
  for (const u of allUsers) {
    if (u.name && normalizeName(u.name) === normalized) return u;
  }

  // Strategy 2: prefix/suffix partial match (e.g. sheet="Kalod", DB="Kalod Sta. Clara")
  for (const u of allUsers) {
    if (!u.name) continue;
    const dbName = normalizeName(u.name);
    if (
      dbName.startsWith(normalized + " ") ||
      normalized.startsWith(dbName + " ") ||
      dbName.endsWith(" " + normalized) ||
      normalized.endsWith(" " + dbName)
    ) {
      return u;
    }
  }

  // Strategy 3: reversed "Last, First" → "First Last"
  if (sheetName.includes(",")) {
    const parts = sheetName.split(",").map((p) => p.trim());
    const reversed = normalizeName(`${parts[1]} ${parts[0]}`);
    for (const u of allUsers) {
      if (u.name && normalizeName(u.name) === reversed) return u;
    }
    // Also try prefix on reversed
    for (const u of allUsers) {
      if (!u.name) continue;
      const dbName = normalizeName(u.name);
      if (dbName.startsWith(reversed.split(" ")[0] + " ")) return u;
    }
  }

  // Strategy 4: first-token match (first name only)
  const firstToken = normalized.split(" ")[0];
  if (firstToken.length >= 3) {
    for (const u of allUsers) {
      if (!u.name) continue;
      const dbFirst = normalizeName(u.name).split(" ")[0];
      if (dbFirst === firstToken) return u;
    }
  }

  return null;
}

// ─── Main Diff ──────────────────────────────────────────────────────────────

export async function computeChanges(parsed: ParsedExcelResult): Promise<{
  changes: ChangeRecord[];
  summary: DiffSummary;
}> {
  const changes: ChangeRecord[] = [];
  const unmatchedStudents: string[] = [];
  const studentsAffectedSet = new Set<string>();
  const weeksAffectedSet = new Set<number>();

  // Fetch total weeks for cumulative % cap (100% only at end of program)
  const [batchRow] = await db.select({ totalWeeks: batches.totalWeeks }).from(batches).limit(1);
  const totalWeeks = batchRow?.totalWeeks ?? 12;

  // Fetch all users for name matching
  const allUsers = await db.select().from(users);

  for (const [studentName, studentData] of Object.entries(parsed.data)) {
    // Resolve student by name using multi-strategy matching
    const matchedUser = resolveStudentByName(studentName, allUsers);
    const studentId = matchedUser?.id || null;

    if (!studentId) {
      unmatchedStudents.push(studentName);
      // Still record changes but with null studentId
    }

    // If we have a matched user, diff declaration
    if (studentId && studentData.meta.declaration) {
      await diffDeclaration(
        studentName,
        studentId,
        studentData.meta.declaration,
        changes
      );
    }

    // If we have a matched user, diff goal statements
    if (studentId) {
      await diffGoalStatements(studentName, studentId, studentData.meta, changes);
    }

    // Diff weekly data
    if (studentId) {
      // Fetch all goals for this student
      const studentGoals = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, studentId));

      const goalByType = new Map<string, (typeof studentGoals)[0]>();
      for (const g of studentGoals) {
        goalByType.set(g.goalType, g);
      }

      for (const [weekNumStr, weekData] of Object.entries(studentData.weeks)) {
        const weekNumber = parseInt(weekNumStr, 10);

        for (const goalType of GOAL_TYPES) {
          const goal = goalByType.get(goalType);
          if (!goal) continue;

          // Fetch existing milestone for this goal + week
          const existingMilestones = await db
            .select()
            .from(weeklyMilestones)
            .where(
              and(
                eq(weeklyMilestones.goalId, goal.id),
                eq(weeklyMilestones.weekNumber, weekNumber)
              )
            );

          const milestone = existingMilestones[0] || null;

          // Diff milestone description
          diffMilestoneDesc(
            studentName,
            studentId,
            weekNumber,
            goalType,
            milestone,
            weekData.milestone[goalType],
            changes
          );

          // Diff action items
          diffActionItems(
            studentName,
            studentId,
            weekNumber,
            goalType,
            milestone,
            weekData.actions[goalType],
            changes
          );

          // Diff cumulative percentage (capped: week N cannot exceed N/totalWeeks * 100)
          diffCumulativePct(
            studentName,
            studentId,
            weekNumber,
            goalType,
            milestone,
            weekData.cumulative_pct[goalType],
            changes,
            totalWeeks
          );

          // Track affected
          if (changes.length > 0) {
            studentsAffectedSet.add(studentName);
            weeksAffectedSet.add(weekNumber);
          }
        }
      }
    }
  }

  // Build summary
  const byType: Record<"added" | "modified" | "removed", number> = {
    added: 0,
    modified: 0,
    removed: 0,
  };
  const byEntity: Record<string, number> = {};

  for (const c of changes) {
    byType[c.changeType]++;
    byEntity[c.entityType] = (byEntity[c.entityType] || 0) + 1;
    studentsAffectedSet.add(c.studentName);
    if (c.weekNumber) weeksAffectedSet.add(c.weekNumber);
  }

  return {
    changes,
    summary: {
      totalChanges: changes.length,
      byType,
      byEntity,
      studentsAffected: Array.from(studentsAffectedSet),
      weeksAffected: Array.from(weeksAffectedSet).sort((a, b) => a - b),
      unmatchedStudents,
    },
  };
}

// ─── Declaration Diff ───────────────────────────────────────────────────────

async function diffDeclaration(
  studentName: string,
  studentId: string,
  newDeclaration: string,
  changes: ChangeRecord[]
) {
  if (!newDeclaration) return;

  const existing = await db
    .select()
    .from(declarations)
    .where(eq(declarations.userId, studentId));

  const current = existing[0];

  if (!current) {
    if (newDeclaration.trim()) {
      changes.push({
        studentName,
        studentId,
        weekNumber: null,
        goalType: null,
        entityType: "declaration",
        entityId: null,
        field: "text",
        oldValue: null,
        newValue: newDeclaration,
        changeType: "added",
      });
    }
  } else if (current.text.trim() !== newDeclaration.trim()) {
    changes.push({
      studentName,
      studentId,
      weekNumber: null,
      goalType: null,
      entityType: "declaration",
      entityId: current.id,
      field: "text",
      oldValue: current.text,
      newValue: newDeclaration,
      changeType: "modified",
    });
  }
}

// ─── Goal Statement Diff ────────────────────────────────────────────────────

async function diffGoalStatements(
  studentName: string,
  studentId: string,
  meta: { goalStatements: Record<string, string> },
  changes: ChangeRecord[]
) {
  const studentGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, studentId));

  for (const goalType of GOAL_TYPES) {
    const newStatement = meta.goalStatements[goalType];
    if (!newStatement) continue;

    const existing = studentGoals.find((g) => g.goalType === goalType);
    if (!existing) {
      if (newStatement.trim()) {
        changes.push({
          studentName,
          studentId,
          weekNumber: null,
          goalType,
          entityType: "goal_statement",
          entityId: null,
          field: "goalStatement",
          oldValue: null,
          newValue: newStatement,
          changeType: "added",
        });
      }
    } else if (existing.goalStatement.trim() !== newStatement.trim()) {
      changes.push({
        studentName,
        studentId,
        weekNumber: null,
        goalType,
        entityType: "goal_statement",
        entityId: existing.id,
        field: "goalStatement",
        oldValue: existing.goalStatement,
        newValue: newStatement,
        changeType: "modified",
      });
    }
  }
}

// ─── Milestone Description Diff ─────────────────────────────────────────────

function diffMilestoneDesc(
  studentName: string,
  studentId: string,
  weekNumber: number,
  goalType: "enrollment" | "personal" | "professional",
  milestone: { id: string; milestoneDescription: string | null } | null,
  newDesc: string,
  changes: ChangeRecord[]
) {
  const oldDesc = milestone?.milestoneDescription || "";
  const trimmedNew = newDesc.trim();
  const trimmedOld = oldDesc.trim();

  if (trimmedNew === trimmedOld) return;

  if (!milestone) {
    if (trimmedNew) {
      changes.push({
        studentName,
        studentId,
        weekNumber,
        goalType,
        entityType: "milestone_desc",
        entityId: null,
        field: "milestoneDescription",
        oldValue: null,
        newValue: trimmedNew,
        changeType: "added",
      });
    }
  } else {
    changes.push({
      studentName,
      studentId,
      weekNumber,
      goalType,
      entityType: "milestone_desc",
      entityId: milestone.id,
      field: "milestoneDescription",
      oldValue: trimmedOld || null,
      newValue: trimmedNew,
      changeType: trimmedNew ? "modified" : "removed",
    });
  }
}

// ─── Action Items Diff ──────────────────────────────────────────────────────

function diffActionItems(
  studentName: string,
  studentId: string,
  weekNumber: number,
  goalType: "enrollment" | "personal" | "professional",
  milestone: { id: string; actions: string | null } | null,
  newActions: ParsedActionItem[],
  changes: ChangeRecord[]
) {
  // Parse existing actions from DB (stored as JSON)
  let oldActions: ParsedActionItem[] = [];
  if (milestone?.actions) {
    try {
      oldActions = JSON.parse(milestone.actions);
    } catch {
      oldActions = [];
    }
  }

  // Filter out empty items for comparison
  const oldFiltered = oldActions.filter((a) => a.text.trim() !== "");
  const newFiltered = newActions.filter((a) => a.text.trim() !== "");

  // Set-based comparison: avoids false add/remove pairs when items are reordered
  const oldTexts = new Map<string, ParsedActionItem>();
  for (const item of oldFiltered) {
    oldTexts.set(item.text.trim().toLowerCase(), item);
  }
  const newTexts = new Map<string, ParsedActionItem>();
  for (const item of newFiltered) {
    newTexts.set(item.text.trim().toLowerCase(), item);
  }

  // Added: in new but not in old
  for (const [key, newItem] of newTexts) {
    if (!oldTexts.has(key)) {
      changes.push({
        studentName,
        studentId,
        weekNumber,
        goalType,
        entityType: "action_item",
        entityId: milestone?.id || null,
        field: `actions[+]`,
        oldValue: null,
        newValue: JSON.stringify(newItem),
        changeType: "added",
      });
    }
  }

  // Removed: in old but not in new (only if DB had them — no false removals from empty Excel rows)
  for (const [key, oldItem] of oldTexts) {
    if (!newTexts.has(key)) {
      changes.push({
        studentName,
        studentId,
        weekNumber,
        goalType,
        entityType: "action_item",
        entityId: milestone?.id || null,
        field: `actions[-]`,
        oldValue: JSON.stringify(oldItem),
        newValue: "",
        changeType: "removed",
      });
    }
  }

  // Modified done status: same text, different done flag
  for (const [key, newItem] of newTexts) {
    const oldItem = oldTexts.get(key);
    if (oldItem && oldItem.done !== newItem.done) {
      changes.push({
        studentName,
        studentId,
        weekNumber,
        goalType,
        entityType: "action_item",
        entityId: milestone?.id || null,
        field: `actions[done]:${newItem.text.substring(0, 30)}`,
        oldValue: String(oldItem.done),
        newValue: String(newItem.done),
        changeType: "modified",
      });
    }
  }
}

// ─── Cumulative Percentage Diff ─────────────────────────────────────────────

function diffCumulativePct(
  studentName: string,
  studentId: string,
  weekNumber: number,
  goalType: "enrollment" | "personal" | "professional",
  milestone: { id: string; cumulativePercentage: number } | null,
  newPct: number,
  changes: ChangeRecord[],
  totalWeeks = 12
) {
  const oldPct = milestone?.cumulativePercentage || 0;

  // Convert to integer % (0-100): Excel may store as decimal (0.0833) or integer (8)
  const rawPctInt = newPct > 1 ? Math.round(newPct) : Math.round(newPct * 100);

  // Cap: 100% is only achievable when ALL weeks are done.
  // Week N can contribute at most (N / totalWeeks) * 100 cumulative %.
  const maxAllowedPct = Math.round((weekNumber / totalWeeks) * 100);
  const newPctInt = Math.min(rawPctInt, maxAllowedPct);

  const oldPctInt = oldPct;

  if (newPctInt === oldPctInt) return;

  changes.push({
    studentName,
    studentId,
    weekNumber,
    goalType,
    entityType: "cumulative_pct",
    entityId: milestone?.id || null,
    field: "cumulativePercentage",
    oldValue: String(oldPctInt),
    newValue: String(newPctInt),
    changeType: milestone ? "modified" : "added",
  });
}
