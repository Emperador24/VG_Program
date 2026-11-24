import cron from 'node-cron';
import { reportesService } from '../services/reportesService.js';

export function initReportesJobs() {
  cron.schedule('0 19 * * *', async () => {
    try {
      console.log('[CRON] Reporte diario...');
      await reportesService.generateDiario();
    } catch (error) {
      console.error('[CRON] Error diario:', error.message);
    }
  });

  cron.schedule('0 20 * * 0', async () => {
    try {
      console.log('[CRON] Reporte semanal...');
      await reportesService.generateSemanal();
    } catch (error) {
      console.error('[CRON] Error semanal:', error.message);
    }
  });

  cron.schedule('0 6 1 * *', async () => {
    try {
      console.log('[CRON] Reporte mensual...');
      const hoy = new Date();
      const mesAnterior = hoy.getMonth();
      const anio = hoy.getFullYear();
      await reportesService.generateMensual(mesAnterior, anio);
    } catch (error) {
      console.error('[CRON] Error mensual:', error.message);
    }
  });

  console.log('[CRON] Reportes inicializados');
}
