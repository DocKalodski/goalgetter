import { db } from "./index";
import {
  batches,
  users,
  councils,
  buddies,
  attendance,
} from "./schema";
import { hashPassword } from "../auth/password";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

const COACHES = [
  { firstName: "Iya", fullName: "Iya Buzeta-Acero" },
  { firstName: "Nini", fullName: "Nini Anggala" },
  { firstName: "Elaine", fullName: "Elaine Iwa" },
  { firstName: "Royce", fullName: "Royce Hernandez" },
  { firstName: "Danji", fullName: "Danji Ferrolino" },
  { firstName: "Maj", fullName: "Maj Maraat" },
  { firstName: "RJ", fullName: "RJ Geotina III" },
  { firstName: "Angie", fullName: "Angie Siapno" },
  { firstName: "Mikey", fullName: "Mikey Jamias" },
  { firstName: "Yollie", fullName: "Yollie Viola" },
  { firstName: "Jervin", fullName: "Jervin Tuason" },
  { firstName: "JP", fullName: "JP Jacinto" },
  { firstName: "Anthony", fullName: "Anthony Bacolod" },
  { firstName: "Daisy", fullName: "Daisy Ilarde" },
  { firstName: "Ding", fullName: "Ding Revilla" },
  { firstName: "Nancy", fullName: "Nancy Sia" },
  { firstName: "Cherry", fullName: "Cherry Enriquez" },
];

// Shared facilitator account for all 10 facilitators
const SHARED_FACILITATOR = {
  email: "faci@leap99.com",
  password: "faci-99",
  name: "Facilitator (Shared)"
};

// Event keys per week for attendance
const WEEK_EVENTS: Record<number, string[]> = {
  1: [],
  2: ["FLEX 298"],
  3: ["FLEX 299", "1st Workshop"],
  4: ["2nd Intensive"],
  5: [],
  6: ["ALC 256"],
  7: ["ALC 257", "2nd Workshop"],
  8: ["3rd Intensive"],
};

