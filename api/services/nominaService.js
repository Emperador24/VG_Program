import pool from '../config/database.js'

export const nominaService = {
  async getOperarios() {
    return (await pool.query(
      `SELECT o.*, COUNT(a.id) as maquinas_asignadas
       FROM operarios o
       LEFT JOIN asignaciones a ON o.id = a.operario_id AND a.fecha_fin IS NULL
       GROUP BY o.id ORDER BY o.nombre`
    )).rows
  },

  async getOperarioDetalle(id) {
    const op = (await pool.query('SELECT * FROM operarios WHERE id = $1', [id])).rows[0]
    if (!op) throw new Error('Operario no encontrado')

    const asignacion = (await pool.query(
      `SELECT a.*, m.codigo FROM asignaciones a
       LEFT JOIN maquinas m ON a.maquina_id = m.id
       WHERE a.operario_id = $1 AND a.fecha_fin IS NULL`, [id]
    )).rows[0]

    const pagos = (await pool.query(
      `SELECT * FROM pagos_nomina WHERE operario_id = $1 ORDER BY fecha_pago DESC LIMIT 12`, [id]
    )).rows

    const totalPagado = (await pool.query(
      `SELECT SUM(neto) as total FROM pagos_nomina WHERE operario_id = $1`, [id]
    )).rows[0]

    return { ...op, asignacionActual: asignacion, pagosHistorico: pagos, totalPagadoHistorico: parseFloat(totalPagado?.total || 0) }
  },

  async registrarPago(operarioId, periodoInicio, periodoFin, base, bonos, adelantos, descuentos, fechaPago) {
    const neto = base + bonos - adelantos - descuentos
    return (await pool.query(
      `INSERT INTO pagos_nomina (operario_id, periodo_inicio, periodo_fin, base, bonos, adelantos, descuentos, neto, fecha_pago, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1) RETURNING *`,
      [operarioId, periodoInicio, periodoFin, base, bonos, adelantos, descuentos, neto, fechaPago]
    )).rows[0]
  },

  async resumenPeriodo(periodoInicio, periodoFin) {
    const result = (await pool.query(
      `SELECT o.nombre, o.monto_pago, SUM(pn.neto) as pagado, COUNT(pn.id) as pagos
       FROM operarios o
       LEFT JOIN pagos_nomina pn ON o.id = pn.operario_id AND pn.fecha_pago BETWEEN $1 AND $2
       WHERE o.activo = true
       GROUP BY o.id, o.nombre, o.monto_pago`, [periodoInicio, periodoFin]
    )).rows

    const totalEsperado = result.reduce((sum, o) => sum + (o.monto_pago || 0), 0)
    const totalPagado = result.reduce((sum, o) => sum + (o.pagado || 0), 0)

    return { operarios: result, totalEsperado, totalPagado, diferencia: totalEsperado - totalPagado }
  }
}
