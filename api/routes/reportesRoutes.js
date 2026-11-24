import express from 'express';
import { reportesService } from '../services/reportesService.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const tipo = req.query.tipo || null;
    const reportes = await reportesService.getReportes(tipo);
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reporte = await reportesService.getReporte(req.params.id);
    res.json(JSON.parse(reporte.contenido));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/generar/diario', requireRole('administrador'), async (req, res) => {
  try {
    const fecha = req.body.fecha || new Date().toISOString().split('T')[0];
    const reporte = await reportesService.generateDiario(fecha);
    res.json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/generar/semanal', requireRole('administrador'), async (req, res) => {
  try {
    const fechaFin = req.body.fechaFin || new Date().toISOString().split('T')[0];
    const reporte = await reportesService.generateSemanal(fechaFin);
    res.json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/generar/mensual', requireRole('administrador'), async (req, res) => {
  try {
    const mes = req.body.mes || new Date().getMonth() + 1;
    const anio = req.body.anio || new Date().getFullYear();
    const reporte = await reportesService.generateMensual(mes, anio);
    res.json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
