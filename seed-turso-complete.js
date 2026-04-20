const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

function createId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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

async function seedTurso() {
  const client = createClient({
    url: 'libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY1OTM3MjMsImlkIjoiMDE5ZGE0OTktNmQwMS03MzA5LWE5YjEtNmFhZmViZDkzOGQ1IiwicmlkIjoiMjc4MGRkYWUtZTk3OC00NDc2LWE0NGMtNjJkNjY4NmJlYzFmIn0.NXTKdU7Srtil2_PUZWDzD7KsyH0MEk7kqW6FLxDKFrLuncPLgCGbsQhw3J0x12RfnHLpwrz3QsCaWjFmMPPCCg',
  });

  try {
    const now = Math.floor(Date.now() / 1000);

    // Clear tables in dependency order
    await client.execute('DELETE FROM buddies');
    await client.execute('DELETE FROM attendance');
    await client.execute('DELETE FROM action_plans');
    await client.execute('DELETE FROM weekly_milestones');
    await client.execute('DELETE FROM goals');
    await client.execute('DELETE FROM councils');
    await client.execute('DELETE FROM users');
    await client.execute('DELETE FROM batches');
    console.log('✓ Cleared all tables');

    // 1. Create batch
    const batchId = createId();
    await client.execute(
      `INSERT INTO batches (id, name, start_date, end_date, current_week, total_weeks, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [batchId, 'LEAP 99', '2026-04-27', '2026-06-21', 1, 8, now, now]
    );

    // 2. Create HC and Admin
    const hcPwd = await hashPassword('louie-5899');
    const hcId = createId();
    await client.execute(
      `INSERT INTO users (id, email, name, password_hash, role, batch_id, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hcId, 'louie@leap99.com', 'Louie Sibayan', hcPwd, 'head_coach', batchId, 'approved', now, now]
    );

    const adminPwd = await hashPassword('kalod-99');
    const adminId = createId();
    await client.execute(
      `INSERT INTO users (id, email, name, password_hash, role, approval_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'kalod@leap99.com', 'Kalod Sta Clara', adminPwd, 'admin', 'approved', now, now]
    );

    // 3. Create facilitators
    for (const faciName of ['Benjie Leogardo', 'Chona Santos', 'Ceville Rebollo', 'Faith de Chavez', 'Jaja Reynoso Alcantara', 'James Franco', 'Jen Gan', 'Kurt Silvano', 'Mic Pineda', 'Mimi Manalo']) {
      const firstName = faciName.split(' ')[0].toLowerCase();
      const pwd = await hashPassword(firstName + '-5899');
      const faciId = createId();
      await client.execute(
        `INSERT INTO users (id, email, name, password_hash, role, batch_id, approval_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [faciId, `${firstName}@leap99.com`, faciName, pwd, 'facilitator', batchId, 'approved', now, now]
      );
    }

    // 4. Create coaches, students, councils, attendance, buddies
    for (const coach of COACHES) {
      const coachPwd = await hashPassword(coach.firstName.toLowerCase() + '-5899');
      const coachId = createId();
      const councilId = createId();

      // Insert coach
      await client.execute(
        `INSERT INTO users (id, email, name, password_hash, role, batch_id, council_id, approval_status, approved_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [coachId, `${coach.firstName.toLowerCase()}@leap99.com`, coach.fullName, coachPwd, 'coach', batchId, councilId, 'approved', hcId, now, now]
      );

      // Insert council
      await client.execute(
        `INSERT INTO councils (id, name, coach_id, batch_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [councilId, `${coach.fullName} Council`, coachId, batchId, now, now]
      );

      const studentIds = [];

      // Insert 6 students + attendance
      for (let i = 1; i <= 6; i++) {
        const studentEmail = `${coach.firstName.toLowerCase()}student${i}@leap99.com`;
        const studentPwd = await hashPassword(`${coach.firstName.toLowerCase()}student${i}-99`);
        const studentId = createId();
        studentIds.push(studentId);
        const studentName = `${coach.fullName} Student ${i}`;

        await client.execute(
          `INSERT INTO users (id, email, name, password_hash, role, batch_id, council_id, approval_status, approved_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, studentEmail, studentName, studentPwd, 'student', batchId, councilId, 'approved', hcId, now, now]
        );

        // Insert 8 attendance rows (weeks 1-8)
        for (let week = 1; week <= 8; week++) {
          const eventAttendance = {};
          const events = WEEK_EVENTS[week] || [];
          for (const event of events) {
            eventAttendance[event] = 'no_data';
          }

          const attendanceId = createId();
          await client.execute(
            `INSERT INTO attendance (id, user_id, week_number, meeting_status, call_mon, call_tue, call_wed, call_thu, call_fri, event_attendance, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              attendanceId,
              studentId,
              week,
              'no_data',
              'no_data',
              'no_data',
              'no_data',
              'no_data',
              'no_data',
              JSON.stringify(eventAttendance),
              now,
              now,
            ]
          );
        }
      }

      // Insert 3 buddy pairs
      const pairs = [[0, 1], [2, 3], [4, 5]];
      for (const [idx1, idx2] of pairs) {
        const buddyId = createId();
        await client.execute(
          `INSERT INTO buddies (id, student_id, buddy_id, council_id)
           VALUES (?, ?, ?, ?)`,
          [buddyId, studentIds[idx1], studentIds[idx2], councilId]
        );
      }
    }

    console.log('✓ Seeded complete structure:');
    console.log('  - 1 batch (LEAP 99)');
    console.log('  - 1 HC + 1 admin + 10 facilitators');
    console.log('  - 17 coaches with 17 councils');
    console.log('  - 102 students (6 per coach)');
    console.log('  - 816 attendance records (8 per student)');
    console.log('  - 51 buddy pairs');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedTurso();
