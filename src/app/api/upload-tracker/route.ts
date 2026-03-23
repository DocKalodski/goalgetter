import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { dataUploads, dataUploadChanges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { parseExcelTracker, parseJsonTracker, validateParsedData } from "@/lib/excel/parser";
import { computeChanges } from "@/lib/excel/diff-engine";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".json"];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getAuthUser();
    if (!user || !isHeadCoach(user)) {
      return NextResponse.json(
        { error: "Unauthorized. Only head coaches can upload tracker data." },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate extension
    const filename = file.name;
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type. Accepted: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Save file to storage/uploads/
    const uploadDir = join(process.cwd(), "storage", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const safeFilename = `${createId()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = join(uploadDir, safeFilename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Create upload record
    const uploadId = createId();
    const now = new Date();

    await db.insert(dataUploads).values({
      id: uploadId,
      uploadedBy: user.userId,
      filename,
      fileSize: file.size,
      status: "processing",
      totalChanges: 0,
      appliedChanges: 0,
      rejectedChanges: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Parse file
    let parsed;
    try {
      parsed = (ext === ".xlsx" || ext === ".xls")
        ? await parseExcelTracker(filePath)
        : await parseJsonTracker(filePath);
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : String(parseError);
      await db
        .update(dataUploads)
        .set({ status: "error", errorMessage: `Parse error: ${msg}`, updatedAt: new Date() })
        .where(eq(dataUploads.id, uploadId));

      return NextResponse.json(
        { success: false, uploadId, error: `Failed to parse file: ${msg}` },
        { status: 422 }
      );
    }

    // Validate parsed data
    const validation = validateParsedData(parsed);
    if (!validation.valid) {
      await db
        .update(dataUploads)
        .set({
          status: "error",
          errorMessage: `Validation: ${validation.errors.join("; ")}`,
          updatedAt: new Date(),
        })
        .where(eq(dataUploads.id, uploadId));

      return NextResponse.json(
        { success: false, uploadId, error: "Validation failed", details: validation.errors },
        { status: 422 }
      );
    }

    // Compute diff against current DB
    const { changes, summary } = await computeChanges(parsed);

    // Insert all changes into dataUploadChanges
    if (changes.length > 0) {
      const changeRows = changes.map((c) => ({
        id: createId(),
        uploadId,
        studentName: c.studentName,
        studentId: c.studentId,
        weekNumber: c.weekNumber,
        goalType: c.goalType as "enrollment" | "personal" | "professional" | undefined,
        entityType: c.entityType,
        entityId: c.entityId,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
        changeType: c.changeType,
        status: "pending" as const,
        createdAt: now,
      }));

      // Insert in batches of 50 to avoid SQLite variable limits
      for (let i = 0; i < changeRows.length; i += 50) {
        await db.insert(dataUploadChanges).values(changeRows.slice(i, i + 50));
      }
    }

    // Update upload status
    await db
      .update(dataUploads)
      .set({
        status: changes.length > 0 ? "pending_review" : "applied",
        totalChanges: summary.totalChanges,
        summary: JSON.stringify(summary),
        updatedAt: new Date(),
      })
      .where(eq(dataUploads.id, uploadId));

    return NextResponse.json({
      success: true,
      uploadId,
      summary: {
        totalChanges: summary.totalChanges,
        byType: summary.byType,
        byEntity: summary.byEntity,
        studentsAffected: summary.studentsAffected.length,
        weeksAffected: summary.weeksAffected,
        unmatchedStudents: summary.unmatchedStudents,
      },
      warnings: parsed.warnings,
    });
  } catch (error) {
    console.error("Upload tracker error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
