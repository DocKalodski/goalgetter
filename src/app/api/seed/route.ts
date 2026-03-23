import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db/seed";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";

async function ensureSchema() {
  try {
    await db.run(sql`SELECT 1 FROM batches LIMIT 1`);
  } catch {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Schema must be pushed before deployment");
    }
    // Dev only: auto-push schema via CLI
    const { execSync } = require("child_process");
    execSync("npx drizzle-kit push", { stdio: "pipe", cwd: process.cwd() });
  }
}

export async function POST() {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seed endpoint is disabled in production" },
      { status: 403 }
    );
  }

  // Require head_coach auth (seed is no longer in publicPaths)
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    return NextResponse.json(
      { error: "Forbidden: head_coach role required" },
      { status: 403 }
    );
  }

  try {
    await ensureSchema();
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
