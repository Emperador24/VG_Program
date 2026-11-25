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
