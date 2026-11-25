import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js'
import { clientesContratosService } from '../services/clientesContratosService.js'

const router = express.Router()
router.use(authenticateToken)

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { cliente_id, maquina_id, monto_hora_dia, monto_hora_noche, fecha_inicio, fecha_fin } = req.body
    if (!cliente_id || !maquina_id || !monto_hora_dia || !monto_hora_noche || !fecha_inicio) {
      return res.status(400).json({ error: 'Campos requeridos' })
    }
    const contrato = await clientesContratosService.crearContrato(cliente_id, maquina_id, monto_hora_dia, monto_hora_noche, fecha_inicio, fecha_fin)
    res.status(201).json(contrato)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/cliente/:cliente_id', async (req, res) => {
  try {
    const contratos = await clientesContratosService.getContratosPorCliente(req.params.cliente_id)
    res.json(contratos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/horas', async (req, res) => {
  try {
    const { cliente_contrato_id, fecha, horas, es_noche } = req.body
    if (!cliente_contrato_id || !fecha || !horas) {
      return res.status(400).json({ error: 'Campos requeridos' })
    }
    const record = await clientesContratosService.registrarHoras(cliente_contrato_id, fecha, horas, es_noche || false, req.usuario.id)
    res.status(201).json(record)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/horas/:cliente_id/:fecha_inicio/:fecha_fin', async (req, res) => {
  try {
    const horas = await clientesContratosService.horasPorPeriodo(req.params.cliente_id, req.params.fecha_inicio, req.params.fecha_fin)
    res.json(horas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
