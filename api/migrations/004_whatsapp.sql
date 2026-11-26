-- Tabla de mensajes recibidos por WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_mensajes (
    id SERIAL PRIMARY KEY,
    numero_origen VARCHAR(20) NOT NULL,
    texto TEXT,
    url_imagen VARCHAR(500),
    estado VARCHAR(50) DEFAULT 'recibido', -- recibido, procesado, error
    gasto_id INTEGER,
    fecha_recibido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mensaje_id_wha VARCHAR(100) UNIQUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gasto_id) REFERENCES gastos(id)
);

CREATE INDEX idx_whatsapp_numero ON whatsapp_mensajes(numero_origen);
CREATE INDEX idx_whatsapp_estado ON whatsapp_mensajes(estado);
