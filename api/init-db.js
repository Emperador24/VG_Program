import pool from './config/database.js';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  try {
    console.log('[DB] Initializing database...');
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute migration
    await pool.query(schema);
    
    console.log('[DB] Database initialized successfully');
    return true;
  } catch (error) {
    // If tables already exist, it's fine
    if (error.message.includes('already exists')) {
      console.log('[DB] Tables already exist, skipping migration');
      return true;
    }
    console.error('[DB] Error initializing database:', error.message);
    return false;
  }
}

export default initializeDatabase;
