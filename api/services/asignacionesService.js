import pool from '../config/database.js';

export const asignacionesService = {
  async getAll(filtros = {}) {
    try {
      let query = `
        SELECT a.*,
               m.codigo as maquina_codigo,
               o.nombre as operario_nombre,
               u.nombre as ubicacion_nombre
        FROM asignaciones a
        LEFT JOIN maquinas m ON a.maquina_id = m.id
        LEFT JOIN operarios o ON a.operario_id = o.id
        LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filtros.estado) {
        query += ` AND a.estado = $${params.length + 1}`;
        params.push(filtros.estado);
      }
      if (filtros.maquina_id) {
        query += ` AND a.maquina_id = $${params.length + 1}`;
        params.push(filtros.maquina_id);
      }

      query += ' ORDER BY a.fecha_inicio DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT a.*, m.codigo as maquina_codigo, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
         FROM asignaciones a
         LEFT JOIN maquinas m ON a.maquina_id = m.id
         LEFT JOIN operarios o ON a.operario_id = o.id
         LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
         WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Asignación no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async create(maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin) {
    try {
      if (!maquina_id || !operario_id || !ubicacion_id || !fecha_inicio) {
        throw new Error('Máquina, operario, ubicación y fecha requeridos');
      }

      const result = await pool.query(
        `INSERT INTO asignaciones (maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin]
      );

      // Obtener info de la máquina
      const maquinaInfo = await pool.query(
        'SELECT tipo, chuto_maquina_id FROM maquinas WHERE id = $1',
        [maquina_id]
      );

      // Actualizar estado de máquina a "activo"
      await pool.query(
        'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2',
        ['activo', maquina_id]
      );

      // Si es un CHUTO, actualizar también la maquinaria que lleva
      if (maquinaInfo.rows[0] && maquinaInfo.rows[0].tipo === 'chuto' && maquinaInfo.rows[0].chuto_maquina_id) {
        await pool.query(
          'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2',
          ['activo', maquinaInfo.rows[0].chuto_maquina_id]
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async update(id, maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, notas, estado) {
    try {
      const result = await pool.query(
        `UPDATE asignaciones
         SET maquina_id = COALESCE($1, maquina_id),
             operario_id = COALESCE($2, operario_id),
             ubicacion_id = COALESCE($3, ubicacion_id),
             fecha_inicio = COALESCE($4, fecha_inicio),
             fecha_fin = COALESCE($5, fecha_fin),
             actualizado_en = NOW()
         WHERE id = $6
         RETURNING *`,
        [maquina_id, operario_id, ubicacion_id, fecha_inicio, fecha_fin, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Asignación no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async finalizar(id, fecha_fin) {
    try {
      const asignacion = await pool.query(
        'SELECT maquina_id FROM asignaciones WHERE id = $1',
        [id]
      );

      if (asignacion.rows.length === 0) {
        throw new Error('Asignación no encontrada');
      }

      const maquina_id = asignacion.rows[0].maquina_id;

      const result = await pool.query(
        'UPDATE asignaciones SET fecha_fin = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        [fecha_fin, id]
      );

      // Obtener info de la máquina
      const maquinaInfo = await pool.query(
        'SELECT tipo, chuto_maquina_id FROM maquinas WHERE id = $1',
        [maquina_id]
      );

      // Actualizar estado de máquina a "parada"
      await pool.query(
        'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2',
        ['parada', maquina_id]
      );

      // Si es un CHUTO, actualizar también la maquinaria que lleva a "parada"
      if (maquinaInfo.rows[0] && maquinaInfo.rows[0].tipo === 'chuto' && maquinaInfo.rows[0].chuto_maquina_id) {
        await pool.query(
          'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2',
          ['parada', maquinaInfo.rows[0].chuto_maquina_id]
        );
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getAsignacionActiva(maquina_id) {
    try {
      const result = await pool.query(
        `SELECT a.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
         FROM asignaciones a
         LEFT JOIN operarios o ON a.operario_id = o.id
         LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
         WHERE a.maquina_id = $1 AND a.estado = 'activa'
         LIMIT 1`,
        [maquina_id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getHistoricoMaquina(maquina_id) {
    try {
      const result = await pool.query(
        `SELECT a.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
         FROM asignaciones a
         LEFT JOIN operarios o ON a.operario_id = o.id
         LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
         WHERE a.maquina_id = $1
         ORDER BY a.fecha_inicio DESC`,
        [maquina_id]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
