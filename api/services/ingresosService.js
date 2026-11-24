import pool from '../config/database.js';

export const ingresosService = {
  async getAll(filtros = {}) {
    try {
      let query = `
        SELECT i.*,
               c.nombre as cliente_nombre,
               m.codigo as maquina_codigo
        FROM ingresos i
        LEFT JOIN clientes c ON i.cliente_id = c.id
        LEFT JOIN maquinas m ON i.maquina_id = m.id
        WHERE 1=1
      `;
      const params = [];

      if (filtros.estado) {
        query += ` AND i.estado = $${params.length + 1}`;
        params.push(filtros.estado);
      }
      if (filtros.cliente_id) {
        query += ` AND i.cliente_id = $${params.length + 1}`;
        params.push(filtros.cliente_id);
      }

      query += ' ORDER BY i.fecha DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT i.*, c.nombre as cliente_nombre
         FROM ingresos i
         LEFT JOIN clientes c ON i.cliente_id = c.id
         WHERE i.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Ingreso no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async create(cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado) {
    try {
      if (!cliente_id || !monto_usd) {
        throw new Error('Cliente y monto requeridos');
      }

      const result = await pool.query(
        `INSERT INTO ingresos (cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado || 'registrado']
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async update(id, cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado) {
    try {
      const result = await pool.query(
        `UPDATE ingresos
         SET cliente_id = COALESCE($1, cliente_id),
             maquina_id = COALESCE($2, maquina_id),
             fecha = COALESCE($3, fecha),
             monto_usd = COALESCE($4, monto_usd),
             monto_bolivares = COALESCE($5, monto_bolivares),
             tasa = COALESCE($6, tasa),
             descripcion = COALESCE($7, descripcion),
             estado = COALESCE($8, estado),
             actualizado_en = NOW()
         WHERE id = $9
         RETURNING *`,
        [cliente_id, maquina_id, fecha, monto_usd, monto_bolivares, tasa, descripcion, estado, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Ingreso no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const result = await pool.query(
        'UPDATE ingresos SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['anulado', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Ingreso no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getTotalPorPeriodo(fechaInicio, fechaFin) {
    try {
      const result = await pool.query(
        `SELECT SUM(monto_usd) as total_usd, COUNT(*) as cantidad
         FROM ingresos
         WHERE fecha >= $1 AND fecha <= $2 AND estado = 'registrado'`,
        [fechaInicio, fechaFin]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getClientes() {
    try {
      const result = await pool.query('SELECT * FROM clientes WHERE estado = $1 ORDER BY nombre', ['activo']);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
