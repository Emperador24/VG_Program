import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/operarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operarios ORDER BY nombre')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/trabajadores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trabajadores ORDER BY nombre')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/pago', requireAdmin, async (req, res) => {
  try {
    const { operario_id, trabajador_id, periodo_inicio, periodo_fin, base, bonos, adelantos, descuentos, neto, fecha_pago, tipo } = req.body
    
    if (!base || !neto || !fecha_pago) {
      return res.status(400).json({ error: 'Campos requeridos' })
    }

    const result = await pool.query(
      `INSERT INTO pagos_nomina (${operario_id ? 'operario_id' : 'trabajador_id'}, periodo_inicio, periodo_fin, base, bonos, adelantos, descuentos, neto, fecha_pago, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        operario_id || trabajador_id,
        periodo_inicio || new Date().toISOString().split('T')[0],
        periodo_fin || new Date().toISOString().split('T')[0],
        base,
        bonos || 0,
        adelantos || 0,
        descuentos || 0,
        neto,
        fecha_pago,
        req.usuario.id
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
