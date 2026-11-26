import express from 'express'
import { verifyWebhookToken } from '../middleware/whatsappMiddleware.js'
import { whatsappService } from '../services/whatsappService.js'

const router = express.Router()

// Webhook para recibir mensajes de WhatsApp
router.post('/webhook', verifyWebhookToken, async (req, res) => {
  try {
    const { entry } = req.body

    if (!entry) {
      return res.status(200).json({ status: 'ok' })
    }

    for (const e of entry) {
      const changes = e.changes?.[0]
      const messages = changes?.value?.messages

      if (messages && messages.length > 0) {
        for (const message of messages) {
          const { from, text, image, timestamp, id } = message

          // Procesar mensaje
          const resultado = await whatsappService.procesarMensajeEntrante({
            from,
            text,
            image,
            timestamp,
            message_id: id
          })

          // Si hay texto con monto, procesar
          if (text && image?.url) {
            const monto = extraerMonto(text)
            if (monto) {
              await whatsappService.crearGastoDesdeWhatsapp(
                resultado.id,
                monto,
                image.url,
                from
              )

              // Enviar confirmación
              const config = await Promise.all([
                obtenerConfig('whatsapp_token'),
                obtenerConfig('whatsapp_phone_id')
              ])

              await whatsappService.enviarConfirmacion(
                from,
                `✓ Gasto de $${monto} USD recibido\n📸 Foto de factura almacenada\nEstado: Pendiente de aprobación`,
                config[0],
                config[1]
              )
            }
          }
        }
      }
    }

    res.status(200).json({ status: 'received' })
  } catch (error) {
    console.error('Error en webhook:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET para verificación de webhook
router.get('/webhook', (req, res) => {
  const token = process.env.WHATSAPP_VERIFY_TOKEN || 'vg_webhook_2024'
  const mode = req.query['hub.mode']
  const challenge = req.query['hub.challenge']
  const verify_token = req.query['hub.verify_token']

  if (mode === 'subscribe' && verify_token === token) {
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Forbidden')
  }
})

// Guardar configuración de WhatsApp
router.post('/config', async (req, res) => {
  try {
    const { numero, phoneNumberId, businessAccountId, accessToken } = req.body
    
    if (!numero || !phoneNumberId || !accessToken) {
      return res.status(400).json({ error: 'Faltan parámetros' })
    }

    await whatsappService.saveWhatsappConfig(numero, phoneNumberId, businessAccountId, accessToken)
    res.json({ mensaje: 'Configuración guardada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Función auxiliar para extraer monto
function extraerMonto(texto) {
  const regex = /[\$]?([\d,.]+)/
  const match = texto.match(regex)
  return match ? parseFloat(match[1].replace(',', '.')) : null
}

// Función auxiliar para obtener config
async function obtenerConfig(clave) {
  const pool = (await import('../config/database.js')).default
  const result = await pool.query('SELECT valor FROM configuracion WHERE clave = $1', [clave])
  return result.rows[0]?.valor || null
}

export default router
