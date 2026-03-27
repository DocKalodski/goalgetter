import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";
import { canAccessStudent } from "@/lib/auth/access";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/journey/council-members?studentId=xxx
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ members: [] });

  // Verify requester can access this student before revealing council members
  if (!(await canAccessStudent(user, studentId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [student] = await db
    .select({ councilId: users.councilId })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (!student?.councilId) return NextResponse.json({ members: [] });

  const members = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(
      and(
        eq(users.councilId, student.councilId),
        inArray(users.role, ["student", "council_leader"])
      )
    );

  const formatted = members.map((m) => ({
    id: m.id,
    name: m.name || "Member",
    role: m.role,
  }));

  return NextResponse.json({ members: formatted });
}
