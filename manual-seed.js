// Quick seed runner
const { seedDatabase } = require('./src/lib/db/seed');

async function run() {
  try {
    console.log('Starting seed...');
    await seedDatabase();
    console.log('✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error.message);
    process.exit(1);
  }
}

run();
