import express from 'express';
import { operariosService } from '../services/operariosService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const operarios = await operariosService.getAll();
    res.json(operarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const operario = await operariosService.getById(req.params.id);
    res.json(operario);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion } = req.body;
    const operario = await operariosService.create(nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion);
    res.status(201).json(operario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion } = req.body;
    const operario = await operariosService.update(req.params.id, nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion);
    res.json(operario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('administrador'), async (req, res) => {
  try {
    const operario = await operariosService.delete(req.params.id);
    res.json({ mensaje: 'Operario marcado como eliminado', operario });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
