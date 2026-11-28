-- RESET DATABASE - Drop all tables and recreate clean schema
-- This ensures database starts fresh without migration conflicts

-- Drop all tables in correct order (respecting FK constraints)
DROP TABLE IF EXISTS whatsapp_mensajes CASCADE;
DROP TABLE IF EXISTS pagos_nomina CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS ingresos CASCADE;
DROP TABLE IF EXISTS asignaciones CASCADE;
DROP TABLE IF EXISTS tasa_bcv CASCADE;
DROP TABLE IF EXISTS trabajadores CASCADE;
DROP TABLE IF EXISTS operarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS maquinas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS categorias_gasto CASCADE;

-- Create clean schema from scratch
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'administracion',
    operario_id INTEGER,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    telefono_whatsapp VARCHAR(20),
    cargo VARCHAR(100),
    fecha_ingreso DATE,
    tipo_pago VARCHAR(20) NOT NULL DEFAULT 'mensual',
    monto_pago NUMERIC(10, 2) NOT NULL,
    rol VARCHAR(50) DEFAULT 'operario_principal',
    salario_diario NUMERIC(10, 2),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maquinas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    anio INTEGER,
    estado VARCHAR(50) DEFAULT 'parada',
    fecha_compra DATE,
    valor NUMERIC(12, 2),
    camion_tipo VARCHAR(50),
    chuto_maquina_id INTEGER REFERENCES maquinas(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    rif VARCHAR(50),
    contacto VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id),
    estado_municipio VARCHAR(255),
    coordenadas_lat NUMERIC(10, 8),
    coordenadas_lon NUMERIC(11, 8),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE asignaciones (
    id SERIAL PRIMARY KEY,
    maquina_id INTEGER NOT NULL REFERENCES maquinas(id),
    operario_id INTEGER NOT NULL REFERENCES operarios(id),
    ubicacion_id INTEGER REFERENCES ubicaciones(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias_gasto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL DEFAULT 'operativo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    maquina_id INTEGER REFERENCES maquinas(id),
    operario_id INTEGER REFERENCES operarios(id),
    ubicacion_id INTEGER REFERENCES ubicaciones(id),
    categoria_id INTEGER NOT NULL REFERENCES categorias_gasto(id),
    monto_usd NUMERIC(10, 2) NOT NULL,
    monto_bs NUMERIC(15, 2),
    tasa_diaria NUMERIC(10, 4),
    descripcion TEXT,
    foto_factura_url VARCHAR(500),
    origen VARCHAR(20) DEFAULT 'manual',
    mensaje_original TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    aprobado_por INTEGER REFERENCES usuarios(id),
    creado_por INTEGER NOT NULL REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingresos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    maquina_id INTEGER NOT NULL REFERENCES maquinas(id),
    ubicacion_id INTEGER REFERENCES ubicaciones(id),
    concepto VARCHAR(255) NOT NULL,
    cantidad NUMERIC(10, 2),
    monto_usd NUMERIC(12, 2) NOT NULL,
    monto_bs NUMERIC(15, 2),
    tasa_diaria NUMERIC(10, 4),
    estado_cobro VARCHAR(20) DEFAULT 'pendiente',
    fecha_cobro DATE,
    creado_por INTEGER NOT NULL REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagos_nomina (
    id SERIAL PRIMARY KEY,
    operario_id INTEGER NOT NULL REFERENCES operarios(id),
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    base NUMERIC(12, 2) NOT NULL,
    deduccion NUMERIC(12, 2) DEFAULT 0,
    adelanto NUMERIC(12, 2) DEFAULT 0,
    neto NUMERIC(12, 2),
    fecha_pago DATE,
    metodo_pago VARCHAR(50),
    creado_por INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    periodo_inicio DATE,
    periodo_fin DATE,
    datos TEXT,
    correo_destino VARCHAR(255),
    enviado_a_correo BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasa_bcv (
    id SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL,
    tasa_diaria NUMERIC(10, 4) NOT NULL,
    fuente VARCHAR(100) DEFAULT 'manual',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trabajadores (
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

CREATE TABLE whatsapp_mensajes (
    id SERIAL PRIMARY KEY,
    telefono_origen VARCHAR(20) NOT NULL,
    operario_id INTEGER REFERENCES operarios(id),
    mensaje_texto TEXT,
    foto_url VARCHAR(500),
    gasto_creado_id INTEGER REFERENCES gastos(id),
    procesado BOOLEAN DEFAULT false,
    error_procesamiento TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_tasa_bcv_fecha ON tasa_bcv(fecha DESC);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX idx_maquinas_codigo ON maquinas(codigo);
CREATE INDEX idx_operarios_cedula ON operarios(cedula);

-- Insert seed data - seed BCV rate for today
INSERT INTO tasa_bcv (fecha, tasa_diaria, fuente) 
VALUES (CURRENT_DATE, 2600.00, 'manual')
ON CONFLICT (fecha) DO NOTHING;
