import { NextResponse } from "next/server";
import { seedDemoAccounts } from "@/lib/db/seed-demo";

export async function POST() {
  // Allow in development only
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Demo seed endpoint is disabled in production" },
      { status: 403 }
    );
  }

  try {
    await seedDemoAccounts();
    return NextResponse.json({
      success: true,
      message: "Demo accounts seeded successfully",
    });
  } catch (error) {
    console.error("Demo seed error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed demo accounts",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
