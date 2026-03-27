import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:./local.db' });

// Test getCoachContext (head_coach path)
console.log('=== Testing getCoachContext (head_coach) ===');
const councils = await client.execute('SELECT id, name, coach_id FROM councils');
console.log('Councils:', JSON.stringify(councils.rows));

const councilIds = councils.rows.map(c => c.id);
console.log('Council IDs:', councilIds);

// Test student query with inArray equivalent
const placeholders = councilIds.map((_, i) => `?${i+1}`).join(', ');
const students = await client.execute({
  sql: `SELECT id, name, role, council_id FROM users WHERE role IN ('student','council_leader') AND council_id IN (${councilIds.map(() => '?').join(',')})`,
  args: councilIds
});
console.log('Students found:', students.rows.length);
students.rows.forEach(s => console.log(' ', s.role, s.name, s.council_id));

// Test batch query
const batch = await client.execute('SELECT id, name, start_date, total_weeks, weekly_targets FROM batches LIMIT 1');
console.log('\n=== Batch ===');
console.log(JSON.stringify(batch.rows[0]));

// Test weekly_targets JSON parse
try {
  const wt = JSON.parse(batch.rows[0].weekly_targets);
  console.log('weeklyTargets parsed OK:', Object.keys(wt).length, 'entries');
} catch(e) {
  console.log('weeklyTargets PARSE ERROR:', e.message);
}

// Test head_coach user
const hc = await client.execute("SELECT id, email, role, can_view_all_councils, permissions FROM users WHERE role='head_coach'");
console.log('\n=== Head Coach ===');
console.log(JSON.stringify(hc.rows[0]));

await client.close();
console.log('\nAll queries OK');
