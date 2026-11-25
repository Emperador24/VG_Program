import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY nombre')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nombre, rif, contacto } = req.body
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' })

    const result = await pool.query(
      `INSERT INTO clientes (nombre, rif, contacto)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, rif || null, contacto || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
