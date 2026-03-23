// Beta user creation script — run with: node scripts/create-beta-users.mjs
import bcrypt from "bcrypt";
import Database from "better-sqlite3";
import { createId } from "@paralleldrive/cuid2";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../local.db");
const db = new Database(dbPath);

const PASSWORD = "LEAP99BETA";
const SALT_ROUNDS = 12;

// Names exactly as shown — email = lowercase(name)@leap99.com
const BETA_USERS = [
  "Louie", "Elaine", "Kalod", "Nini", "Iya", "Danji", "Royce", "Gek",
  "Angie", "Maj", "RJ", "Jervin", "Yollie", "Anthony", "JP", "Daisy",
  "Mickey", "Ding", "Cherry", "Nancy",
];

const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);
const now = Math.floor(Date.now() / 1000);

let created = 0;
let skipped = 0;

for (const name of BETA_USERS) {
  const email = `${name.toLowerCase()}@leap99.com`;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    // Update password hash
    db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE email = ?")
      .run(hash, now, email);
    console.log(`  ✓ Updated  ${email}`);
    skipped++;
    continue;
  }

  const id = createId();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, approval_status, can_view_all_councils, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'student', 'approved', 0, ?, ?)
  `).run(id, email, hash, name, now, now);
  console.log(`  + Created  ${email}`);
  created++;
}

db.close();
console.log(`\nDone. Created: ${created}, Updated: ${skipped}`);
