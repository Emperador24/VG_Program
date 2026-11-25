import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { analisisService } from '../services/analisisService.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/por-maquina', async (req, res) => {
  try {
    const { inicio, fin } = req.query
    const datos = await analisisService.getPorMaquina(inicio, fin)
    res.json(datos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/por-cliente', async (req, res) => {
  try {
    const { inicio, fin } = req.query
    const datos = await analisisService.getPorCliente(inicio, fin)
    res.json(datos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/por-ubicacion', async (req, res) => {
  try {
    const { inicio, fin } = req.query
    const datos = await analisisService.getPorUbicacion(inicio, fin)
    res.json(datos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/resumen', async (req, res) => {
  try {
    const { inicio, fin } = req.query
    const datos = await analisisService.getResumenCompleto(inicio, fin)
    res.json(datos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
