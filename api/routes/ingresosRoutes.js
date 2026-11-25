import express from 'express'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()
router.use(verifyToken)

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingresos ORDER BY fecha DESC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { fecha, cliente_id, maquina_id, ubicacion_id, concepto, cantidad, monto_usd, tasa_diaria, estado_cobro } = req.body
    if (!cliente_id || !maquina_id || !monto_usd) {
      return res.status(400).json({ error: 'Campos requeridos: cliente_id, maquina_id, monto_usd' })
    }

    const result = await pool.query(
      `INSERT INTO ingresos (fecha, cliente_id, maquina_id, ubicacion_id, concepto, cantidad, monto_usd, tasa_diaria, estado_cobro, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1) RETURNING *`,
      [fecha || new Date().toISOString().split('T')[0], cliente_id, maquina_id, ubicacion_id || null, concepto || null, cantidad || null, monto_usd, tasa_diaria || null, estado_cobro || 'pendiente']
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
