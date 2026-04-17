import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, batches, councils, goals } from "@/lib/db/schema";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    // Count by type
    const allUsers = await db.select().from(users);
    const demoUsers = allUsers.filter(u => u.email?.includes("leap99.test"));
    const demoStudents = demoUsers.filter(u => u.role === "student");
    const demoCoaches = demoUsers.filter(u => u.role === "coach");

    const allGoals = await db.select().from(goals);
    const demoGoals = allGoals.filter(g => g.userId?.startsWith("demo_"));

    const allBatches = await db.select().from(batches);
    const demoBatch = allBatches.find(b => b.name === "LEAP 99 Demo");

    const allCouncils = await db.select().from(councils);
    const demoCouncils = allCouncils.filter(c => c.id?.startsWith("council_"));

    return NextResponse.json({
      summary: {
        totalUsers: allUsers.length,
        demoUsers: demoUsers.length,
        demoStudents: demoStudents.length,
        demoCoaches: demoCoaches.length,
        demoGoals: demoGoals.length,
        demoBatches: allBatches.length,
        demoCouncils: demoCouncils.length,
      },
      students: demoStudents.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        batchId: u.batchId,
        councilId: u.councilId,
      })),
      coaches: demoCoaches.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        batchId: u.batchId,
        councilId: u.councilId,
      })),
      batch: demoBatch
        ? { id: demoBatch.id, name: demoBatch.name }
        : null,
      councils: demoCouncils.map(c => ({
        id: c.id,
        name: c.name,
      })),
      studentGoalCounts: demoStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        goalCount: demoGoals.filter(g => g.userId === s.id).length,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get database status",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
