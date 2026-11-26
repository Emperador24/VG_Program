export const verifyWebhookToken = (req, res, next) => {
  const token = process.env.WHATSAPP_VERIFY_TOKEN || 'vg_webhook_2024'
  const headerToken = req.headers['x-webhook-token']

  if (headerToken === token) {
    next()
  } else {
    res.status(401).json({ error: 'Token inválido' })
  }
}
