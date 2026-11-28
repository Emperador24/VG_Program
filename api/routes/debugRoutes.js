import express from 'express'
import pool from '../config/database.js'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Endpoint para revisar máquinas
router.get('/maquinas-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM maquinas')
    res.json({ 
      total: parseInt(result.rows[0].total),
      message: `Total de máquinas en BD: ${result.rows[0].total}`
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para listar todas las máquinas (debug)
router.get('/maquinas-all', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, codigo, tipo, marca FROM maquinas LIMIT 20')
    res.json({ 
      count: result.rows.length,
      maquinas: result.rows
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para revisar columnas de maquinas
router.get('/maquinas-columns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'maquinas'
      ORDER BY ordinal_position
    `)
    res.json({ columns: result.rows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Endpoint para reiniciar la BD (ejecutar todas las migraciones)
router.get('/init-db', async (req, res) => {
  try {
    console.log('[DEBUG] Starting database initialization...')

    // Get all migration files in order
    const migrationsDir = path.join(process.cwd(), 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

    const results = []

    // Execute each migration
    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file)
      const schema = fs.readFileSync(migrationPath, 'utf-8')

      try {
        // Split by semicolon to execute multiple statements
        const statements = schema.split(';').filter(s => s.trim())
        for (const statement of statements) {
          if (statement.trim()) {
            await pool.query(statement)
          }
        }
        results.push({ file, status: '✓ executed' })
        console.log(`[DEBUG] ✓ Migration executed: ${file}`)
      } catch (error) {
        // If column/table already exists, continue
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate key')) {
          results.push({ file, status: '⚠ skipped (exists)' })
          console.log(`[DEBUG] ⚠ Skipped (exists): ${file}`)
        } else {
          results.push({ file, status: `✗ error: ${error.message}` })
          console.error(`[DEBUG] ✗ Error in ${file}:`, error.message)
        }
      }
    }

    res.json({
      message: 'Database initialization complete',
      migrations: results,
      success: true
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
