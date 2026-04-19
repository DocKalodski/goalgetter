import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

// APA origin for CORS
const APA_ORIGIN = process.env.APA_ORIGIN || "http://localhost:3002";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": APA_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(_request: NextRequest) {
  const user = await getAuthUser();
  if (!user || (user.role !== "head_coach" && user.role !== "coach" && user.role !== "developer" && user.role !== "facilitator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers: corsHeaders() });
  }

  try {
    const students = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        councilId: schema.users.councilId,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(inArray(schema.users.role, ["student", "council_leader"]));

    return NextResponse.json(
      students.map(s => ({
        id: s.id,
        name: s.name || s.email || "Unknown",
        email: s.email,
        role: s.role,
        council_id: s.councilId,
        created_at: s.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      { headers: corsHeaders() }
    );
  } catch (err) {
    console.error("[v1/students] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}
