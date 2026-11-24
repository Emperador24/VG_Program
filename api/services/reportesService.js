import pool from '../config/database.js';

export const reportesService = {
  async generateDiario(fecha = new Date().toISOString().split('T')[0]) {
    const gastos = await pool.query(
      `SELECT o.nombre, COUNT(*) as cantidad, SUM(monto_usd) as total 
       FROM gastos g LEFT JOIN operarios o ON g.operario_id = o.id 
       WHERE g.fecha = $1 AND g.estado = 'aprobado' 
       GROUP BY o.id, o.nombre ORDER BY total DESC`,
      [fecha]
    );

    const totalGastos = await pool.query(
      `SELECT COALESCE(SUM(monto_usd), 0) as total FROM gastos 
       WHERE fecha = $1 AND estado = 'aprobado'`,
      [fecha]
    );

    const contenido = {
      tipo: 'diario',
      fecha: fecha,
      titulo: `Reporte Diario - ${fecha}`,
      gastosOperario: gastos.rows,
      totalGastos: parseFloat(totalGastos.rows[0].total),
      generadoEn: new Date(),
    };

    return await this.guardarReporte(contenido);
  },

  async generateSemanal(fechaFin = new Date().toISOString().split('T')[0]) {
    const fechaInicio = new Date(new Date(fechaFin).getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const gastosMaquina = await pool.query(
      `SELECT m.codigo, m.tipo, COUNT(*) as cantidad, SUM(monto_usd) as total 
       FROM gastos g LEFT JOIN maquinas m ON g.maquina_id = m.id 
       WHERE g.fecha >= $1 AND g.fecha <= $2 AND g.estado = 'aprobado' 
       GROUP BY m.id, m.codigo, m.tipo ORDER BY total DESC`,
      [fechaInicio, fechaFin]
    );

    const totalGastos = await pool.query(
      `SELECT COALESCE(SUM(monto_usd), 0) as total FROM gastos 
       WHERE fecha >= $1 AND fecha <= $2 AND estado = 'aprobado'`,
      [fechaInicio, fechaFin]
    );

    const totalIngresos = await pool.query(
      `SELECT COALESCE(SUM(monto_usd), 0) as total FROM ingresos 
       WHERE fecha >= $1 AND fecha <= $2 AND estado = 'registrado'`,
      [fechaInicio, fechaFin]
    );

    const contenido = {
      tipo: 'semanal',
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      titulo: `Reporte Semanal - ${fechaInicio} a ${fechaFin}`,
      gastosMaquina: gastosMaquina.rows,
      totalGastos: parseFloat(totalGastos.rows[0].total),
      totalIngresos: parseFloat(totalIngresos.rows[0].total),
      ganancia: parseFloat(totalIngresos.rows[0].total) - parseFloat(totalGastos.rows[0].total),
      generadoEn: new Date(),
    };

    return await this.guardarReporte(contenido);
  },

  async generateMensual(mes = new Date().getMonth() + 1, anio = new Date().getFullYear()) {
    const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const fechaFin = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;

    const [gTotal, iTotal, gastosCat, ingresosCli, operarios] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM gastos 
                  WHERE fecha >= $1 AND fecha <= $2 AND estado = 'aprobado'`, [fechaInicio, fechaFin]),
      pool.query(`SELECT COALESCE(SUM(monto_usd), 0) as total FROM ingresos 
                  WHERE fecha >= $1 AND fecha <= $2 AND estado = 'registrado'`, [fechaInicio, fechaFin]),
      pool.query(`SELECT c.nombre, COUNT(*) as cantidad, SUM(monto_usd) as total 
                  FROM gastos g JOIN categorias_gasto c ON g.categoria_id = c.id 
                  WHERE g.fecha >= $1 AND g.fecha <= $2 AND g.estado = 'aprobado' 
                  GROUP BY c.id, c.nombre ORDER BY total DESC`, [fechaInicio, fechaFin]),
      pool.query(`SELECT c.nombre, COUNT(*) as cantidad, SUM(monto_usd) as total 
                  FROM ingresos i JOIN clientes c ON i.cliente_id = c.id 
                  WHERE i.fecha >= $1 AND i.fecha <= $2 AND i.estado = 'registrado' 
                  GROUP BY c.id, c.nombre ORDER BY total DESC`, [fechaInicio, fechaFin]),
      pool.query(`SELECT COUNT(*) as total FROM operarios WHERE estado = 'activo'`),
    ]);

    const totalGastos = parseFloat(gTotal.rows[0].total);
    const totalIngresos = parseFloat(iTotal.rows[0].total);
    const ganancia = totalIngresos - totalGastos;
    const rentabilidad = totalIngresos > 0 ? (ganancia / totalIngresos * 100).toFixed(2) : 0;

    const contenido = {
      tipo: 'mensual',
      mes: mes,
      anio: anio,
      titulo: `Reporte Mensual - ${mes}/${anio}`,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      totalIngresos: totalIngresos,
      totalGastos: totalGastos,
      ganancia: ganancia,
      rentabilidad: rentabilidad,
      gastosPorCategoria: gastosCat.rows,
      ingresosPorCliente: ingresosCli.rows,
      operariosActivos: operarios.rows[0].total,
      generadoEn: new Date(),
    };

    return await this.guardarReporte(contenido);
  },

  async guardarReporte(contenido) {
    const result = await pool.query(
      `INSERT INTO reportes (tipo, contenido, fecha_generacion) 
       VALUES ($1, $2, $3) RETURNING *`,
      [contenido.tipo, JSON.stringify(contenido), new Date()]
    );
    return result.rows[0];
  },

  async getReportes(tipo = null) {
    let query = 'SELECT * FROM reportes WHERE 1=1';
    const params = [];

    if (tipo) {
      query += ` AND tipo = $${params.length + 1}`;
      params.push(tipo);
    }

    query += ' ORDER BY fecha_generacion DESC LIMIT 50';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getReporte(id) {
    const result = await pool.query('SELECT * FROM reportes WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new Error('Reporte no encontrado');
    return result.rows[0];
  },
};
