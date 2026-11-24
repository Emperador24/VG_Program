import pool from '../config/database.js';

export const ubicacionesService = {
  async getAll() {
    try {
      const result = await pool.query(`
        SELECT u.*,
               COUNT(a.id) as asignaciones_activas
        FROM ubicaciones u
        LEFT JOIN asignaciones a ON u.id = a.ubicacion_id AND a.fecha_fin IS NULL
        GROUP BY u.id
        ORDER BY u.nombre
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT u.*,
                COUNT(a.id) as asignaciones_activas
         FROM ubicaciones u
         LEFT JOIN asignaciones a ON u.id = a.ubicacion_id AND a.fecha_fin IS NULL
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Ubicación no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async create(nombre, tipo, coordenadas_gps, descripcion, estado) {
    try {
      if (!nombre) {
        throw new Error('Nombre requerido');
      }

      const result = await pool.query(
        `INSERT INTO ubicaciones (nombre, tipo, coordenadas_gps, descripcion, estado)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nombre, tipo, coordenadas_gps, descripcion, estado || 'activa']
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async update(id, nombre, tipo, coordenadas_gps, descripcion, estado) {
    try {
      const result = await pool.query(
        `UPDATE ubicaciones
         SET nombre = COALESCE($1, nombre),
             tipo = COALESCE($2, tipo),
             coordenadas_gps = COALESCE($3, coordenadas_gps),
             descripcion = COALESCE($4, descripcion),
             estado = COALESCE($5, estado),
             actualizado_en = NOW()
         WHERE id = $6
         RETURNING *`,
        [nombre, tipo, coordenadas_gps, descripcion, estado, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Ubicación no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const result = await pool.query(
        'UPDATE ubicaciones SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['eliminada', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Ubicación no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getByEstado(estado) {
    try {
      const result = await pool.query(
        'SELECT * FROM ubicaciones WHERE estado = $1 ORDER BY nombre',
        [estado]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
