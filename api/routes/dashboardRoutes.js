import express from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/kpis', async (req, res) => {
  try {
    const kpis = await dashboardService.getKPIs();
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gastos-categoria', async (req, res) => {
  try {
    const datos = await dashboardService.getGastosPorCategoria(req.query.dias || 30);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ingresos-cliente', async (req, res) => {
  try {
    const datos = await dashboardService.getIngresosPorCliente(req.query.dias || 30);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ultimos-gastos', async (req, res) => {
  try {
    const datos = await dashboardService.getUltimosGastos(5);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ultimos-ingresos', async (req, res) => {
  try {
    const datos = await dashboardService.getUltimosIngresos(5);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alertas', async (req, res) => {
  try {
    const alertas = await dashboardService.getAlertas();
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
