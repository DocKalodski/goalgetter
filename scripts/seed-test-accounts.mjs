import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:./local.db" });

// Simple password hash matching the app's bcrypt-style — check what the app uses
// The app uses verifyPassword from lib/auth/password — let's check the existing hash format
const existing = await db.execute("SELECT password_hash FROM users LIMIT 1");
console.log("Hash sample:", existing.rows[0]?.password_hash?.toString().slice(0, 10));

// Use the same hash as beta_coach (password: coachleap99beta2)
const coachRow = await db.execute("SELECT password_hash FROM users WHERE email = 'beta_coach@leap99.test'");
const coachHash = coachRow.rows[0]?.password_hash;

const studentRow = await db.execute("SELECT password_hash FROM users WHERE email = 'beta_student@leap99.test'");
const studentHash = studentRow.rows[0]?.password_hash;

console.log("Coach hash found:", !!coachHash);
console.log("Student hash found:", !!studentHash);

// Get council IDs
const councils = await db.execute("SELECT id, name FROM councils LIMIT 5");
console.log("Councils:", councils.rows.map(r => `${r.id}: ${r.name}`));

// Get first council
const councilId = councils.rows[0]?.id ?? null;

function cuid() {
  return crypto.randomBytes(12).toString('hex').slice(0, 24);
}

const now = Math.floor(Date.now() / 1000);

const accounts = [
  // Coaches
  { id: cuid(), name: "Coach Kinder",          email: "coach.kinder@leap99.test",     role: "coach",   hash: coachHash,   councilId: null },
  { id: cuid(), name: "Coach MARY-G",           email: "coach.maryg@leap99.test",      role: "coach",   hash: coachHash,   councilId: null },
  { id: cuid(), name: "Coach The Magnificants", email: "coach.magnificants@leap99.test", role: "coach", hash: coachHash,   councilId: null },
  // Students
  { id: cuid(), name: "Student Kinder",          email: "student.kinder@leap99.test",     role: "student", hash: studentHash, councilId },
  { id: cuid(), name: "Student MARY-G",           email: "student.maryg@leap99.test",      role: "student", hash: studentHash, councilId },
  { id: cuid(), name: "Student The Magnificents", email: "student.magnificents@leap99.test", role: "student", hash: studentHash, councilId },
];

for (const a of accounts) {
  // Check if exists
  const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [a.email] });
  if (existing.rows.length > 0) {
    console.log(`SKIP (exists): ${a.email}`);
    continue;
  }
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash, role, approval_status, council_id, can_view_all_councils, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'approved', ?, 0, ?, ?)`,
    args: [a.id, a.name, a.email, a.hash, a.role, a.councilId, new Date(), new Date()],
  });
  console.log(`CREATED: ${a.role} — ${a.name} (${a.email})`);
}

console.log("\nPasswords:");
console.log("  Coaches  → coachleap99beta2");
console.log("  Students → studentleap99beta2");
console.log("\nDone.");
db.close?.();
