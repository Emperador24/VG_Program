import pool from '../config/database.js'

export const clientesContratosService = {
  async crearContrato(cliente_id, maquina_id, monto_hora_dia, monto_hora_noche, fecha_inicio, fecha_fin) {
    try {
      const result = await pool.query(
        `INSERT INTO clientes_contratos (cliente_id, maquina_id, monto_hora_dia, monto_hora_noche, fecha_inicio, fecha_fin)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cliente_id, maquina_id, monto_hora_dia, monto_hora_noche, fecha_inicio, fecha_fin]
      )
      return result.rows[0]
    } catch (error) {
      throw new Error(`Error creando contrato: ${error.message}`)
    }
  },

  async getContratosPorCliente(cliente_id) {
    try {
      const result = await pool.query(
        `SELECT cc.*, m.placa, m.tipo FROM clientes_contratos cc
         LEFT JOIN maquinas m ON cc.maquina_id = m.id
         WHERE cc.cliente_id = $1 AND cc.fecha_fin IS NULL
         ORDER BY m.placa`,
        [cliente_id]
      )
      return result.rows
    } catch (error) {
      throw new Error(`Error obteniendo contratos: ${error.message}`)
    }
  },

  async registrarHoras(cliente_contrato_id, fecha, horas, es_noche, creado_por) {
    try {
      const contrato = await pool.query('SELECT * FROM clientes_contratos WHERE id = $1', [cliente_contrato_id])
      if (contrato.rows.length === 0) throw new Error('Contrato no encontrado')
      
      const tasa = es_noche ? contrato.rows[0].monto_hora_noche : contrato.rows[0].monto_hora_dia
      const monto = parseFloat(horas) * tasa
      
      const result = await pool.query(
        `INSERT INTO horas_trabajadas (cliente_contrato_id, fecha, horas_trabajadas, es_noche, monto_calculado, creado_por)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cliente_contrato_id, fecha, horas, es_noche, monto, creado_por]
      )
      return result.rows[0]
    } catch (error) {
      throw new Error(`Error registrando horas: ${error.message}`)
    }
  },

  async horasPorPeriodo(cliente_id, fecha_inicio, fecha_fin) {
    try {
      const result = await pool.query(
        `SELECT ht.*, cc.cliente_id, m.placa, m.tipo
         FROM horas_trabajadas ht
         JOIN clientes_contratos cc ON ht.cliente_contrato_id = cc.id
         LEFT JOIN maquinas m ON cc.maquina_id = m.id
         WHERE cc.cliente_id = $1 AND ht.fecha BETWEEN $2 AND $3
         ORDER BY ht.fecha DESC, m.placa`,
        [cliente_id, fecha_inicio, fecha_fin]
      )
      return result.rows
    } catch (error) {
      throw new Error(`Error obteniendo horas: ${error.message}`)
    }
  }
}
