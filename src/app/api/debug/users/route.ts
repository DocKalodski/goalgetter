import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const count = await db.select().from(users);
    const louie = await db
      .select()
      .from(users)
      .where(eq(users.email, "louie@leap99.com"));

    return NextResponse.json({
      totalUsers: count.length,
      louieFound: louie.length > 0,
      louie: louie[0]
        ? {
            id: louie[0].id,
            email: louie[0].email,
            name: louie[0].name,
            role: louie[0].role,
            passwordHashLength: louie[0].passwordHash?.length,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
