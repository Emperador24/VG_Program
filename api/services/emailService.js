import nodemailer from 'nodemailer'
import pool from '../config/database.js'

let transporter = null

async function initTransporter() {
  if (transporter) return transporter

  const correoVG = process.env.SMTP_USER || 'reportes@vg.com'
  const smtpPass = process.env.SMTP_PASS || 'password123'
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = process.env.SMTP_PORT || 587

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: correoVG,
      pass: smtpPass
    }
  })

  return transporter
}

async function getCorreoConfiguracion() {
  try {
    const result = await pool.query(
      `SELECT valor FROM configuracion WHERE clave = $1`,
      ['correo_reportes']
    )
    return result.rows[0]?.valor || 'admin@vg.com'
  } catch (err) {
    return 'admin@vg.com'
  }
}

export const emailService = {
  async enviarReporteDiario(datos) {
    try {
      const transport = await initTransporter()
      const correoDestino = await getCorreoConfiguracion()

      const html = `
        <h2>Reporte Diario - ${datos.fecha}</h2>
        <p><strong>Gastos:</strong> $${datos.gastos.toFixed(2)} USD (${datos.gastos_cantidad} registros)</p>
        <p><strong>Ingresos:</strong> $${datos.ingresos.toFixed(2)} USD (${datos.ingresos_cantidad} registros)</p>
        <p><strong>Ganancia:</strong> $${datos.ganancia.toFixed(2)} USD</p>
      `

      await transport.sendMail({
        from: process.env.SMTP_USER || 'reportes@vg.com',
        to: correoDestino,
        subject: `Reporte Diario V&G - ${datos.fecha}`,
        html
      })

      return true
    } catch (err) {
      console.error('Error enviando email diario:', err.message)
      return false
    }
  },

  async enviarReporteSemanal(datos) {
    try {
      const transport = await initTransporter()
      const correoDestino = await getCorreoConfiguracion()

      const tablaMaquinas = datos.maquinas.map(m => 
        `<tr>
          <td>${m.codigo}</td>
          <td>${m.tipo}</td>
          <td>$${m.gastos.toFixed(2)}</td>
          <td>$${m.ingresos.toFixed(2)}</td>
          <td>$${m.ganancia.toFixed(2)}</td>
        </tr>`
      ).join('')

      const html = `
        <h2>Reporte Semanal - ${datos.periodo}</h2>
        <table border="1" cellpadding="10" style="border-collapse: collapse;">
          <thead>
            <tr><th>Código</th><th>Tipo</th><th>Gastos</th><th>Ingresos</th><th>Ganancia</th></tr>
          </thead>
          <tbody>
            ${tablaMaquinas}
          </tbody>
        </table>
        <hr/>
        <p><strong>Total Gastos:</strong> $${datos.totalGastos.toFixed(2)} USD</p>
        <p><strong>Total Ingresos:</strong> $${datos.totalIngresos.toFixed(2)} USD</p>
        <p><strong>Total Ganancia:</strong> $${datos.totalGanancia.toFixed(2)} USD</p>
      `

      await transport.sendMail({
        from: process.env.SMTP_USER || 'reportes@vg.com',
        to: correoDestino,
        subject: `Reporte Semanal V&G - ${datos.periodo}`,
        html
      })

      return true
    } catch (err) {
      console.error('Error enviando email semanal:', err.message)
      return false
    }
  },

  async enviarReporteMensual(datos) {
    try {
      const transport = await initTransporter()
      const correoDestino = await getCorreoConfiguracion()

      const tablaMaquinas = datos.porMaquina.map(m => 
        `<tr>
          <td>${m.maquina}</td>
          <td>$${m.ingresos.toFixed(2)}</td>
          <td>$${m.gastos.toFixed(2)}</td>
          <td>$${m.ganancia.toFixed(2)}</td>
        </tr>`
      ).join('')

      const tablaClientes = datos.porCliente.map(c => 
        `<tr>
          <td>${c.cliente}</td>
          <td>$${c.ingresos.toFixed(2)}</td>
          <td>${c.trabajos}</td>
        </tr>`
      ).join('')

      const html = `
        <h2>Reporte Mensual - ${datos.mes}</h2>
        <h3>Resumen del Mes</h3>
        <p><strong>Período:</strong> ${datos.periodo}</p>
        <p><strong>Ingresos:</strong> $${datos.resumen.ingresos.toFixed(2)} USD</p>
        <p><strong>Gastos:</strong> $${datos.resumen.gastos.toFixed(2)} USD</p>
        <p><strong>Nómina:</strong> $${datos.resumen.nomina.toFixed(2)} USD</p>
        <p><strong>Ganancia Neta:</strong> $${datos.resumen.ganancia.toFixed(2)} USD</p>
        <p><strong>Margen de Ganancia:</strong> ${datos.resumen.margenGanancia}%</p>

        <h3>Por Máquina</h3>
        <table border="1" cellpadding="10" style="border-collapse: collapse;">
          <thead>
            <tr><th>Máquina</th><th>Ingresos</th><th>Gastos</th><th>Ganancia</th></tr>
          </thead>
          <tbody>
            ${tablaMaquinas}
          </tbody>
        </table>

        <h3>Por Cliente</h3>
        <table border="1" cellpadding="10" style="border-collapse: collapse;">
          <thead>
            <tr><th>Cliente</th><th>Ingresos</th><th>Trabajos</th></tr>
          </thead>
          <tbody>
            ${tablaClientes}
          </tbody>
        </table>
      `

      await transport.sendMail({
        from: process.env.SMTP_USER || 'reportes@vg.com',
        to: correoDestino,
        subject: `Reporte Mensual V&G - ${datos.mes}`,
        html
      })

      return true
    } catch (err) {
      console.error('Error enviando email mensual:', err.message)
      return false
    }
  }
}
