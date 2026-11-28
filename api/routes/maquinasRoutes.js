import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maquinas ORDER BY codigo')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const maquina = await pool.query('SELECT * FROM maquinas WHERE id = $1', [req.params.id])
    if (maquina.rows.length === 0) throw new Error('Máquina no encontrada')

    const asignacion = await pool.query(
      `SELECT a.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
       FROM asignaciones a
       LEFT JOIN operarios o ON a.operario_id = o.id
       LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
       WHERE a.maquina_id = $1 AND a.fecha_fin IS NULL LIMIT 1`, [req.params.id]
    )

    const historicoAsignaciones = await pool.query(
      `SELECT a.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
       FROM asignaciones a
       LEFT JOIN operarios o ON a.operario_id = o.id
       LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
       WHERE a.maquina_id = $1 ORDER BY a.fecha_inicio DESC LIMIT 10`, [req.params.id]
    )

    const gastos = await pool.query(
      `SELECT SUM(monto_usd) as total, COUNT(*) as cantidad
       FROM gastos WHERE maquina_id = $1 AND estado = 'aprobado'`, [req.params.id]
    )

    const ingresos = await pool.query(
      `SELECT SUM(monto_usd) as total, COUNT(*) as cantidad
       FROM ingresos WHERE maquina_id = $1`, [req.params.id]
    )

    res.json({
      ...maquina.rows[0],
      asignacionActual: asignacion.rows[0] || null,
      historicoAsignaciones: historicoAsignaciones.rows,
      gastosAcumulados: parseFloat(gastos.rows[0]?.total || 0),
      gastosQuantidad: parseInt(gastos.rows[0]?.cantidad || 0),
      ingresosAcumulados: parseFloat(ingresos.rows[0]?.total || 0),
      ingresosQuantidad: parseInt(ingresos.rows[0]?.cantidad || 0),
      gananciaAcumulada: parseFloat(ingresos.rows[0]?.total || 0) - parseFloat(gastos.rows[0]?.total || 0)
    })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { codigo, tipo, marca, modelo, anio, estado } = req.body
    if (!codigo || !tipo || !marca) {
      return res.status(400).json({ error: 'Campos requeridos: codigo, tipo, marca' })
    }

    const result = await pool.query(
      `INSERT INTO maquinas (codigo, tipo, marca, modelo, anio, estado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [codigo, tipo, marca, modelo || null, anio || null, estado || 'activo']
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/:id/reasignar', requireAdmin, async (req, res) => {
  try {
    const { operario_id, ubicacion_id, fecha_inicio } = req.body
    await pool.query('BEGIN')
    
    await pool.query(
      'UPDATE asignaciones SET fecha_fin = $1 WHERE maquina_id = $2 AND fecha_fin IS NULL',
      [fecha_inicio, req.params.id]
    )

    await pool.query(
      `INSERT INTO asignaciones (maquina_id, operario_id, ubicacion_id, fecha_inicio)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, operario_id, ubicacion_id, fecha_inicio]
    )

    await pool.query('COMMIT')
    res.json({ mensaje: 'Máquina reasignada exitosamente' })
  } catch (error) {
    await pool.query('ROLLBACK')
    res.status(400).json({ error: error.message })
  }
})

export default router
