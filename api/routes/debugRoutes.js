import express from 'express'
import pool from '../config/database.js'

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

export default router
