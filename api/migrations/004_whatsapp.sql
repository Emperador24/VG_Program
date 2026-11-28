-- WhatsApp messaging table setup
-- (Already created in migration 009, so just ensure indexes exist)

-- Drop old indexes if they exist (safe cleanup)
DROP INDEX IF EXISTS idx_whatsapp_numero;
DROP INDEX IF EXISTS idx_whatsapp_estado;

-- Create indexes (table already exists from 009)
-- These are safe to create even if they already exist
CREATE INDEX IF NOT EXISTS idx_whatsapp_numero ON whatsapp_mensajes(telefono_origen);
CREATE INDEX IF NOT EXISTS idx_whatsapp_estado ON whatsapp_mensajes(procesado);
