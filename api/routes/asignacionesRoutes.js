import express from 'express';
import { asignacionesService } from '../services/asignacionesService.js';
import { authenticateToken, requireRole, requireAdmin } from '../middleware/authMiddleware.js';

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

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin } = req.body;
    if (!maquina_id || !operario_id || !ubicacion_id || !fecha_inicio) {
      return res.status(400).json({ error: 'Campos requeridos: maquina_id, operario_id, ubicacion_id, fecha_inicio' });
    }
    const asignacion = await asignacionesService.create(maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin || null);
    res.status(201).json(asignacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas, estado } = req.body;
    const asignacion = await asignacionesService.update(req.params.id, maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas, estado);
    res.json(asignacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/finalizar', requireAdmin, async (req, res) => {
  try {
    const { fecha_fin } = req.body;
    const asignacion = await asignacionesService.finalizar(req.params.id, fecha_fin);
    res.json({ mensaje: 'Asignación finalizada', asignacion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE asignaciones SET fecha_fin = CURRENT_DATE WHERE id = $1 RETURNING *',
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' })

    // Actualizar estado de máquina a "parada"
    const maquina_id = result.rows[0].maquina_id

    // Obtener info de la máquina
    const maquinaInfo = await pool.query(
      'SELECT tipo, chuto_maquina_id FROM maquinas WHERE id = $1',
      [maquina_id]
    )

    await pool.query(
      'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2',
      ['parada', maquina_id]
    )

    // Si es un CHUTO, actualizar también la maquinaria que lleva a "parada"
    if (maquinaInfo.rows[0] && maquinaInfo.rows[0].tipo === 'chuto' && maquinaInfo.rows[0].chuto_maquina_id) {
      await pool.query(
        'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2',
        ['parada', maquinaInfo.rows[0].chuto_maquina_id]
      )
    }

    res.json({ mensaje: 'Asignación cancelada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
