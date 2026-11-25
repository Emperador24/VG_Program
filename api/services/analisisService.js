import pool from '../config/database.js'

export const analisisService = {
  async getPorMaquina(periodoInicio, periodoFin) {
    return (await pool.query(
      `SELECT m.codigo, m.tipo,
              SUM(CASE WHEN g.estado='aprobado' THEN g.monto_usd ELSE 0 END) as gastos,
              SUM(i.monto_usd) as ingresos
       FROM maquinas m
       LEFT JOIN gastos g ON m.id = g.maquina_id AND g.fecha BETWEEN $1 AND $2
       LEFT JOIN ingresos i ON m.id = i.maquina_id AND i.fecha BETWEEN $1 AND $2
       GROUP BY m.id, m.codigo, m.tipo
       ORDER BY SUM(i.monto_usd) DESC`, [periodoInicio, periodoFin]
    )).rows.map(m => ({
      ...m,
      gastos: parseFloat(m.gastos || 0),
      ingresos: parseFloat(m.ingresos || 0),
      ganancia: parseFloat(m.ingresos || 0) - parseFloat(m.gastos || 0)
    }))
  },

  async getPorCliente(periodoInicio, periodoFin) {
    return (await pool.query(
      `SELECT c.nombre, SUM(i.monto_usd) as ingresos, COUNT(i.id) as trabajos
       FROM clientes c
       LEFT JOIN ingresos i ON c.id = i.cliente_id AND i.fecha BETWEEN $1 AND $2
       WHERE c.id IN (SELECT cliente_id FROM ingresos WHERE fecha BETWEEN $1 AND $2)
       GROUP BY c.id, c.nombre
       ORDER BY SUM(i.monto_usd) DESC`, [periodoInicio, periodoFin]
    )).rows.map(c => ({
      ...c,
      ingresos: parseFloat(c.ingresos || 0)
    }))
  },

  async getPorUbicacion(periodoInicio, periodoFin) {
    return (await pool.query(
      `SELECT u.nombre,
              SUM(CASE WHEN g.estado='aprobado' THEN g.monto_usd ELSE 0 END) as gastos,
              SUM(i.monto_usd) as ingresos
       FROM ubicaciones u
       LEFT JOIN gastos g ON u.id = g.ubicacion_id AND g.fecha BETWEEN $1 AND $2
       LEFT JOIN ingresos i ON u.id = i.ubicacion_id AND i.fecha BETWEEN $1 AND $2
       WHERE u.id IN (SELECT ubicacion_id FROM gastos WHERE fecha BETWEEN $1 AND $2 OR ubicacion_id IN (SELECT ubicacion_id FROM ingresos WHERE fecha BETWEEN $1 AND $2))
       GROUP BY u.id, u.nombre`, [periodoInicio, periodoFin]
    )).rows.map(u => ({
      ...u,
      gastos: parseFloat(u.gastos || 0),
      ingresos: parseFloat(u.ingresos || 0),
      ganancia: parseFloat(u.ingresos || 0) - parseFloat(u.gastos || 0)
    }))
  },

  async getResumenCompleto(periodoInicio, periodoFin) {
    const ingresos = (await pool.query(
      `SELECT SUM(monto_usd) as total FROM ingresos WHERE fecha BETWEEN $1 AND $2`, [periodoInicio, periodoFin]
    )).rows[0]

    const gastos = (await pool.query(
      `SELECT SUM(monto_usd) as total FROM gastos WHERE estado='aprobado' AND fecha BETWEEN $1 AND $2`, [periodoInicio, periodoFin]
    )).rows[0]

    const nomina = (await pool.query(
      `SELECT SUM(neto) as total FROM pagos_nomina WHERE fecha_pago BETWEEN $1 AND $2`, [periodoInicio, periodoFin]
    )).rows[0]

    const totalIngresos = parseFloat(ingresos?.total || 0)
    const totalGastos = parseFloat(gastos?.total || 0)
    const totalNomina = parseFloat(nomina?.total || 0)

    return {
      ingresos: totalIngresos,
      gastos: totalGastos,
      nomina: totalNomina,
      ganancia: totalIngresos - totalGastos - totalNomina,
      margenGanancia: totalIngresos > 0 ? (((totalIngresos - totalGastos - totalNomina) / totalIngresos) * 100).toFixed(2) : 0
    }
  }
}
