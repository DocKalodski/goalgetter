import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const db = new Database('./local.db');
try {
  db.exec('ALTER TABLE attendance ADD COLUMN last_edited_by TEXT');
  console.log('added last_edited_by');
} catch(e) { console.log('last_edited_by:', e.message); }
try {
  db.exec('ALTER TABLE attendance ADD COLUMN last_edited_role TEXT');
  console.log('added last_edited_role');
} catch(e) { console.log('last_edited_role:', e.message); }
db.close();
console.log('done');
