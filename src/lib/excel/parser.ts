import ExcelJS from "exceljs";
import { readFile } from "fs/promises";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ParsedActionItem {
  text: string;
  done: boolean;
}

export interface ParsedWeekData {
  actions: Record<"enrollment" | "personal" | "professional", ParsedActionItem[]>;
  milestone: Record<"enrollment" | "personal" | "professional", string>;
  cumulative_pct: Record<"enrollment" | "personal" | "professional", number>;
  done: Record<"enrollment" | "personal" | "professional", string>;
}

export interface ParsedStudentMeta {
  name: string;
  declaration: string;
  goalStatements: Record<"enrollment" | "personal" | "professional", string>;
  values: Record<"enrollment" | "personal" | "professional", string>;
}

export interface ParsedStudentData {
  meta: ParsedStudentMeta;
  weeks: Record<string, ParsedWeekData>;
}

export interface ParsedExcelResult {
  data: Record<string, ParsedStudentData>;
  warnings: string[];
  meta: { sheetsProcessed: number; studentsFound: string[] };
}

// ─── Constants ──────────────────────────────────────────────────────────────

// Sheets to skip (not individual student data)
const SKIP_SHEETS = ["Instructions", "SummaryL99", "HC Louie", "Summary", "Goal Completion", "Checker"];

// Excel layout constants
const WEEK_BLOCK_SIZE = 18;
const WEEK_START_ROW = 9;
const ACTION_ITEMS_PER_GOAL = 10;
const ACTION_ITEM_OFFSET = 3; // rows 12-21 within week block → offset 3 from week start

// Column mappings (1-indexed) for action items text
const ACTION_TEXT_COLS: Record<string, number> = {
  enrollment: 4,    // Column D
  personal: 8,      // Column H
  professional: 12, // Column L
};

// Column mappings for done flags (Y/N)
const ACTION_DONE_COLS: Record<string, number> = {
  enrollment: 6,    // Column F
  personal: 10,     // Column J
  professional: 14, // Column N
};

// Column mappings for milestone descriptions (same as action text cols, at offset 0)
const MILESTONE_COLS: Record<string, number> = {
  enrollment: 4,    // Column D
  personal: 8,      // Column H
  professional: 12, // Column L
};

// Column mappings for cumulative % (offset 1 from week start)
const CUMULATIVE_PCT_COLS: Record<string, number> = {
  enrollment: 5,    // Column E
  personal: 9,      // Column I
  professional: 13, // Column M
};

// Header area: student meta
const META_ROWS = {
  name: 2,          // Row 2, Column 12 (L) — "KALOD STA CLARA"
  declaration: 3,   // Row 3, Column 12 (L) — "My Courage Empowers"
  goalStatement: 6, // Row 6, Columns D/H/L
  values: 7,        // Row 7, Columns D/H/L
};

// ─── Helper ─────────────────────────────────────────────────────────────────

function cellStr(sheet: ExcelJS.Worksheet, row: number, col: number): string {
  const cell = sheet.getCell(row, col);
  if (cell.value === null || cell.value === undefined) return "";
  // Handle rich text
  if (typeof cell.value === "object" && "richText" in cell.value) {
    return (cell.value as ExcelJS.CellRichTextValue).richText
      .map((rt) => rt.text)
      .join("")
      .trim();
  }
  return String(cell.value).trim();
}

function cellNum(sheet: ExcelJS.Worksheet, row: number, col: number): number {
  const cell = sheet.getCell(row, col);
  if (cell.value === null || cell.value === undefined) return 0;
  // Numeric (ExcelJS returns formatted % cells as decimals, e.g. 0.08 for 8%)
  if (typeof cell.value === "number") return cell.value;
  // Rich text containing a number
  if (typeof cell.value === "object" && "richText" in cell.value) {
    const text = (cell.value as ExcelJS.CellRichTextValue).richText
      .map((rt) => rt.text)
      .join("")
      .trim();
    return parseNumericString(text);
  }
  return parseNumericString(String(cell.value).trim());
}

