const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

function createId() {
  // Simple CUID-like ID generator
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

const FACIS = [
  "Benjie Leogardo",
  "Chona Santos",
  "Ceville Rebollo",
  "Faith de Chavez",
  "Jaja Reynoso Alcantara",
  "James Franco",
  "Jen Gan",
  "Kurt Silvano",
  "Mic Pineda",
  "Mimi Manalo",
];

async function seedTurso() {
  const client = createClient({
    url: 'libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY1OTM3MjMsImlkIjoiMDE5ZGE0OTktNmQwMS03MzA5LWE5YjEtNmFhZmViZDkzOGQ1IiwicmlkIjoiMjc4MGRkYWUtZTk3OC00NDc2LWE0NGMtNjJkNjY4NmJlYzFmIn0.NXTKdU7Srtil2_PUZWDzD7KsyH0MEk7kqW6FLxDKFrLuncPLgCGbsQhw3J0x12RfnHLpwrz3QsCaWjFmMPPCCg',
  });

  try {
    // Clear existing users first
    await client.execute('DELETE FROM users');
    console.log('✓ Cleared existing users');

    const now = Math.floor(Date.now() / 1000);
    let count = 0;

    // 1. Head Coach
    const hcPwd = await hashPassword('louie-99');
    const hcId = createId();
    await client.execute(
      `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hcId, 'louie@leap99.com', 'Louie Sibayan', hcPwd, 'head_coach', now, now]
    );
    count++;

    // 2. Admin
    const adminPwd = await hashPassword('kalod-99');
    const adminId = createId();
    await client.execute(
      `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'kalod@leap99.com', 'Kalod Sta Clara', adminPwd, 'admin', now, now]
    );
    count++;

    // 3. Facilitators (10)
    for (const faciName of FACIS) {
      const firstName = faciName.split(' ')[0].toLowerCase();
      const pwd = await hashPassword(firstName + '-99');
      const faciId = createId();
      await client.execute(
        `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [faciId, `${firstName}@leap99.com`, faciName, pwd, 'facilitator', now, now]
      );
      count++;
    }

    // 4. Coaches (17) + Students (6 per coach = 102)
    for (const coach of COACHES) {
      // Insert coach
      const coachPwd = await hashPassword(coach.firstName.toLowerCase() + '-99');
      const coachId = createId();
      await client.execute(
        `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [coachId, `${coach.firstName.toLowerCase()}@leap99.com`, coach.fullName, coachPwd, 'coach', now, now]
      );
      count++;

      // Insert 6 students for this coach
      for (let i = 1; i <= 6; i++) {
        const studentEmail = `${coach.firstName.toLowerCase()}student${i}@leap99.com`;
        const studentPwd = await hashPassword(`${coach.firstName.toLowerCase()}student${i}-99`);
        const studentId = createId();
        const studentName = `${coach.fullName} Student ${i}`;
        await client.execute(
          `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [studentId, studentEmail, studentName, studentPwd, 'student', now, now]
        );
        count++;
      }
    }

    console.log(`✓ Seeded ${count} users to Turso (1 HC + 1 admin + 10 facis + 17 coaches + 102 students)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedTurso();
