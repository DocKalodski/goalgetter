const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

// Turso connection
const client = createClient({
  url: "libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io",
  authToken: process.env.DATABASE_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY1OTM3MjMsImlkIjoiMDE5ZGE0OTktNmQwMS03MzA5LWE5YjEtNmFhZmViZDkzOGQ1IiwicmlkIjoiMjc4MGRkYWFlLWU5NzgtNDQ3Ni1hNDRjLTYyZDY2ODZiZWMxZiJ9.NXTKdU7Srtil2_PUZWDzD7KsyH0MEk7kqW6FLxDKFrLuncPLgCGbsQhw3J0x12RfnHLpwrz3QsCaWjFmMPPCCg",
});

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

const SHARED_FACILITATOR = {
  email: "faci@leap99.com",
  password: "faci-99",
  name: "Facilitator (Shared)",
};

// Event keys per week
const WEEK_EVENTS = {
  1: [],
  2: ["FLEX 298"],
  3: ["FLEX 299", "1st Workshop"],
  4: ["2nd Intensive"],
  5: [],
  6: ["ALC 256"],
  7: ["ALC 257", "2nd Workshop"],
  8: ["3rd Intensive"],
};

function generateId() {
  return Math.random().toString(36).substr(2, 24);
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function seedTurso() {
  console.log("🌐 Seeding Turso cloud database with 122 users...");
  const now = new Date().toISOString();

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await client.execute("DELETE FROM buddies");
    await client.execute("DELETE FROM attendance");
    await client.execute("DELETE FROM councils");
    await client.execute("DELETE FROM users");
    await client.execute("DELETE FROM batches");
    console.log("✓ Cleared existing data");

    // 1. Create batch
    const batchId = generateId();
    await client.execute({
      sql: `INSERT INTO batches (id, name, startDate, endDate, currentWeek, totalWeeks, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [batchId, "LEAP 99", "2026-04-27", "2026-06-21", 1, 8, now, now],
    });
    console.log("✓ Created LEAP 99 batch");

    // 2. Create Head Coach
    const hcId = generateId();
    const hcPwd = await hashPassword("louie-99");
    await client.execute({
      sql: `INSERT INTO users (id, email, passwordHash, name, role, batchId, approvalStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [hcId, "louie@leap99.com", hcPwd, "Louie Sibayan", "head_coach", batchId, "approved", now, now],
    });
    console.log("✓ Created Head Coach");

    // 3. Create Admin
    const adminId = generateId();
    const adminPwd = await hashPassword("kalod-99");
    await client.execute({
      sql: `INSERT INTO users (id, email, passwordHash, name, role, batchId, approvalStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [adminId, "kalod@leap99.com", adminPwd, "Kalod Sta Clara", "admin", batchId, "approved", now, now],
    });
    console.log("✓ Created Admin");

    // 4. Create 1 Shared Facilitator
    const faciPwd = await hashPassword(SHARED_FACILITATOR.password);
    await client.execute({
      sql: `INSERT INTO users (id, email, passwordHash, name, role, batchId, approvalStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [generateId(), SHARED_FACILITATOR.email, faciPwd, SHARED_FACILITATOR.name, "facilitator", batchId, "approved", now, now],
    });
    console.log("✓ Created 1 Shared Facilitator");

    // 5. Create coaches, councils, students, attendance, buddies
    let totalStudents = 0;
    for (const coach of COACHES) {
      const coachId = generateId();
      const coachEmail = `${coach.firstName.toLowerCase()}@leap99.com`;
      const coachPwd = await hashPassword(`${coach.firstName.toLowerCase()}-99`);

      await client.execute({
        sql: `INSERT INTO users (id, email, passwordHash, name, role, batchId, approvalStatus, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [coachId, coachEmail, coachPwd, coach.fullName, "coach", batchId, "approved", now, now],
      });

      const councilId = generateId();
      await client.execute({
        sql: `INSERT INTO councils (id, name, coachId, batchId, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [councilId, `${coach.firstName} Council`, coachId, batchId, now, now],
      });

      const studentIds = [];
      for (let i = 1; i <= 6; i++) {
        const studentId = generateId();
        const studentEmail = `${coach.firstName.toLowerCase()}student${i}@leap99.com`;
        const studentPwd = await hashPassword(`${coach.firstName.toLowerCase()}student${i}-99`);

        await client.execute({
          sql: `INSERT INTO users (id, email, passwordHash, name, role, councilId, batchId, approvalStatus, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            studentId,
            studentEmail,
            studentPwd,
            `${coach.firstName} Student ${i}`,
            "student",
            councilId,
            batchId,
            "approved",
            now,
            now,
          ],
        });
        studentIds.push(studentId);
        totalStudents++;
      }

      // Create attendance
      for (const studentId of studentIds) {
        for (let week = 1; week <= 8; week++) {
          const eventKeys = WEEK_EVENTS[week] || [];
          const eventAttendance = {};
          for (const eventKey of eventKeys) {
            eventAttendance[eventKey] = "no_data";
          }

          await client.execute({
            sql: `INSERT INTO attendance (id, userId, weekNumber, meetingStatus, callMon, callTue, callWed, callThu, callFri, eventAttendance, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              generateId(),
              studentId,
              week,
              "no_data",
              "no_data",
              "no_data",
              "no_data",
              "no_data",
              "no_data",
              JSON.stringify(eventAttendance),
              now,
              now,
            ],
          });
        }
      }

      // Create buddy pairs
      const buddyPairs = [
        [studentIds[0], studentIds[1]],
        [studentIds[2], studentIds[3]],
        [studentIds[4], studentIds[5]],
      ];

      for (const [studentAId, studentBId] of buddyPairs) {
        await client.execute({
          sql: `INSERT INTO buddies (id, studentId, buddyId, councilId)
                VALUES (?, ?, ?, ?)`,
          args: [generateId(), studentAId, studentBId, councilId],
        });
        await client.execute({
          sql: `INSERT INTO buddies (id, studentId, buddyId, councilId)
                VALUES (?, ?, ?, ?)`,
          args: [generateId(), studentBId, studentAId, councilId],
        });
      }
    }

    console.log(`✓ Created 17 coaches with councils`);
    console.log(`✓ Created ${totalStudents} students (6 per coach)`);
    console.log(`✓ Created ${totalStudents * 8} attendance records (8 per student)`);
    console.log(`✓ Created 51 buddy pairs (3 per council)`);
    console.log(`\n✅ Turso seed complete: 1 HC + 1 Admin + 1 Shared Faci + 17 Coaches + 102 Students = 122 users total`);
    console.log(`📊 Total: ${1 + 1 + 1 + 17 + totalStudents} users seeded`);
    console.log(`🌐 Ready for Cloudflare Tunnel + Vercel + Render`);

    await client.close();
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
}

seedTurso();
