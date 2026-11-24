import express from 'express';
import { gastosService } from '../services/gastosService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.categoria_id) filtros.categoria_id = req.query.categoria_id;
    const gastos = await gastosService.getAll(filtros);
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/categorias/list', async (req, res) => {
  try {
    const categorias = await gastosService.getCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const gasto = await gastosService.getById(req.params.id);
    res.json(gasto);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url } = req.body;
    const gasto = await gastosService.create(maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url);
    res.status(201).json(gasto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado } = req.body;
    const gasto = await gastosService.update(req.params.id, maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado);
    res.json(gasto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/aprobar', requireRole('administrador'), async (req, res) => {
  try {
    const gasto = await gastosService.aprobar(req.params.id);
    res.json({ mensaje: 'Gasto aprobado', gasto });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/rechazar', requireRole('administrador'), async (req, res) => {
  try {
    const gasto = await gastosService.rechazar(req.params.id);
    res.json({ mensaje: 'Gasto rechazado', gasto });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const gasto = await gastosService.delete(req.params.id);
    res.json({ mensaje: 'Gasto anulado', gasto });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
