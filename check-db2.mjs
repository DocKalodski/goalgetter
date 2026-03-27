import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./local.db' });

const councils = await client.execute('SELECT id, name, coachId FROM councils');
const students = await client.execute('SELECT role, councilId, COUNT(*) as cnt FROM users WHERE role IN ("student","council_leader") GROUP BY role, councilId');
const hc = await client.execute('SELECT id, email, role, permissions FROM users WHERE role="head_coach"');

console.log('Councils:', JSON.stringify(councils.rows, null, 2));
console.log('Student/leader councilId distribution:', JSON.stringify(students.rows, null, 2));
console.log('Head coach:', JSON.stringify(hc.rows, null, 2));

// Check if middleware table or sessions table exist
const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
console.log('Tables:', tables.rows.map(r => r.name));

await client.close();
