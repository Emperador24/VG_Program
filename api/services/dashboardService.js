import pool from '../config/database.js';

export const dashboardService = {
  async getKPIs() {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [gHoy, gSem, gMes, iHoy, iSem, iMes, mTot, mAsig, oAct, oLic] = await Promise.all([
        pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM gastos WHERE fecha = $1 AND estado = 'aprobado'`, [hoy]),
        pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM gastos WHERE fecha >= $1 AND estado = 'aprobado'`, [inicioSemana]),
        pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM gastos WHERE fecha >= $1 AND estado = 'aprobado'`, [inicioMes]),
        pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM ingresos WHERE fecha = $1 AND estado = 'registrado'`, [hoy]),
        pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM ingresos WHERE fecha >= $1 AND estado = 'registrado'`, [inicioSemana]),
        pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM ingresos WHERE fecha >= $1 AND estado = 'registrado'`, [inicioMes]),
        pool.query(`SELECT COUNT(*) as total FROM maquinas WHERE estado = 'activo'`),
        pool.query(`SELECT COUNT(DISTINCT maquina_id) as total FROM asignaciones WHERE estado = 'activa'`),
        pool.query(`SELECT COUNT(*) as total FROM operarios WHERE estado = 'activo'`),
        pool.query(`SELECT COUNT(*) as total FROM operarios WHERE estado = 'licencia'`),
      ]);

      return {
        gastos: { hoy: parseFloat(gHoy.rows[0].total), semana: parseFloat(gSem.rows[0].total), mes: parseFloat(gMes.rows[0].total) },
        ingresos: { hoy: parseFloat(iHoy.rows[0].total), semana: parseFloat(iSem.rows[0].total), mes: parseFloat(iMes.rows[0].total) },
        maquinas: { total: mTot.rows[0].total, asignadas: mAsig.rows[0].total, disponibles: mTot.rows[0].total - mAsig.rows[0].total },
        operarios: { activos: oAct.rows[0].total, licencia: oLic.rows[0].total },
      };
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },

  async getGastosPorCategoria(dias = 30) {
    const fecha_inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT c.nombre, COUNT(g.id) as cantidad, SUM(g.monto_usd) as total FROM gastos g JOIN categorias_gasto c ON g.categoria_id = c.id WHERE g.fecha >= $1 AND g.estado = 'aprobado' GROUP BY c.id, c.nombre ORDER BY total DESC`,
      [fecha_inicio]
    );
    return result.rows;
  },

  async getIngresosPorCliente(dias = 30) {
    const fecha_inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT c.nombre, COUNT(i.id) as cantidad, SUM(i.monto_usd) as total FROM ingresos i JOIN clientes c ON i.cliente_id = c.id WHERE i.fecha >= $1 AND i.estado = 'registrado' GROUP BY c.id, c.nombre ORDER BY total DESC`,
      [fecha_inicio]
    );
    return result.rows;
  },

  async getUltimosGastos(limite = 5) {
    const result = await pool.query(
      `SELECT g.*, c.nombre as categoria_nombre, m.codigo as maquina_codigo FROM gastos g LEFT JOIN categorias_gasto c ON g.categoria_id = c.id LEFT JOIN maquinas m ON g.maquina_id = m.id WHERE g.estado = 'aprobado' ORDER BY g.fecha DESC LIMIT $1`,
      [limite]
    );
    return result.rows;
  },

  async getUltimosIngresos(limite = 5) {
    const result = await pool.query(
      `SELECT i.*, c.nombre as cliente_nombre FROM ingresos i LEFT JOIN clientes c ON i.cliente_id = c.id WHERE i.estado = 'registrado' ORDER BY i.fecha DESC LIMIT $1`,
      [limite]
    );
    return result.rows;
  },

  async getAlertas() {
    const alertas = [];
    const maq = await pool.query(`SELECT COUNT(*) as total FROM maquinas m LEFT JOIN asignaciones a ON m.id = a.maquina_id AND a.estado = 'activa' WHERE m.estado = 'activo' AND a.id IS NULL`);
    if (maq.rows[0].total > 0) alertas.push({ tipo: 'warning', mensaje: `${maq.rows[0].total} máquinas sin asignar` });
    
    const gast = await pool.query(`SELECT COUNT(*) as total FROM gastos WHERE estado = 'pendiente'`);
    if (gast.rows[0].total > 0) alertas.push({ tipo: 'info', mensaje: `${gast.rows[0].total} gastos pendientes` });
    
    return alertas;
  },
};
