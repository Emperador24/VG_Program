import axios from 'axios'
import pool from '../config/database.js'

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0'

export const whatsappService = {
  // Configuración
  async getWhatsappConfig() {
    try {
      const result = await pool.query('SELECT valor FROM configuracion WHERE clave = $1', ['whatsapp_numero'])
      return result.rows[0]?.valor || null
    } catch (error) {
      throw new Error(`Error obteniendo config: ${error.message}`)
    }
  },

  async saveWhatsappConfig(numero, phoneNumberId, businessAccountId, accessToken) {
    try {
      await Promise.all([
        pool.query(`INSERT INTO configuracion (clave, valor) VALUES ($1, $2) 
                   ON CONFLICT (clave) DO UPDATE SET valor = $2`,
          ['whatsapp_numero', numero]),
        pool.query(`INSERT INTO configuracion (clave, valor) VALUES ($1, $2) 
                   ON CONFLICT (clave) DO UPDATE SET valor = $2`,
          ['whatsapp_phone_id', phoneNumberId]),
        pool.query(`INSERT INTO configuracion (clave, valor) VALUES ($1, $2) 
                   ON CONFLICT (clave) DO UPDATE SET valor = $2`,
          ['whatsapp_account_id', businessAccountId]),
        pool.query(`INSERT INTO configuracion (clave, valor) VALUES ($1, $2) 
                   ON CONFLICT (clave) DO UPDATE SET valor = $2`,
          ['whatsapp_token', accessToken])
      ])
      return { mensaje: 'Configuración guardada' }
    } catch (error) {
      throw new Error(`Error guardando config: ${error.message}`)
    }
  },

  // Procesar mensaje entrante
  async procesarMensajeEntrante(message) {
    try {
      const { from, text, image, timestamp, message_id } = message

      // Guardar en BD para procesamiento
      const result = await pool.query(
        `INSERT INTO whatsapp_mensajes (numero_origen, texto, url_imagen, estado, fecha_recibido, mensaje_id_wha)
         VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING id`,
        [from, text || null, image?.url || null, 'recibido', message_id]
      )

      return result.rows[0]
    } catch (error) {
      throw new Error(`Error procesando mensaje: ${error.message}`)
    }
  },

  // Descargar imagen desde WhatsApp
  async descargarImagen(imageUrl, accessToken) {
    try {
      const response = await axios.get(imageUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'arraybuffer'
      })
      return response.data
    } catch (error) {
      throw new Error(`Error descargando imagen: ${error.message}`)
    }
  },

  // Crear gasto desde WhatsApp
  async crearGastoDesdeWhatsapp(mensajeId, monto, fotoUrl, operarioNumero) {
    try {
      // Buscar operario por número de WhatsApp
      const operario = await pool.query(
        'SELECT id FROM operarios WHERE telefono_whatsapp = $1',
        [operarioNumero]
      )

      if (operario.rows.length === 0) {
        throw new Error('Operario no encontrado con ese número')
      }

      // Crear gasto
      const result = await pool.query(
        `INSERT INTO gastos (fecha, operario_id, categoria_id, monto_usd, foto_factura_url, origen, estado, creado_por)
         VALUES (CURRENT_DATE, $1, $2, $3, $4, 'whatsapp', 'pendiente', 1) RETURNING id`,
        [operario.rows[0].id, 6, monto, fotoUrl]
      )

      // Marcar mensaje como procesado
      await pool.query(
        'UPDATE whatsapp_mensajes SET estado = $1, gasto_id = $2 WHERE id = $3',
        ['procesado', result.rows[0].id, mensajeId]
      )

      return { gasto_id: result.rows[0].id }
    } catch (error) {
      throw new Error(`Error creando gasto: ${error.message}`)
    }
  },

  // Enviar mensaje de confirmación
  async enviarConfirmacion(numeroDestino, mensaje, accessToken, phoneNumberId) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: numeroDestino,
          type: 'text',
          text: { body: mensaje }
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(`Error enviando confirmación: ${error.message}`)
    }
  }
}
