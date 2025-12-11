import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const migrationsFolder = './drizzle';
const journalPath = join(migrationsFolder, 'meta', '_journal.json');

async function runMigrations() {
  // Check if migrations directory and journal exist
  if (!existsSync(journalPath)) {
    console.log('No migrations found. Skipping migration step.');
    console.log('If this is the first run, you may need to generate migrations first.');
    process.exit(0);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Running migrations...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  
  try {
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed!');
  } finally {
    await client.end();
  }
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

