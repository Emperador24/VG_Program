import express from 'express';
import { ingresosService } from '../services/ingresosService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.cliente_id) filtros.cliente_id = req.query.cliente_id;
    const ingresos = await ingresosService.getAll(filtros);
    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/clientes/list', async (req, res) => {
  try {
    const clientes = await ingresosService.getClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ingreso = await ingresosService.getById(req.params.id);
    res.json(ingreso);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion } = req.body;
    const ingreso = await ingresosService.create(cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion);
    res.status(201).json(ingreso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado } = req.body;
    const ingreso = await ingresosService.update(req.params.id, cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado);
    res.json(ingreso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ingreso = await ingresosService.delete(req.params.id);
    res.json({ mensaje: 'Ingreso anulado', ingreso });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
