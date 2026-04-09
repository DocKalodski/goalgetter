import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { goals, users, weeklyMilestones } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImportResult {
  studentName: string;
  matched: boolean;
  userId?: string;
  goalsUpdated: number;
  milestonesWritten: number;
  error?: string;
}

interface ParsedMilestone {
  weekNumber: number;
  weekStart: string | null;
  weekEnd: string | null;
  description: string;
  cumulativePct: number;
  done: boolean;
  actions: { text: string; done: boolean }[];
}

interface ParsedGoal {
  goalType: "enrollment" | "personal" | "professional";
  goalStatement: string;
  milestones: ParsedMilestone[];
}

interface ParsedStudent {
  name: string;
  declaration: string;
  goals: ParsedGoal[];
}

// ─── Excel structure constants ────────────────────────────────────────────────
// Col indices (0-based): Enrollment=D(3), Personal=H(7), Professional=L(11)
const DESC_COL  = [3, 7, 11];
const CUM_COL   = [4, 8, 12];
const DONE_COL  = [5, 9, 13];
const GOAL_TYPES = ["enrollment", "personal", "professional"] as const;

function toISO(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  // xlsx serial date number
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.y}-${p(d.m)}-${p(d.d)}`;
    }
  }
  return null;
}

function toPct(v: unknown): number {
  if (v == null) return 0;
  const f = parseFloat(String(v));
  if (isNaN(f)) return 0;
  return f <= 1 ? Math.round(f * 10000) / 100 : Math.round(f * 100) / 100;
}

function isDone(v: unknown): boolean {
  return String(v ?? "").trim().toLowerCase() === "y";
}

function cleanText(v: unknown): string {
  return String(v ?? "").replace(/^[•·\s\uFFFD]+/, "").trim();
}

// ─── Parse one sheet ──────────────────────────────────────────────────────────

export function parseStudentSheet(ws: XLSX.WorkSheet): ParsedStudent | null {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null }) as unknown[][];
  if (!rows.length) return null;

  let name = "";
  let declaration = "";
  const goalStatements: Record<string, string> = {};

  // Week parse state
  const weekMap: Record<number, { mils: ParsedMilestone[] }> = {};
  let currentWeek: number | null = null;

  for (const row of rows) {
    const r = row as unknown[];

    // Name row: col L (11) has "KALOD STA CLARA" after "Name:" row
    if (String(r[11] ?? "").toUpperCase().includes("KALOD") ||
        /^[A-Z][A-Z\s]+$/.test(String(r[11] ?? "").trim())) {
      const candidate = String(r[11] ?? "").trim();
      if (candidate && !candidate.startsWith("Name") && !candidate.startsWith("Decl") && candidate.length > 2) {
        name = name || candidate;
      }
    }

    // Declaration row
    if (String(r[11] ?? "").toLowerCase().includes("declaration")) {
      const nextVal = String(r[11] ?? "");
      if (nextVal.toLowerCase() === "declaration:") {
        // next col might have it
        declaration = declaration || String(r[12] ?? r[13] ?? "").trim();
      }
    }
    // Declaration value row (italic text below "Declaration:")
    if (!declaration && r[11] && !String(r[11]).toLowerCase().includes("name") &&
        !String(r[11]).toLowerCase().includes("declaration") &&
        /^[A-Z][a-z]/.test(String(r[11]).trim())) {
      declaration = declaration || String(r[11]).trim();
    }

    // Goal statements row
    if (String(r[0] ?? "").toLowerCase().includes("goal statement")) {
      goalStatements.enrollment   = cleanText(r[3]);
      goalStatements.personal     = cleanText(r[7]);
      goalStatements.professional = cleanText(r[11]);
    }

    // Week header: col[0] matches "Week N"
    if (typeof r[0] === "string" && /^Week\s+\d+/i.test(r[0].trim())) {
      const wnum = parseInt(/\d+/.exec(r[0])![0]);
      currentWeek = wnum;
      if (!weekMap[wnum]) {
        weekMap[wnum] = {
          mils: GOAL_TYPES.map((_, i) => ({
            weekNumber: wnum,
            weekStart: null,
            weekEnd: null,
            description: cleanText(r[DESC_COL[i]]),
            cumulativePct: 0,
            done: false,
            actions: [],
          })),
        };
      }
    }

    // Date row: col[0] is a number (serial date) and col[1] is ' -'
    if (currentWeek !== null && r[1] === " -" &&
        (typeof r[0] === "number" || r[0] instanceof Date)) {
      const entry = weekMap[currentWeek];
      if (entry) {
        for (let i = 0; i < 3; i++) {
          entry.mils[i].weekStart = toISO(r[0]);
          entry.mils[i].weekEnd   = toISO(r[2]);
          // Hard-lock W1=25, W2=37.5 per LEAP 99 official schedule
          const rawPct = toPct(r[CUM_COL[i]]);
          entry.mils[i].cumulativePct = currentWeek === 1 ? 25 : currentWeek === 2 ? 37.5 : rawPct;
          entry.mils[i].done          = isDone(r[DONE_COL[i]]);
        }
      }
    }

    // Action plan row
    if (currentWeek !== null && String(r[0] ?? "").trim() === "APLAN") {
      const entry = weekMap[currentWeek];
      if (entry) {
        for (let i = 0; i < 3; i++) {
          const text = cleanText(r[DESC_COL[i]]);
          if (text) {
            entry.mils[i].actions.push({ text, done: isDone(r[DONE_COL[i]]) });
          }
        }
      }
    }
  }

  // Extract name from row where col[11] is after "Name:"
  // Better approach: scan for the actual name
  for (const row of rows) {
    const r = row as unknown[];
    if (String(r[11] ?? "").trim() === "Name:") {
      // name is in the next row at col 11
    }
    // Name is a bold all-caps row below "Name:"
    if (!name && r[11] && String(r[11]).trim().length > 2 &&
        /^[A-Z\s]+$/.test(String(r[11]).trim()) &&
        !["NAME:", "DECLARATION:"].includes(String(r[11]).toUpperCase().trim())) {
      name = String(r[11]).trim();
    }
  }

  const parsedGoals: ParsedGoal[] = GOAL_TYPES.map((gt, i) => ({
    goalType: gt,
    goalStatement: goalStatements[gt] ?? "",
    milestones: Object.values(weekMap)
      .map((w) => w.mils[i])
      .filter((m) => m.description || m.actions.length > 0),
  }));

  return { name, declaration, goals: parsedGoals };
}

// ─── Import parsed data to DB ─────────────────────────────────────────────────

export async function importStudentData(parsed: ParsedStudent): Promise<ImportResult> {
  const result: ImportResult = {
    studentName: parsed.name,
    matched: false,
    goalsUpdated: 0,
    milestonesWritten: 0,
  };

  // Match user by first name (case-insensitive)
  const firstName = parsed.name.split(/\s+/)[0].toLowerCase();
  const allUsers = await db.select({ id: users.id, name: users.name, role: users.role })
    .from(users);

  const match = allUsers.find(
    (u) => u.role === "student" && u.name?.toLowerCase().split(/\s+/)[0] === firstName
  );

  if (!match) {
    result.error = `No student user found matching "${parsed.name}"`;
    return result;
  }

  result.matched = true;
  result.userId = match.id;
  const now = new Date();

  for (const pg of parsed.goals) {
    if (!pg.goalStatement && pg.milestones.length === 0) continue;

    // Find or skip goal
    const [existingGoal] = await db.select()
      .from(goals)
      .where(and(eq(goals.userId, match.id), eq(goals.goalType, pg.goalType)));

    if (!existingGoal) continue;

    // Update goal statement
    if (pg.goalStatement) {
      await db.update(goals)
        .set({ goalStatement: pg.goalStatement, updatedAt: now })
        .where(eq(goals.id, existingGoal.id));
      result.goalsUpdated++;
    }

    // Upsert milestones
    for (const m of pg.milestones) {
      if (!m.description && m.actions.length === 0) continue;

      const [existing] = await db.select()
        .from(weeklyMilestones)
        .where(and(
          eq(weeklyMilestones.goalId, existingGoal.id),
          eq(weeklyMilestones.weekNumber, m.weekNumber)
        ));

      const approvalStatus = m.done ? "approved" : "pending";
      const actionsJson = JSON.stringify(m.actions);

      if (existing) {
        await db.update(weeklyMilestones).set({
          weekStartDate: m.weekStart,
          weekEndDate: m.weekEnd,
          milestoneDescription: m.description || existing.milestoneDescription,
          actions: actionsJson,
          cumulativePercentage: m.cumulativePct,
          approvalStatus,
          updatedAt: now,
        }).where(eq(weeklyMilestones.id, existing.id));
      } else {
        await db.insert(weeklyMilestones).values({
          id: createId(),
          goalId: existingGoal.id,
          weekNumber: m.weekNumber,
          weekStartDate: m.weekStart,
          weekEndDate: m.weekEnd,
          milestoneDescription: m.description,
          actions: actionsJson,
          cumulativePercentage: m.cumulativePct,
          approvalStatus,
          createdAt: now,
          updatedAt: now,
        });
      }
      result.milestonesWritten++;
    }
  }

  return result;
}

// ─── Main entry: parse buffer → import all sheets ─────────────────────────────

export async function importExcelBuffer(buffer: Buffer): Promise<ImportResult[]> {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  // Skip non-student sheets
  const skip = new Set(["Instructions", "SummaryL99", "Summary", "HC Louie",
                         "Goal Completion", "Checker"]);

  const results: ImportResult[] = [];
  for (const sheetName of wb.SheetNames) {
    if (skip.has(sheetName)) continue;
    const ws = wb.Sheets[sheetName];
    const parsed = parseStudentSheet(ws);
    if (!parsed?.name) {
      results.push({ studentName: sheetName, matched: false,
                     goalsUpdated: 0, milestonesWritten: 0,
                     error: "Could not parse student name" });
      continue;
    }
    // Override name with sheet name (more reliable)
    parsed.name = sheetName;
    const res = await importStudentData(parsed);
    results.push(res);
    console.log(`[excel-import] ${sheetName}: matched=${res.matched} milestones=${res.milestonesWritten} err=${res.error ?? "-"}`);
  }
  return results;
}
