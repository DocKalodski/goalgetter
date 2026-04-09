import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({ url: "file:./local.db" });

const coachRow = await db.execute("SELECT password_hash FROM users WHERE email = 'beta_coach@leap99.test'");
const hash = coachRow.rows[0]?.password_hash;

const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: ["beta_facilitator@leap99.test"] });
if (existing.rows.length > 0) {
  console.log("Already exists: beta_facilitator@leap99.test");
} else {
  const id = crypto.randomBytes(12).toString("hex").slice(0, 24);
  const now = new Date();
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash, role, approval_status, council_id, can_view_all_councils, created_at, updated_at)
          VALUES (?, 'Beta Facilitator', ?, ?, 'facilitator', 'approved', NULL, 0, ?, ?)`,
    args: [id, "beta_facilitator@leap99.test", hash, now, now],
  });
  console.log("CREATED: beta_facilitator@leap99.test  password: coachleap99beta2");
}
db.close?.();
