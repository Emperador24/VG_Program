import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trabajadores ORDER BY nombre')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nombre, cedula, cargo, salario_diario } = req.body
    if (!nombre || !cedula || !salario_diario) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, cedula, salario_diario' })
    }

    const result = await pool.query(
      `INSERT INTO trabajadores (nombre, cedula, cargo, salario_diario)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, cedula, cargo || null, salario_diario]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
