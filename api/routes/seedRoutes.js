import express from 'express'
import bcrypt from 'bcrypt'
import pool from '../config/database.js'

const router = express.Router()

router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin exists
    const existing = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      ['admin@vg.com']
    )

    if (existing.rows.length > 0) {
      return res.json({ 
        mensaje: 'Usuario admin ya existe',
        usuario: { correo: 'admin@vg.com' }
      })
    }

    // Create admin
    const hash = await bcrypt.hash('123456', 10)
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña_hash, rol, activo) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, rol',
      ['Administrador', 'admin@vg.com', hash, 'administrador', true]
    )

    res.json({ 
      mensaje: 'Usuario admin creado exitosamente',
      usuario: result.rows[0],
      credenciales: { correo: 'admin@vg.com', contraseña: '123456' }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/debug-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, correo, rol, activo FROM usuarios')
    res.json({
      usuarios: result.rows,
      total: result.rows.length
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
