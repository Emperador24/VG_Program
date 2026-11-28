import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

async function initializeDatabase() {
  try {
    console.log('[DB] Initializing database...');

    // Get all migration files in order
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    // Execute each migration
    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      const schema = fs.readFileSync(migrationPath, 'utf-8');

      try {
        // Split by semicolon to execute multiple statements
        const statements = schema.split(';').filter(s => s.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            await pool.query(statement);
          }
        }
        console.log(`[DB] ✓ Migration executed: ${file}`);
      } catch (error) {
        // If column/table already exists, continue
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate key')) {
          console.log(`[DB] ⚠ Skipped (exists): ${file}`);
        } else {
          console.warn(`[DB] ⚠ Error in ${file}:`, error.message);
          // Don't stop on error, continue with next migration
        }
      }
    }

    console.log('[DB] Database initialized successfully');

    // Seed default admin user
    await seedAdminUser();

    return true;
  } catch (error) {
    console.error('[DB] Error initializing database:', error.message);
    return false;
  }
}

async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      ['admin@vg.com']
    );

    if (existing.rows.length > 0) {
      console.log('[DB] Admin user already exists');
      return;
    }

    // Create admin user with password: 123456
    const contraseña = '123456';
    const contraseña_hash = await bcrypt.hash(contraseña, 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña_hash, rol, activo) VALUES ($1, $2, $3, $4, $5)',
      ['Administrador V&G', 'admin@vg.com', contraseña_hash, 'administrador', true]
    );

    console.log('[DB] Admin user created: admin@vg.com / 123456');
  } catch (error) {
    console.error('[DB] Error seeding admin user:', error.message);
  }
}

export default initializeDatabase;