/** Parse a numeric string, handling "8%", "8.3%", plain numbers, and decimals */
function parseNumericString(s: string): number {
  if (!s) return 0;
  if (s.endsWith("%")) {
    const n = parseFloat(s);
    // "8%" → store as 0.08 (same scale as ExcelJS decimal percentages)
    return isNaN(n) ? 0 : n / 100;
  }
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

const GOAL_TYPES = ["enrollment", "personal", "professional"] as const;

// ─── Excel Parser ───────────────────────────────────────────────────────────

export async function parseExcelTracker(
  filePath: string
): Promise<ParsedExcelResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const warnings: string[] = [];
  const data: Record<string, ParsedStudentData> = {};
  let sheetsProcessed = 0;

  for (const sheet of workbook.worksheets) {
    if (SKIP_SHEETS.includes(sheet.name)) continue;

    // Also skip if sheet name starts with "HC " (head coach sheets)
    if (sheet.name.startsWith("HC ")) continue;

    sheetsProcessed++;
    const studentName = sheet.name.trim();

    // Parse student meta from header area
    const meta: ParsedStudentMeta = {
      name: studentName,
      declaration: cellStr(sheet, META_ROWS.declaration, 12),
      goalStatements: {
        enrollment: cellStr(sheet, META_ROWS.goalStatement, 4),
        personal: cellStr(sheet, META_ROWS.goalStatement, 8),
        professional: cellStr(sheet, META_ROWS.goalStatement, 12),
      },
      values: {
        enrollment: cellStr(sheet, META_ROWS.values, 4),
        personal: cellStr(sheet, META_ROWS.values, 8),
        professional: cellStr(sheet, META_ROWS.values, 12),
      },
    };

    const weeks: Record<string, ParsedWeekData> = {};

    for (let weekNum = 1; weekNum <= 12; weekNum++) {
      const weekStartRow = WEEK_START_ROW + (weekNum - 1) * WEEK_BLOCK_SIZE;

      const weekData: ParsedWeekData = {
        actions: { enrollment: [], personal: [], professional: [] },
        milestone: { enrollment: "", personal: "", professional: "" },
        cumulative_pct: { enrollment: 0, personal: 0, professional: 0 },
        done: { enrollment: "", personal: "", professional: "" },
      };

      for (const goalType of GOAL_TYPES) {
        // Milestone description: at weekStartRow + 0
        weekData.milestone[goalType] = cellStr(
          sheet,
          weekStartRow,
          MILESTONE_COLS[goalType]
        );

        // Cumulative %: at weekStartRow + 1
        const pctVal = cellNum(
          sheet,
          weekStartRow + 1,
          CUMULATIVE_PCT_COLS[goalType]
        );
        weekData.cumulative_pct[goalType] = pctVal;

        // Done flag: at weekStartRow + 1 (same row as cumPct)
        weekData.done[goalType] = cellStr(
          sheet,
          weekStartRow + 1,
          ACTION_DONE_COLS[goalType]
        );

        // Action items: 10 rows starting at weekStartRow + ACTION_ITEM_OFFSET
        const actions: ParsedActionItem[] = [];
        for (let i = 0; i < ACTION_ITEMS_PER_GOAL; i++) {
          const actionRow = weekStartRow + ACTION_ITEM_OFFSET + i;
          const text = cellStr(sheet, actionRow, ACTION_TEXT_COLS[goalType]);
          const doneStr = cellStr(sheet, actionRow, ACTION_DONE_COLS[goalType]);
          actions.push({
            text,
            done: doneStr.toUpperCase() === "Y",
          });
        }
        weekData.actions[goalType] = actions;
      }

      weeks[String(weekNum)] = weekData;
    }

    data[studentName] = { meta, weeks };
  }

  return {
    data,
    warnings,
    meta: {
      sheetsProcessed,
      studentsFound: Object.keys(data),
    },
  };
}

// ─── JSON Parser (fallback) ─────────────────────────────────────────────────

interface JsonActionItem {
  text: string;
  done: boolean;
}

interface JsonWeekData {
  actions: Record<string, JsonActionItem[]>;
  milestone: Record<string, string>;
  cumulative_pct?: Record<string, number>;
  done?: Record<string, string>;
}

type JsonTrackerData = Record<string, Record<string, JsonWeekData>>;

export async function parseJsonTracker(
  filePath: string
): Promise<ParsedExcelResult> {
  const raw = await readFile(filePath, "utf-8");
  const jsonData: JsonTrackerData = JSON.parse(raw);

  const warnings: string[] = [];
  const data: Record<string, ParsedStudentData> = {};

  for (const [studentName, weeksRaw] of Object.entries(jsonData)) {
    const weeks: Record<string, ParsedWeekData> = {};

    for (const [weekNum, weekRaw] of Object.entries(weeksRaw)) {
      const weekData: ParsedWeekData = {
        actions: { enrollment: [], personal: [], professional: [] },
        milestone: { enrollment: "", personal: "", professional: "" },
        cumulative_pct: { enrollment: 0, personal: 0, professional: 0 },
        done: { enrollment: "", personal: "", professional: "" },
      };

      for (const goalType of GOAL_TYPES) {
        weekData.actions[goalType] = (weekRaw.actions?.[goalType] || []).map(
          (a) => ({
            text: a.text || "",
            done: Boolean(a.done),
          })
        );
        weekData.milestone[goalType] = weekRaw.milestone?.[goalType] || "";
        weekData.cumulative_pct[goalType] =
          weekRaw.cumulative_pct?.[goalType] || 0;
        weekData.done[goalType] = weekRaw.done?.[goalType] || "";
      }

      weeks[weekNum] = weekData;
    }

    data[studentName] = {
      meta: {
        name: studentName,
        declaration: "",
        goalStatements: { enrollment: "", personal: "", professional: "" },
        values: { enrollment: "", personal: "", professional: "" },
      },
      weeks,
    };
  }

  return {
    data,
    warnings,
    meta: {
      sheetsProcessed: Object.keys(jsonData).length,
      studentsFound: Object.keys(data),
    },
  };
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateParsedData(result: ParsedExcelResult): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (Object.keys(result.data).length === 0) {
    errors.push("No student data found in file");
  }

  for (const [name, student] of Object.entries(result.data)) {
    const weekCount = Object.keys(student.weeks).length;
    if (weekCount === 0) {
      errors.push(`${name}: No week data found`);
    }

    for (const [weekNum, week] of Object.entries(student.weeks)) {
      for (const goalType of GOAL_TYPES) {
        if (!week.actions[goalType]) {
          errors.push(`${name} Week ${weekNum}: Missing ${goalType} actions`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
