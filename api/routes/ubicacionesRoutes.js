import express from 'express';
import { ubicacionesService } from '../services/ubicacionesService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const ubicaciones = await ubicacionesService.getAll();
    res.json(ubicaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ubicacion = await ubicacionesService.getById(req.params.id);
    res.json(ubicacion);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, tipo, coordenadas_gps, descripcion, estado } = req.body;
    const ubicacion = await ubicacionesService.create(nombre, tipo, coordenadas_gps, descripcion, estado);
    res.status(201).json(ubicacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, tipo, coordenadas_gps, descripcion, estado } = req.body;
    const ubicacion = await ubicacionesService.update(req.params.id, nombre, tipo, coordenadas_gps, descripcion, estado);
    res.json(ubicacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const ubicacion = await ubicacionesService.delete(req.params.id);
    res.json({ mensaje: 'Ubicación marcada como eliminada', ubicacion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
