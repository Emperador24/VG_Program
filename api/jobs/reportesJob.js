import cron from 'node-cron'
import { reportesService } from '../services/reportesService.js'
import { emailService } from '../services/emailService.js'
import { format } from 'date-fns'

export function initReportesJobs() {
  console.log('[CRON] Inicializando jobs de reportes automáticos...')

  // Reporte Diario - 19:00 (7 PM)
  cron.schedule('0 19 * * *', async () => {
    try {
      console.log('[CRON] Generando reporte diario...')
      const ayer = new Date()
      ayer.setDate(ayer.getDate() - 1)
      
      const datos = await reportesService.generarReporteDiario(ayer)
      await reportesService.guardarReporte('diario', 
        format(ayer, 'yyyy-MM-dd'), 
        format(ayer, 'yyyy-MM-dd'), 
        datos,
        null
      )
      
      await emailService.enviarReporteDiario(datos)
      console.log('[CRON] ✓ Reporte diario generado y enviado')
    } catch (err) {
      console.error('[CRON] Error en reporte diario:', err.message)
    }
  })

  // Reporte Semanal - Domingo 20:00 (8 PM)
  cron.schedule('0 20 * * 0', async () => {
    try {
      console.log('[CRON] Generando reporte semanal...')
      const hoy = new Date()
      
      const datos = await reportesService.generarReporteSemanal(hoy)
      const lunesAnterior = new Date(hoy)
      lunesAnterior.setDate(hoy.getDate() - hoy.getDay() - 1)
      
      await reportesService.guardarReporte('semanal',
        format(lunesAnterior, 'yyyy-MM-dd'),
        format(hoy, 'yyyy-MM-dd'),
        datos,
        null
      )
      
      await emailService.enviarReporteSemanal(datos)
      console.log('[CRON] ✓ Reporte semanal generado y enviado')
    } catch (err) {
      console.error('[CRON] Error en reporte semanal:', err.message)
    }
  })

  // Reporte Quincenal - Día 1 y 15 a las 06:00 (6 AM)
  cron.schedule('0 6 1,15 * *', async () => {
    try {
      console.log('[CRON] Generando reporte quincenal...')
      const hoy = new Date()
      
      const datos = await reportesService.generarReporteQuincenal(hoy)
      await reportesService.guardarReporte('quincenal',
        datos.periodo.split(' al ')[0],
        datos.periodo.split(' al ')[1],
        datos,
        null
      )
      
      await emailService.enviarReporteSemanal(datos)
      console.log('[CRON] ✓ Reporte quincenal generado y enviado')
    } catch (err) {
      console.error('[CRON] Error en reporte quincenal:', err.message)
    }
  })

  // Reporte Mensual - Día 1 a las 06:00 (6 AM)
  cron.schedule('0 6 1 * *', async () => {
    try {
      console.log('[CRON] Generando reporte mensual...')
      const hoy = new Date()
      
      const datos = await reportesService.generarReporteMensual(hoy)
      const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      mesAnterior.setMonth(mesAnterior.getMonth() - 1)
      
      const ultimoDiaAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
      
      await reportesService.guardarReporte('mensual',
        format(mesAnterior, 'yyyy-MM-dd'),
        format(ultimoDiaAnterior, 'yyyy-MM-dd'),
        datos,
        null
      )
      
      await emailService.enviarReporteMensual(datos)
      console.log('[CRON] ✓ Reporte mensual generado y enviado')
    } catch (err) {
      console.error('[CRON] Error en reporte mensual:', err.message)
    }
  })

  console.log('[CRON] ✓ Jobs de reportes inicializados')
}
