// test/globalHooks.js
const DBMigrate = require('db-migrate');
const db = require('../db'); // Your application's db connector module

// Define global hooks out in the root suite context
before(async function() {
  console.log('🔄 Wiping and migrating Docker test database...');

  // Force db-migrate to use your test environment settings
  const dbmigrate = DBMigrate.getInstance(true, { env: 'test' });

  // 1. Drop existing data/tables completely to clear residual state
//  await dbmigrate.reset();

  // 2. Run all up migrations to construct a fresh schema copies
  await dbmigrate.up();
  
  console.log('✅ Database schema ready for integration tests.');
});

after(async function() {
  console.log('🛑 Cleaning up integration suite resources...');
  
  // Cleanly close lingering pool connections from your code architecture
/*  if (db.closePool) {
    await db.closePool();
  } */
});
