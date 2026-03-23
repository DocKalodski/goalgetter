/**
 * sync-excel-to-db.ts
 * Reads the latest uploaded Excel tracker and syncs ALL data to the DB.
 * Matches students by name (Excel sheet name = DB user.name).
 * Updates: declarations, goal statements, values, milestone descriptions,
 *          action items, and cumulative percentages.
 * Run: npx tsx scripts/sync-excel-to-db.ts
 */

import { join } from "path";
import { db } from "../src/lib/db";
import { users, goals, weeklyMilestones, declarations } from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseExcelTracker } from "../src/lib/excel/parser";

const EXCEL_PATH = join(
  process.cwd(),
  "storage/uploads/l9eddo9gz9iuw8uvk8tw3b96-LEAP_99_Coaches__Goal_Tracker_v3.1.xlsx"
);

const GOAL_TYPES = ["enrollment", "personal", "professional"] as const;

async function main() {
  console.log("Reading Excel file...");
  const parsed = await parseExcelTracker(EXCEL_PATH);

  const studentNames = Object.keys(parsed.data);
  console.log(`Found ${studentNames.length} student sheets: ${studentNames.join(", ")}`);

  if (parsed.warnings.length > 0) {
    console.warn("Warnings:", parsed.warnings);
  }

  // Load all users + goals + milestones from DB
  const allUsers = await db.select().from(users);
  const allGoals = await db.select().from(goals);
  const allMilestones = await db.select().from(weeklyMilestones);
  const allDecls = await db.select().from(declarations);

  const now = new Date();
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [sheetName, studentData] of Object.entries(parsed.data)) {
    // Match student by name (exact or case-insensitive)
    const dbUser = allUsers.find(
      (u) =>
        u.name === sheetName ||
        u.name?.toLowerCase() === sheetName.toLowerCase()
    );

    if (!dbUser) {
      console.warn(`  SKIP: No DB user found for sheet "${sheetName}"`);
      skipped++;
      continue;
    }

    console.log(`\nProcessing: ${sheetName} → ${dbUser.name} (${dbUser.id})`);

    // ── Declaration ─────────────────────────────────────
    const excelDecl = studentData.meta.declaration.trim();
    if (excelDecl) {
      const dbDecl = allDecls.find((d) => d.userId === dbUser.id);
      if (dbDecl) {
        if (dbDecl.text !== excelDecl) {
          await db
            .update(declarations)
            .set({ text: excelDecl, updatedAt: now })
            .where(eq(declarations.id, dbDecl.id));
          console.log(`  Declaration updated: "${excelDecl.substring(0, 60)}..."`);
          updated++;
        } else {
          console.log(`  Declaration unchanged`);
        }
      } else {
        console.warn(`  No declaration row in DB for ${sheetName}, skipping`);
      }
    }

    // ── Goals + Milestones ───────────────────────────────
    for (const goalType of GOAL_TYPES) {
      const excelGoalStmt = studentData.meta.goalStatements[goalType].trim();
      const excelValues = studentData.meta.values[goalType].trim();

      // Find matching goal in DB
      const dbGoal = allGoals.find(
        (g) => g.userId === dbUser.id && g.goalType === goalType
      );

      if (!dbGoal) {
        console.warn(`  No ${goalType} goal in DB for ${sheetName}`);
        continue;
      }

      // Update goal statement + values if changed
      const goalUpdates: Record<string, string> = {};
      if (excelGoalStmt && dbGoal.goalStatement !== excelGoalStmt) {
        goalUpdates.goalStatement = excelGoalStmt;
      }
      if (excelValues && dbGoal.valuesDeclaration !== excelValues) {
        goalUpdates.valuesDeclaration = excelValues;
      }
      if (Object.keys(goalUpdates).length > 0) {
        await db
          .update(goals)
          .set({ ...goalUpdates, updatedAt: now })
          .where(eq(goals.id, dbGoal.id));
        console.log(`  ${goalType} goal updated: ${Object.keys(goalUpdates).join(", ")}`);
        updated++;
      }

      // Update weekly milestones
      for (let weekNum = 1; weekNum <= 12; weekNum++) {
        const weekKey = String(weekNum);
        const excelWeek = studentData.weeks[weekKey];
        if (!excelWeek) continue;

        const dbMilestone = allMilestones.find(
          (m) => m.goalId === dbGoal.id && m.weekNumber === weekNum
        );

        if (!dbMilestone) {
          console.warn(`  No week ${weekNum} ${goalType} milestone in DB for ${sheetName}`);
          continue;
        }

        // Build action items array from Excel (filter empty)
        const excelActions = excelWeek.actions[goalType]
          .filter((a) => a.text.trim() !== "")
          .map((a) => ({ text: a.text.trim(), done: a.done }));

        // Pad to 10 slots
        const paddedActions: { text: string; done: boolean }[] = [...excelActions];
        while (paddedActions.length < 10) {
          paddedActions.push({ text: "", done: false });
        }

        const excelMilestoneDesc = excelWeek.milestone[goalType].trim();
        const excelCumPct = Math.round(excelWeek.cumulative_pct[goalType]);

        // Recalculate pct from actions if Excel pct is 0 but we have actions
        let finalPct = excelCumPct;
        if (finalPct === 0 && excelActions.length > 0) {
          const doneCount = excelActions.filter((a) => a.done).length;
          finalPct = Math.round((doneCount / excelActions.length) * 100);
        }

        const milestoneUpdates: Record<string, unknown> = {};

        if (excelMilestoneDesc && dbMilestone.milestoneDescription !== excelMilestoneDesc) {
          milestoneUpdates.milestoneDescription = excelMilestoneDesc;
        }

        const currentActions = JSON.stringify(paddedActions);
        if (dbMilestone.actions !== currentActions) {
          milestoneUpdates.actions = currentActions;
        }

        if (dbMilestone.cumulativePercentage !== finalPct) {
          milestoneUpdates.cumulativePercentage = finalPct;
        }

        if (Object.keys(milestoneUpdates).length > 0) {
          await db
            .update(weeklyMilestones)
            .set({ ...milestoneUpdates, updatedAt: now })
            .where(eq(weeklyMilestones.id, dbMilestone.id));
          console.log(`  Week ${weekNum} ${goalType}: updated ${Object.keys(milestoneUpdates).join(", ")} (pct=${finalPct}%)`);
          updated++;
        }
      }
    }
  }

  console.log(`\n✅ Done. Updated: ${updated} records | Skipped: ${skipped} sheets | Errors: ${errors}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
