const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function seedTurso() {
  const client = createClient({
    url: 'libsql://goalgetter-leap99-dockalodski88.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY1OTM3MjMsImlkIjoiMDE5ZGE0OTktNmQwMS03MzA5LWE5YjEtNmFhZmViZDkzOGQ1IiwicmlkIjoiMjc4MGRkYWUtZTk3OC00NDc2LWE0NGMtNjJkNjY4NmJlYzFmIn0.NXTKdU7Srtil2_PUZWDzD7KsyH0MEk7kqW6FLxDKFrLuncPLgCGbsQhw3J0x12RfnHLpwrz3QsCaWjFmMPPCCg',
  });

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('louie-99', salt);

    await client.execute(
      `INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        '550e8400-e29b-41d4-a716-446655440000',
        'louie@leap99.com',
        'Louie Sibayan',
        hashedPassword,
        'head_coach',
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
      ]
    );

    console.log('✓ Seeded test user to Turso');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedTurso();