export async function seedDatabase() {
  console.log("Seeding LEAP 99 database with 131 users...");
  const now = new Date();

  // Clear existing data (for reseed)
  try {
    await db.delete(buddies);
    await db.delete(attendance);
    await db.delete(councils);
    await db.delete(users);
    await db.delete(batches);
    console.log("✓ Cleared existing data");
  } catch (error) {
    console.warn("Could not clear all tables (may be empty):", String(error));
  }

  // 1. Create batch (LEAP 99: Apr 27 - Jun 21, 2026)
  const batchId = createId();
  await db.insert(batches).values({
    id: batchId,
    name: "LEAP 99",
    startDate: "2026-04-27",
    endDate: "2026-06-21",
    currentWeek: 1,
    totalWeeks: 8,
    createdAt: now,
    updatedAt: now,
  });
  console.log("✓ Created LEAP 99 batch");

  // 2. Create Head Coach (Louie Sibayan)
  const hcPwd = await hashPassword("louie-99");
  const hcId = createId();
  await db.insert(users).values({
    id: hcId,
    email: "louie@leap99.com",
    passwordHash: hcPwd,
    name: "Louie Sibayan",
    role: "head_coach",
    batchId,
    approvalStatus: "approved",
    createdAt: now,
    updatedAt: now,
  });
  console.log("✓ Created Head Coach: Louie Sibayan");

  // 3. Create Admin (Kalod Sta Clara)
  const adminPwd = await hashPassword("kalod-99");
  const adminId = createId();
  await db.insert(users).values({
    id: adminId,
    email: "kalod@leap99.com",
    passwordHash: adminPwd,
    name: "Kalod Sta Clara",
    role: "admin",
    batchId,
    approvalStatus: "approved",
    createdAt: now,
    updatedAt: now,
  });
  console.log("✓ Created Admin: Kalod Sta Clara");

  // 4. Create 1 Shared Facilitator
  const faciPwd = await hashPassword(SHARED_FACILITATOR.password);
  await db.insert(users).values({
    id: createId(),
    email: SHARED_FACILITATOR.email,
    passwordHash: faciPwd,
    name: SHARED_FACILITATOR.name,
    role: "facilitator",
    batchId,
    approvalStatus: "approved",
    createdAt: now,
    updatedAt: now,
  });
  console.log("✓ Created 1 Shared Facilitator");

  // 5. For each coach: create coach + council + 6 students + attendance + buddies
  let totalStudents = 0;
  for (const coach of COACHES) {
    const coachId = createId();
    const coachEmail = `${coach.firstName.toLowerCase()}@leap99.com`;
    const coachPwd = await hashPassword(`${coach.firstName.toLowerCase()}-99`);

    // Create coach user
    await db.insert(users).values({
      id: coachId,
      email: coachEmail,
      passwordHash: coachPwd,
      name: coach.fullName,
      role: "coach",
      batchId,
      approvalStatus: "approved",
      createdAt: now,
      updatedAt: now,
    });

    // Create council
    const councilId = createId();
    await db.insert(councils).values({
      id: councilId,
      name: `${coach.firstName} Council`,
      coachId,
      batchId,
      createdAt: now,
      updatedAt: now,
    });

    // Create 6 students
    const studentIds: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const studentId = createId();
      const studentEmail = `${coach.firstName.toLowerCase()}student${i}@leap99.com`;
      const studentPwd = await hashPassword(`${coach.firstName.toLowerCase()}student${i}-99`);

      await db.insert(users).values({
        id: studentId,
        email: studentEmail,
        passwordHash: studentPwd,
        name: `${coach.firstName} Student ${i}`,
        role: "student",
        councilId,
        batchId,
        approvalStatus: "approved",
        createdAt: now,
        updatedAt: now,
      });
      studentIds.push(studentId);
      totalStudents++;
    }

    // Create 8 attendance rows per student (weeks 1-8)
    for (const studentId of studentIds) {
      for (let week = 1; week <= 8; week++) {
        const eventKeys = WEEK_EVENTS[week] || [];
        const eventAttendance: Record<string, string> = {};
        for (const eventKey of eventKeys) {
          eventAttendance[eventKey] = "no_data";
        }

        await db.insert(attendance).values({
          id: createId(),
          userId: studentId,
          weekNumber: week,
          meetingStatus: "no_data",
          callMon: "no_data",
          callTue: "no_data",
          callWed: "no_data",
          callThu: "no_data",
          callFri: "no_data",
          eventAttendance: JSON.stringify(eventAttendance),
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Create 3 buddy pairs (S1↔S2, S3↔S4, S5↔S6)
    const buddyPairs = [
      [studentIds[0], studentIds[1]],
      [studentIds[2], studentIds[3]],
      [studentIds[4], studentIds[5]],
    ];

    for (const [studentAId, studentBId] of buddyPairs) {
      // A → B
      await db.insert(buddies).values({
        id: createId(),
        studentId: studentAId,
        buddyId: studentBId,
        councilId,
      });
      // B → A (reciprocal)
      await db.insert(buddies).values({
        id: createId(),
        studentId: studentBId,
        buddyId: studentAId,
        councilId,
      });
    }
  }

  console.log(`✓ Created 17 coaches with councils`);
  console.log(`✓ Created ${totalStudents} students (6 per coach)`);
  console.log(`✓ Created ${totalStudents * 8} attendance records (8 per student)`);
  console.log(`✓ Created 51 buddy pairs (3 per council)`);
  console.log(
    `\n✅ Seed complete: 1 HC (Louie) + 1 Admin (Kalod) + 1 Shared Faci + 17 Coaches + 102 Students = 122 users total`
  );
  console.log(`📊 Total: ${1 + 1 + 1 + 17 + totalStudents} users seeded`);
  console.log(`🏛️  Ready for LEAP 99 on port 3025`);
}
