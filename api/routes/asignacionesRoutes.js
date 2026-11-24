import express from 'express';
import { asignacionesService } from '../services/asignacionesService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.maquina_id) filtros.maquina_id = req.query.maquina_id;
    const asignaciones = await asignacionesService.getAll(filtros);
    res.json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const asignacion = await asignacionesService.getById(req.params.id);
    res.json(asignacion);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/maquina/:maquina_id/activa', async (req, res) => {
  try {
    const asignacion = await asignacionesService.getAsignacionActiva(req.params.maquina_id);
    res.json(asignacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/maquina/:maquina_id/historico', async (req, res) => {
  try {
    const historico = await asignacionesService.getHistoricoMaquina(req.params.maquina_id);
    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('administrador'), async (req, res) => {
  try {
    const { maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas } = req.body;
    const asignacion = await asignacionesService.create(maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas);
    res.status(201).json(asignacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const { maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas, estado } = req.body;
    const asignacion = await asignacionesService.update(req.params.id, maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas, estado);
    res.json(asignacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/finalizar', requireRole('administrador'), async (req, res) => {
  try {
    const { fecha_fin } = req.body;
    const asignacion = await asignacionesService.finalizar(req.params.id, fecha_fin);
    res.json({ mensaje: 'Asignación finalizada', asignacion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
