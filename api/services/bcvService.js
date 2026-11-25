import pool from '../config/database.js'

export const bcvService = {
  async getTasaPorFecha(fecha) {
    try {
      const result = await pool.query(
        'SELECT tasa_diaria FROM tasa_bcv WHERE fecha = $1',
        [fecha]
      )
      return result.rows[0]?.tasa_diaria || null
    } catch (error) {
      console.error('Error obteniendo tasa BCV:', error)
      return null
    }
  },

  async registrarTasa(fecha, tasa_diaria, fuente = 'manual') {
    try {
      const result = await pool.query(
        `INSERT INTO tasa_bcv (fecha, tasa_diaria, fuente)
         VALUES ($1, $2, $3)
         ON CONFLICT (fecha) DO UPDATE SET tasa_diaria = $2, fuente = $3
         RETURNING *`,
        [fecha, tasa_diaria, fuente]
      )
      return result.rows[0]
    } catch (error) {
      throw new Error(`Error registrando tasa BCV: ${error.message}`)
    }
  },

  async getTasas(desde, hasta) {
    try {
      const result = await pool.query(
        `SELECT * FROM tasa_bcv WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha DESC`,
        [desde, hasta]
      )
      return result.rows
    } catch (error) {
      throw new Error(`Error obteniendo tasas: ${error.message}`)
    }
  }
}
