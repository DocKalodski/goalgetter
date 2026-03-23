import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { importExcelBuffer } from "@/lib/excel-import";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || (user.role !== "head_coach" && user.role !== "coach")) {
      return NextResponse.json(
        { error: "Unauthorized. Coaches only." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".xlsx" && ext !== ".xls") {
      return NextResponse.json(
        { error: "Only .xlsx or .xls files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 15MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const results = await importExcelBuffer(buffer);

    const matched   = results.filter((r) => r.matched).length;
    const unmatched = results.filter((r) => !r.matched).length;
    const totalMilestones = results.reduce((s, r) => s + r.milestonesWritten, 0);
    const totalGoals      = results.reduce((s, r) => s + r.goalsUpdated, 0);

    return NextResponse.json({
      success: true,
      summary: { matched, unmatched, totalMilestones, totalGoals },
      results,
    });
  } catch (error) {
    console.error("[import/excel] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
