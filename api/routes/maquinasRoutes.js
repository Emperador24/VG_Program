import express from 'express';
import { maquinasService } from '../services/maquinasService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const maquinas = await maquinasService.getAll();
    res.json(maquinas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const maquina = await maquinasService.getById(req.params.id);
    res.json(maquina);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', requireRole('administrador'), async (req, res) => {
  try {
    const { codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor } = req.body;
    const maquina = await maquinasService.create(codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor);
    res.status(201).json(maquina);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const { codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor } = req.body;
    const maquina = await maquinasService.update(req.params.id, codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor);
    res.json(maquina);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const maquina = await maquinasService.delete(req.params.id);
    res.json({ mensaje: 'Marcada como eliminada', maquina });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
