import { createClient } from "@libsql/client";

const client = createClient({ url: "file:./local.db" });

for (const col of ["last_edited_by", "last_edited_role"]) {
  try {
    await client.execute(`ALTER TABLE attendance ADD COLUMN ${col} TEXT`);
    console.log(`added ${col}`);
  } catch (e) {
    console.log(`${col}: ${e.message}`);
  }
}
client.close?.();
console.log("done");
