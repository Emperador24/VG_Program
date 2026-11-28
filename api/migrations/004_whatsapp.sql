-- Tabla de mensajes recibidos por WhatsApp
-- (Already created in migration 009, so just ensure indexes exist)
DROP INDEX IF EXISTS idx_whatsapp_numero;
DROP INDEX IF EXISTS idx_whatsapp_estado;
CREATE INDEX IF NOT EXISTS idx_whatsapp_numero ON whatsapp_mensajes(numero_origen);
CREATE INDEX IF NOT EXISTS idx_whatsapp_estado ON whatsapp_mensajes(procesado);
