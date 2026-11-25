-- Rename codigo to placa in maquinas
ALTER TABLE maquinas RENAME COLUMN codigo TO placa;

-- Add rol and salario_diario to operarios
ALTER TABLE operarios ADD COLUMN rol VARCHAR(50) DEFAULT 'operario_principal';
ALTER TABLE operarios ADD COLUMN salario_diario NUMERIC(10, 2);

-- Create trabajadores table (workers - same as operarios but separate)
CREATE TABLE IF NOT EXISTS trabajadores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    telefono_whatsapp VARCHAR(20),
    cargo VARCHAR(100),
    fecha_ingreso DATE,
    salario_diario NUMERIC(10, 2),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tasas BCV históricas
CREATE TABLE IF NOT EXISTS tasa_bcv (
    id SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    tasa_diaria NUMERIC(10, 4) NOT NULL,
    fuente VARCHAR(100) DEFAULT 'manual',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_tasa_bcv_fecha ON tasa_bcv(fecha DESC);

-- Seed: Agregar tasa de hoy (usuario puede editar después)
INSERT INTO tasa_bcv (fecha, tasa_diaria, fuente) 
VALUES (CURRENT_DATE, 2600.00, 'manual')
ON CONFLICT (fecha) DO NOTHING;

