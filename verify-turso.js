const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function verifyTurso() {
  const client = createClient({
    url: 'libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY1OTM3MjMsImlkIjoiMDE5ZGE0OTktNmQwMS03MzA5LWE5YjEtNmFhZmViZDkzOGQ1IiwicmlkIjoiMjc4MGRkYWUtZTk3OC00NDc2LWE0NGMtNjJkNjY4NmJlYzFmIn0.NXTKdU7Srtil2_PUZWDzD7KsyH0MEk7kqW6FLxDKFrLuncPLgCGbsQhw3J0x12RfnHLpwrz3QsCaWjFmMPPCCg',
  });

  try {
    // Count all users
    const countResult = await client.execute('SELECT COUNT(*) as count FROM users');
    const count = countResult.rows[0]?.count || 0;
    console.log(`\nTotal users in Turso: ${count}`);

    // Get louie user
    const louieResult = await client.execute(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = ?',
      ['louie@leap99.com']
    );

    if (louieResult.rows.length === 0) {
      console.log('❌ Louie not found in database');
      process.exit(1);
    }

    const louie = louieResult.rows[0];
    console.log('\n✓ Louie found:');
    console.log(`  - Email: ${louie.email}`);
    console.log(`  - Name: ${louie.name}`);
    console.log(`  - Role: ${louie.role}`);
    console.log(`  - Password hash length: ${louie.password_hash?.length || 0} chars`);

    // Test password verification
    console.log('\nTesting password verification...');
    const isValid = await bcrypt.compare('louie-99', louie.password_hash);
    console.log(`  - Password "louie-99" matches: ${isValid ? '✓ YES' : '❌ NO'}`);

    if (!isValid) {
      console.log('\n⚠️  Password mismatch! Hash may have been created with different parameters.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyTurso();
