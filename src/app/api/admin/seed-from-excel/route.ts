import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { batches, users, goals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { hashPassword } from "@/lib/auth/password";
import { importExcelBuffer } from "@/lib/excel-import";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const SKIP_SHEETS = new Set([
  "Instructions", "SummaryL99", "HC Louie", "Summary",
  "Goal Completion", "Checker",
]);

const GOAL_TYPES = ["enrollment", "personal", "professional"] as const;

interface SeedResult {
  studentName: string;
  action: "created" | "skipped" | "error";
  userId?: string;
  goalsCreated?: number;
  milestonesWritten?: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !isHeadCoach(user)) {
      return NextResponse.json({ error: "Unauthorized. Head coaches only." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      return NextResponse.json({ error: "Only .xlsx or .xls files accepted" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

    // Get or create the LEAP 99 batch
    const [existingBatch] = await db.select().from(batches).limit(1);
    let batchId: string;
    const now = new Date();

    if (existingBatch) {
      batchId = existingBatch.id;
    } else {
      batchId = createId();
      await db.insert(batches).values({
        id: batchId,
        name: "LEAP 99",
        startDate: "2026-02-02",
        endDate: "2026-04-26",
        currentWeek: 8,
        totalWeeks: 12,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Load all existing users for matching (include email for dedup)
    const allUsers = await db.select({ id: users.id, name: users.name, role: users.role, email: users.email })
      .from(users);

    const defaultPassword = await hashPassword("leap99");
    const results: SeedResult[] = [];

    for (const sheetName of wb.SheetNames) {
      if (SKIP_SHEETS.has(sheetName)) continue;
      if (sheetName.startsWith("HC ")) continue;

      // Generate the email we would use for this student
      const emailBase = sheetName.trim().toLowerCase().replace(/[^a-z0-9]/g, ".");
      const email = `${emailBase}@leap99.com`;

      // Check by email first (catches partial previous runs), then by first name
      const firstName = sheetName.trim().split(/\s+/)[0].toLowerCase();
      const existing = allUsers.find(
        (u) => u.email === email ||
               ((u.role === "student" || u.role === "council_leader") &&
                u.name?.toLowerCase().split(/\s+/)[0] === firstName)
      );

      if (existing) {
        results.push({ studentName: sheetName, action: "skipped", userId: existing.id });
        continue;
      }

      // Parse goal statements from this sheet
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null }) as unknown[][];

      const goalStatements: Record<string, string> = {};
      const valuesMap: Record<string, string> = {};
      let declaration = "";

      for (const row of rows) {
        const r = row as unknown[];
        // Goal statement row
        if (String(r[0] ?? "").toLowerCase().includes("goal statement")) {
          goalStatements.enrollment   = String(r[3] ?? "").trim();
          goalStatements.personal     = String(r[7] ?? "").trim();
          goalStatements.professional = String(r[11] ?? "").trim();
        }
        // Values row (row after goal statement)
        if (String(r[0] ?? "").toLowerCase().includes("value")) {
          valuesMap.enrollment   = String(r[3] ?? "").trim();
          valuesMap.personal     = String(r[7] ?? "").trim();
          valuesMap.professional = String(r[11] ?? "").trim();
        }
        // Declaration
        if (!declaration && String(r[11] ?? "").trim().length > 3 &&
            /^[A-Z][a-z]/.test(String(r[11] ?? "").trim()) &&
            !String(r[11]).toLowerCase().includes("name") &&
            !String(r[11]).toLowerCase().includes("declaration") &&
            !String(r[11]).toLowerCase().includes("goal")) {
          declaration = String(r[11]).trim();
        }
      }

      try {
        // Create user account (email already computed above)
        const studentId = createId();

        await db.insert(users).values({
          id: studentId,
          email,
          passwordHash: defaultPassword,
          name: sheetName.trim(),
          role: "student",
          batchId,
          approvalStatus: "approved",
          approvedBy: user.userId,
          createdAt: now,
          updatedAt: now,
        });

        // Create 3 goals
        let goalsCreated = 0;
        for (const goalType of GOAL_TYPES) {
          const stmt = goalStatements[goalType] || `${sheetName} ${goalType} goal`;
          await db.insert(goals).values({
            id: createId(),
            userId: studentId,
            goalType,
            goalStatement: stmt,
            valuesDeclaration: valuesMap[goalType] || "",
            startDate: "2026-02-02",
            endDate: "2026-04-26",
            status: "in_progress",
            approvalStatus: "approved",
            approvedBy: user.userId,
            createdAt: now,
            updatedAt: now,
          });
          goalsCreated++;
        }

        // Add to allUsers so subsequent sheets don't re-create
        allUsers.push({ id: studentId, name: sheetName.trim(), role: "student" });

        results.push({ studentName: sheetName, action: "created", userId: studentId, goalsCreated });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ studentName: sheetName, action: "error", error: msg });
      }
    }

    // Now run the full import to populate milestones
    const importResults = await importExcelBuffer(buffer);
    // Merge milestone counts into results
    for (const ir of importResults) {
      const match = results.find(
        (r) => r.studentName.trim().toLowerCase().split(/\s+/)[0] ===
               ir.studentName.trim().toLowerCase().split(/\s+/)[0]
      );
      if (match) {
        match.milestonesWritten = ir.milestonesWritten;
      }
    }

    const created  = results.filter((r) => r.action === "created").length;
    const skipped  = results.filter((r) => r.action === "skipped").length;
    const errored  = results.filter((r) => r.action === "error").length;
    const totalMilestones = results.reduce((s, r) => s + (r.milestonesWritten ?? 0), 0);

    return NextResponse.json({
      success: true,
      summary: { created, skipped, errored, totalMilestones },
      results,
    });
  } catch (error) {
    console.error("[seed-from-excel] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
