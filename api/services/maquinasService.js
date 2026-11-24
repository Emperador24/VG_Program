import pool from '../config/database.js';

export const maquinasService = {
  async getAll() {
    try {
      const result = await pool.query(`
        SELECT m.*,
               a.operario_id, a.ubicacion_id,
               o.nombre as operario_nombre,
               u.nombre as ubicacion_nombre
        FROM maquinas m
        LEFT JOIN asignaciones a ON m.id = a.maquina_id AND a.fecha_fin IS NULL
        LEFT JOIN operarios o ON a.operario_id = o.id
        LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
        ORDER BY m.codigo
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT m.*,
                a.operario_id, a.ubicacion_id,
                o.nombre as operario_nombre,
                u.nombre as ubicacion_nombre
         FROM maquinas m
         LEFT JOIN asignaciones a ON m.id = a.maquina_id AND a.fecha_fin IS NULL
         LEFT JOIN operarios o ON a.operario_id = o.id
         LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
         WHERE m.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Máquina no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async create(codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor) {
    try {
      if (!codigo || !tipo) {
        throw new Error('Código y tipo requeridos');
      }

      const result = await pool.query(
        `INSERT INTO maquinas (codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [codigo, tipo, placa_serial, marca, modelo, anio, estado || 'activo', fecha_compra, valor]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async update(id, codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor) {
    try {
      const result = await pool.query(
        `UPDATE maquinas
         SET codigo = COALESCE($1, codigo),
             tipo = COALESCE($2, tipo),
             placa_serial = COALESCE($3, placa_serial),
             marca = COALESCE($4, marca),
             modelo = COALESCE($5, modelo),
             anio = COALESCE($6, anio),
             estado = COALESCE($7, estado),
             fecha_compra = COALESCE($8, fecha_compra),
             valor = COALESCE($9, valor),
             actualizado_en = NOW()
         WHERE id = $10
         RETURNING *`,
        [codigo, tipo, placa_serial, marca, modelo, anio, estado, fecha_compra, valor, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Máquina no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const result = await pool.query(
        'UPDATE maquinas SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['eliminada', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Máquina no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getByEstado(estado) {
    try {
      const result = await pool.query(
        'SELECT * FROM maquinas WHERE estado = $1 ORDER BY codigo',
        [estado]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
