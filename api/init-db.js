import pool from './config/database.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

async function initializeDatabase() {
  try {
    console.log('[DB] Initializing database...');

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await pool.query(schema);

    console.log('[DB] Database initialized successfully');

    // Seed default admin user
    await seedAdminUser();

    return true;
  } catch (error) {
    // If tables already exist, it's fine
    if (error.message.includes('already exists')) {
      console.log('[DB] Tables already exist, skipping migration');

      // Still try to seed admin user
      await seedAdminUser();

      return true;
    }
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
