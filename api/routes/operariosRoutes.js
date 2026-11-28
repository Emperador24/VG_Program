import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operarios ORDER BY nombre')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operarios WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { nombre, cedula, cargo, monto_pago, tipo_pago, rol } = req.body
    if (!nombre || !cedula || !monto_pago) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, cedula, monto_pago' })
    }

    const validRol = (rol === 'ayudante') ? 'ayudante' : 'operario_principal'
    const result = await pool.query(
      `INSERT INTO operarios (nombre, cedula, cargo, monto_pago, tipo_pago, rol)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, cedula, cargo || null, monto_pago, tipo_pago || 'diario', validRol]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { nombre, cedula, cargo, monto_pago, tipo_pago, rol } = req.body
    const validRol = (rol === 'ayudante') ? 'ayudante' : 'operario_principal'
    const result = await pool.query(
      `UPDATE operarios
       SET nombre=$1, cedula=$2, cargo=$3, monto_pago=$4, tipo_pago=$5, rol=$6, actualizado_en=NOW()
       WHERE id=$7 RETURNING *`,
      [nombre, cedula, cargo, monto_pago, tipo_pago || 'diario', validRol, req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM operarios WHERE id = $1 RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operario no encontrado' })
    }
    res.json({ mensaje: 'Operario eliminado exitosamente', id: result.rows[0].id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
