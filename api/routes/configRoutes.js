import express from 'express'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import pool from '../config/database.js'

const router = express.Router()

// Obtener configuración
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT clave, valor FROM configuracion')
    const config = {}
    result.rows.forEach(row => {
      config[row.clave] = row.valor
    })
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Actualizar configuración (solo admin)
router.put('/:clave', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { clave } = req.params
    const { valor, descripcion } = req.body

    if (!valor) {
      return res.status(400).json({ error: 'Valor requerido' })
    }

    // Upsert
    await pool.query(
      `INSERT INTO configuracion (clave, valor, descripcion) 
       VALUES ($1, $2, $3)
       ON CONFLICT (clave) DO UPDATE 
       SET valor = $2, actualizado_en = NOW()`,
      [clave, valor, descripcion]
    )

    res.json({ 
      mensaje: 'Configuración actualizada',
      clave, 
      valor 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener un valor específico
router.get('/:clave', verifyToken, async (req, res) => {
  try {
    const { clave } = req.params
    const result = await pool.query('SELECT valor FROM configuracion WHERE clave = $1', [clave])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' })
    }

    res.json({ clave, valor: result.rows[0].valor })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
