import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, councils, batches } from "@/lib/db/schema";

export async function GET() {
  try {
    const [userCount] = await db.select({ count: users.id }).from(users).limit(1);
    const [councilCount] = await db.select({ count: councils.id }).from(councils).limit(1);
    const [batchData] = await db.select().from(batches).limit(1);

    return NextResponse.json({
      success: true,
      userCount: userCount ? 1 : 0,  // placeholder
      councilCount: councilCount ? 1 : 0,  // placeholder
      batchName: batchData?.name,
      batchStartDate: batchData?.startDate,
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
    }, { status: 500 });
  }
}
