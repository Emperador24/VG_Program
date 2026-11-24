import pool from '../config/database.js';

export const gastosService = {
  async getAll(filtros = {}) {
    try {
      let query = `
        SELECT g.*,
               m.codigo as maquina_codigo,
               o.nombre as operario_nombre,
               c.nombre as categoria_nombre
        FROM gastos g
        LEFT JOIN maquinas m ON g.maquina_id = m.id
        LEFT JOIN operarios o ON g.operario_id = o.id
        LEFT JOIN categorias_gasto c ON g.categoria_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (filtros.estado) {
        query += ` AND g.estado = $${params.length + 1}`;
        params.push(filtros.estado);
      }
      if (filtros.categoria_id) {
        query += ` AND g.categoria_id = $${params.length + 1}`;
        params.push(filtros.categoria_id);
      }

      query += ' ORDER BY g.fecha DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT g.*, c.nombre as categoria_nombre
         FROM gastos g
         LEFT JOIN categorias_gasto c ON g.categoria_id = c.id
         WHERE g.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Gasto no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async create(maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado) {
    try {
      if (!categoria_id || !monto_usd) {
        throw new Error('Categoría y monto requeridos');
      }

      const result = await pool.query(
        `INSERT INTO gastos (maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado || 'pendiente']
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async update(id, maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado) {
    try {
      const result = await pool.query(
        `UPDATE gastos
         SET maquina_id = COALESCE($1, maquina_id),
             operario_id = COALESCE($2, operario_id),
             categoria_id = COALESCE($3, categoria_id),
             monto_usd = COALESCE($4, monto_usd),
             monto_bolivares = COALESCE($5, monto_bolivares),
             tasa = COALESCE($6, tasa),
             fecha = COALESCE($7, fecha),
             descripcion = COALESCE($8, descripcion),
             evidencia_url = COALESCE($9, evidencia_url),
             estado = COALESCE($10, estado),
             actualizado_en = NOW()
         WHERE id = $11
         RETURNING *`,
        [maquina_id, operario_id, categoria_id, monto_usd, monto_bolivares, tasa, fecha, descripcion, evidencia_url, estado, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Gasto no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const result = await pool.query(
        'UPDATE gastos SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['anulado', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Gasto no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async aprobar(id) {
    try {
      const result = await pool.query(
        'UPDATE gastos SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['aprobado', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Gasto no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async rechazar(id) {
    try {
      const result = await pool.query(
        'UPDATE gastos SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['rechazado', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Gasto no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getCategorias() {
    try {
      const result = await pool.query('SELECT * FROM categorias_gasto ORDER BY nombre');
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getTotalPorCategoria(fechaInicio, fechaFin) {
    try {
      const result = await pool.query(
        `SELECT c.nombre, COUNT(g.id) as cantidad, SUM(g.monto_usd) as total_usd
         FROM gastos g
         JOIN categorias_gasto c ON g.categoria_id = c.id
         WHERE g.fecha >= $1 AND g.fecha <= $2 AND g.estado = 'aprobado'
         GROUP BY c.id, c.nombre
         ORDER BY total_usd DESC`,
        [fechaInicio, fechaFin]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
