import express from 'express'
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js'
import { nominaService } from '../services/nominaService.js'

const router = express.Router()
router.use(verifyToken)

router.get('/operarios', async (req, res) => {
  try {
    const operarios = await nominaService.getOperarios()
    res.json(operarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/operario/:id', async (req, res) => {
  try {
    const operario = await nominaService.getOperarioDetalle(req.params.id)
    res.json(operario)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/pago', requireAdmin, async (req, res) => {
  try {
    const { operario_id, periodo_inicio, periodo_fin, base, bonos, adelantos, descuentos, fecha_pago } = req.body
    const pago = await nominaService.registrarPago(operario_id, periodo_inicio, periodo_fin, base, bonos || 0, adelantos || 0, descuentos || 0, fecha_pago)
    res.status(201).json(pago)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/resumen', async (req, res) => {
  try {
    const { inicio, fin } = req.query
    const resumen = await nominaService.resumenPeriodo(inicio, fin)
    res.json(resumen)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
