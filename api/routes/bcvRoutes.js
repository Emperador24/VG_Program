import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import { bcvService } from '../services/bcvService.js'

const router = express.Router()
router.use(authenticateToken)

router.get('/tasa/:fecha', async (req, res) => {
  try {
    const tasa = await bcvService.getTasaPorFecha(req.params.fecha)
    res.json({ fecha: req.params.fecha, tasa_diaria: tasa || 2600 })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/tasa', requireAdmin, async (req, res) => {
  try {
    const { fecha, tasa_diaria } = req.body
    if (!fecha || !tasa_diaria) {
      return res.status(400).json({ error: 'Fecha y tasa requeridas' })
    }
    const result = await bcvService.registrarTasa(fecha, tasa_diaria)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/tasas', async (req, res) => {
  try {
    const { desde, hasta } = req.query
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros desde y hasta requeridos' })
    }
    const tasas = await bcvService.getTasas(desde, hasta)
    res.json(tasas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
