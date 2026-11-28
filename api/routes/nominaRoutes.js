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
    const { operario_id, periodo_inicio, periodo_fin, horas_trabajadas, base, deduccion, adelanto, neto, fecha_pago } = req.body

    if (!operario_id || !periodo_inicio || !periodo_fin || !horas_trabajadas || !base || !fecha_pago) {
      return res.status(400).json({ error: 'Campos requeridos: operario_id, periodo_inicio, periodo_fin, horas_trabajadas, base, fecha_pago' })
    }

    const neto_calculado = neto || (parseFloat(base) - (parseFloat(deduccion) || 0) + (parseFloat(adelanto) || 0))

    const result = await pool.query(
      `INSERT INTO pagos_nomina (operario_id, periodo_inicio, periodo_fin, horas_trabajadas, base, deduccion, adelanto, neto, fecha_pago, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        operario_id,
        periodo_inicio,
        periodo_fin,
        parseFloat(horas_trabajadas),
        parseFloat(base),
        parseFloat(deduccion) || 0,
        parseFloat(adelanto) || 0,
        neto_calculado,
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
