import pool from '../config/database.js'

export const maquinasService = {
  async getAll() {
    const result = await pool.query(`
      SELECT m.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
      FROM maquinas m
      LEFT JOIN asignaciones a ON m.id = a.maquina_id AND a.fecha_fin IS NULL
      LEFT JOIN operarios o ON a.operario_id = o.id
      LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
      ORDER BY m.codigo
    `)
    return result.rows
  },

  async getById(id) {
    const maquina = await pool.query('SELECT * FROM maquinas WHERE id = $1', [id])
    if (maquina.rows.length === 0) throw new Error('Máquina no encontrada')

    const asignacion = await pool.query(`
      SELECT a.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
      FROM asignaciones a
      LEFT JOIN operarios o ON a.operario_id = o.id
      LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
      WHERE a.maquina_id = $1 AND a.fecha_fin IS NULL
      LIMIT 1
    `, [id])

    const historico = await pool.query(`
      SELECT a.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
      FROM asignaciones a
      LEFT JOIN operarios o ON a.operario_id = o.id
      LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
      WHERE a.maquina_id = $1
      ORDER BY a.fecha_inicio DESC
      LIMIT 10
    `, [id])

    const gastos = await pool.query(`
      SELECT SUM(monto_usd) as total, COUNT(*) as cantidad
      FROM gastos WHERE maquina_id = $1 AND estado = 'aprobado'
    `, [id])

    const ingresos = await pool.query(`
      SELECT SUM(monto_usd) as total, COUNT(*) as cantidad
      FROM ingresos WHERE maquina_id = $1
    `, [id])

    return {
      ...maquina.rows[0],
      asignacionActual: asignacion.rows[0] || null,
      historicoAsignaciones: historico.rows,
      gastosAcumulados: parseFloat(gastos.rows[0]?.total || 0),
      gastosQuantidad: parseInt(gastos.rows[0]?.cantidad || 0),
      ingresosAcumulados: parseFloat(ingresos.rows[0]?.total || 0),
      ingresosQuantidad: parseInt(ingresos.rows[0]?.cantidad || 0),
      gananciaAcumulada: parseFloat(ingresos.rows[0]?.total || 0) - parseFloat(gastos.rows[0]?.total || 0)
    }
  },

  async reasignar(maquinaId, operarioId, ubicacionId, fechaInicio) {
    await pool.query('BEGIN')
    try {
      await pool.query(
        'UPDATE asignaciones SET fecha_fin = $1 WHERE maquina_id = $2 AND fecha_fin IS NULL',
        [fechaInicio, maquinaId]
      )

      await pool.query(
        `INSERT INTO asignaciones (maquina_id, operario_id, ubicacion_id, fecha_inicio)
         VALUES ($1, $2, $3, $4)`,
        [maquinaId, operarioId, ubicacionId, fechaInicio]
      )

      await pool.query('COMMIT')
      return { mensaje: 'Máquina reasignada exitosamente' }
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  },

  async create(codigo, tipo, marca, modelo, anio, estado, fechaCompra, valor) {
    const result = await pool.query(
      `INSERT INTO maquinas (codigo, tipo, marca, modelo, anio, estado, fecha_compra, valor)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [codigo, tipo, marca, modelo, anio, estado, fechaCompra, valor]
    )
    return result.rows[0]
  }
}
