import pool from '../config/database.js'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth } from 'date-fns'
import es from 'date-fns/locale/es/index.js'

export const reportesService = {
  async generarReporteDiario(fecha = new Date()) {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    
    const gastos = await pool.query(
      `SELECT SUM(monto_usd) as total, COUNT(*) as cantidad
       FROM gastos WHERE fecha = $1 AND estado = 'aprobado'`,
      [fechaStr]
    )

    const ingresos = await pool.query(
      `SELECT SUM(monto_usd) as total, COUNT(*) as cantidad
       FROM ingresos WHERE fecha = $1`,
      [fechaStr]
    )

    const resultado = {
      fecha: fechaStr,
      gastos: parseFloat(gastos.rows[0]?.total || 0),
      gastos_cantidad: parseInt(gastos.rows[0]?.cantidad || 0),
      ingresos: parseFloat(ingresos.rows[0]?.total || 0),
      ingresos_cantidad: parseInt(ingresos.rows[0]?.cantidad || 0),
      ganancia: parseFloat(ingresos.rows[0]?.total || 0) - parseFloat(gastos.rows[0]?.total || 0)
    }

    return resultado
  },

  async generarReporteSemanal(fecha = new Date()) {
    const semanaInicio = startOfWeek(fecha, { locale: es })
    const semanaFin = endOfWeek(fecha, { locale: es })
    const inicioStr = format(semanaInicio, 'yyyy-MM-dd')
    const finStr = format(semanaFin, 'yyyy-MM-dd')

    const maquinas = await pool.query(
      `SELECT m.id, m.codigo, m.tipo,
              SUM(g.monto_usd) as gastos, SUM(i.monto_usd) as ingresos
       FROM maquinas m
       LEFT JOIN gastos g ON m.id = g.maquina_id AND g.fecha BETWEEN $1 AND $2 AND g.estado = 'aprobado'
       LEFT JOIN ingresos i ON m.id = i.maquina_id AND i.fecha BETWEEN $1 AND $2
       GROUP BY m.id, m.codigo, m.tipo`,
      [inicioStr, finStr]
    )

    const totalGastos = await pool.query(
      `SELECT SUM(monto_usd) as total FROM gastos WHERE fecha BETWEEN $1 AND $2 AND estado = 'aprobado'`,
      [inicioStr, finStr]
    )

    const totalIngresos = await pool.query(
      `SELECT SUM(monto_usd) as total FROM ingresos WHERE fecha BETWEEN $1 AND $2`,
      [inicioStr, finStr]
    )

    return {
      periodo: `${format(semanaInicio, 'dd MMM', { locale: es })} - ${format(semanaFin, 'dd MMM yyyy', { locale: es })}`,
      maquinas: maquinas.rows.map(m => ({
        codigo: m.codigo,
        tipo: m.tipo,
        gastos: parseFloat(m.gastos || 0),
        ingresos: parseFloat(m.ingresos || 0),
        ganancia: (parseFloat(m.ingresos || 0) - parseFloat(m.gastos || 0))
      })),
      totalGastos: parseFloat(totalGastos.rows[0]?.total || 0),
      totalIngresos: parseFloat(totalIngresos.rows[0]?.total || 0),
      totalGanancia: parseFloat(totalIngresos.rows[0]?.total || 0) - parseFloat(totalGastos.rows[0]?.total || 0)
    }
  },

  async generarReporteQuincenal(fecha = new Date()) {
    const dia = fecha.getDate()
    let inicioStr, finStr

    if (dia <= 15) {
      inicioStr = format(new Date(fecha.getFullYear(), fecha.getMonth(), 1), 'yyyy-MM-dd')
      finStr = format(new Date(fecha.getFullYear(), fecha.getMonth(), 15), 'yyyy-MM-dd')
    } else {
      inicioStr = format(new Date(fecha.getFullYear(), fecha.getMonth(), 16), 'yyyy-MM-dd')
      const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()
      finStr = format(new Date(fecha.getFullYear(), fecha.getMonth(), ultimoDia), 'yyyy-MM-dd')
    }

    const gastos = await pool.query(
      `SELECT SUM(monto_usd) as total FROM gastos WHERE fecha BETWEEN $1 AND $2 AND estado = 'aprobado'`,
      [inicioStr, finStr]
    )

    const ingresos = await pool.query(
      `SELECT SUM(monto_usd) as total FROM ingresos WHERE fecha BETWEEN $1 AND $2`,
      [inicioStr, finStr]
    )

    const nomina = await pool.query(
      `SELECT SUM(neto) as total FROM pagos_nomina WHERE fecha_pago BETWEEN $1 AND $2`,
      [inicioStr, finStr]
    )

    return {
      periodo: `${inicioStr} al ${finStr}`,
      gastos: parseFloat(gastos.rows[0]?.total || 0),
      ingresos: parseFloat(ingresos.rows[0]?.total || 0),
      nomina: parseFloat(nomina.rows[0]?.total || 0),
      ganancia: parseFloat(ingresos.rows[0]?.total || 0) - parseFloat(gastos.rows[0]?.total || 0) - parseFloat(nomina.rows[0]?.total || 0)
    }
  },

  async generarReporteMensual(fecha = new Date()) {
    const mesInicio = startOfMonth(fecha)
    const mesFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
    const inicioStr = format(mesInicio, 'yyyy-MM-dd')
    const finStr = format(mesFin, 'yyyy-MM-dd')

    const gastos = await pool.query(
      `SELECT SUM(monto_usd) as total, COUNT(*) as cantidad FROM gastos 
       WHERE fecha BETWEEN $1 AND $2 AND estado = 'aprobado'`,
      [inicioStr, finStr]
    )

    const ingresos = await pool.query(
      `SELECT SUM(monto_usd) as total, COUNT(*) as cantidad FROM ingresos 
       WHERE fecha BETWEEN $1 AND $2`,
      [inicioStr, finStr]
    )

    const nomina = await pool.query(
      `SELECT SUM(neto) as total FROM pagos_nomina WHERE fecha_pago BETWEEN $1 AND $2`,
      [inicioStr, finStr]
    )

    const porMaquina = await pool.query(
      `SELECT m.codigo, SUM(g.monto_usd) as gastos, SUM(i.monto_usd) as ingresos
       FROM maquinas m
       LEFT JOIN gastos g ON m.id = g.maquina_id AND g.fecha BETWEEN $1 AND $2 AND g.estado = 'aprobado'
       LEFT JOIN ingresos i ON m.id = i.maquina_id AND i.fecha BETWEEN $1 AND $2
       GROUP BY m.id, m.codigo`,
      [inicioStr, finStr]
    )

    const porCliente = await pool.query(
      `SELECT c.nombre, SUM(i.monto_usd) as ingresos, COUNT(*) as trabajos
       FROM clientes c
       LEFT JOIN ingresos i ON c.id = i.cliente_id AND i.fecha BETWEEN $1 AND $2
       GROUP BY c.id, c.nombre`,
      [inicioStr, finStr]
    )

    const totalGastos = parseFloat(gastos.rows[0]?.total || 0)
    const totalIngresos = parseFloat(ingresos.rows[0]?.total || 0)
    const totalNomina = parseFloat(nomina.rows[0]?.total || 0)
    const ganancia = totalIngresos - totalGastos - totalNomina

    return {
      mes: format(mesInicio, 'MMMM yyyy', { locale: es }),
      periodo: `${inicioStr} al ${finStr}`,
      resumen: {
        ingresos: totalIngresos,
        gastos: totalGastos,
        nomina: totalNomina,
        ganancia: ganancia,
        margenGanancia: totalIngresos > 0 ? ((ganancia / totalIngresos) * 100).toFixed(2) : 0
      },
      porMaquina: porMaquina.rows.map(m => ({
        maquina: m.codigo,
        ingresos: parseFloat(m.ingresos || 0),
        gastos: parseFloat(m.gastos || 0),
        ganancia: parseFloat(m.ingresos || 0) - parseFloat(m.gastos || 0)
      })),
      porCliente: porCliente.rows.filter(c => c.ingresos).map(c => ({
        cliente: c.nombre,
        ingresos: parseFloat(c.ingresos || 0),
        trabajos: parseInt(c.trabajos || 0)
      }))
    }
  },

  async guardarReporte(tipo, periodoInicio, periodoFin, datos, correoDestino) {
    const result = await pool.query(
      `INSERT INTO reportes (tipo, periodo_inicio, periodo_fin, datos, correo_destino)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [tipo, periodoInicio, periodoFin, JSON.stringify(datos), correoDestino]
    )
    return result.rows[0]
  },

  async marcarEnviado(reporteId) {
    await pool.query(
      `UPDATE reportes SET enviado_a_correo = true, fecha_envio = NOW() WHERE id = $1`,
      [reporteId]
    )
  }
}
