import pool from '../config/database.js';

export const operariosService = {
  async getAll() {
    try {
      const result = await pool.query(`
        SELECT o.*,
               COUNT(a.id) as maquinas_asignadas,
               SUM(CASE WHEN a.fecha_fin IS NULL THEN 1 ELSE 0 END) as maquinas_activas
        FROM operarios o
        LEFT JOIN asignaciones a ON o.id = a.operario_id
        GROUP BY o.id
        ORDER BY o.nombre, o.apellido
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const result = await pool.query(
        `SELECT o.*,
                COUNT(a.id) as maquinas_asignadas,
                SUM(CASE WHEN a.fecha_fin IS NULL THEN 1 ELSE 0 END) as maquinas_activas
         FROM operarios o
         LEFT JOIN asignaciones a ON o.id = a.operario_id
         WHERE o.id = $1
         GROUP BY o.id`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Operario no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async create(nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion) {
    try {
      if (!nombre || !apellido || !cedula) {
        throw new Error('Nombre, apellido y cédula requeridos');
      }

      const result = await pool.query(
        `INSERT INTO operarios (nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [nombre, apellido, cedula, telefono, email, salario, frecuencia_pago || 'mensual', estado || 'activo', fecha_contratacion]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async update(id, nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion) {
    try {
      const result = await pool.query(
        `UPDATE operarios
         SET nombre = COALESCE($1, nombre),
             apellido = COALESCE($2, apellido),
             cedula = COALESCE($3, cedula),
             telefono = COALESCE($4, telefono),
             email = COALESCE($5, email),
             salario = COALESCE($6, salario),
             frecuencia_pago = COALESCE($7, frecuencia_pago),
             estado = COALESCE($8, estado),
             fecha_contratacion = COALESCE($9, fecha_contratacion),
             actualizado_en = NOW()
         WHERE id = $10
         RETURNING *`,
        [nombre, apellido, cedula, telefono, email, salario, frecuencia_pago, estado, fecha_contratacion, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Operario no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      const result = await pool.query(
        'UPDATE operarios SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *',
        ['eliminado', id]
      );

      if (result.rows.length === 0) {
        throw new Error('Operario no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getByEstado(estado) {
    try {
      const result = await pool.query(
        'SELECT * FROM operarios WHERE estado = $1 ORDER BY nombre, apellido',
        [estado]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
