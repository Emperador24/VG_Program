-- V&G Sistema de Control - Schema Inicial

-- Tabla de usuarios (Administrador, Administración)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'administracion', -- 'administrador' o 'administracion'
    operario_id INTEGER,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de operarios (choferes, operadores)
CREATE TABLE operarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    telefono_whatsapp VARCHAR(20),
    cargo VARCHAR(100),
    fecha_ingreso DATE,
    tipo_pago VARCHAR(20) NOT NULL DEFAULT 'mensual', -- 'diario', 'semanal', 'quincenal', 'mensual'
    monto_pago NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de máquinas y camiones
CREATE TABLE maquinas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- 'vacuum', 'solador', 'batea', 'lowboy', 'camion_350'
    placa_serial VARCHAR(50),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    anio INTEGER,
    estado VARCHAR(50) DEFAULT 'activo', -- 'activo', 'taller', 'parada'
    fecha_compra DATE,
    valor NUMERIC(12, 2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes (crear antes de ubicaciones)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    rif VARCHAR(50),
    contacto VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ubicaciones (campos, pozos, obras)
CREATE TABLE ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cliente_id INTEGER,
    estado_municipio VARCHAR(255),
    coordenadas_lat NUMERIC(10, 8),
    coordenadas_lon NUMERIC(11, 8),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabla de asignaciones (histórico de qué operario trabaja qué máquina en qué ubicación)
CREATE TABLE asignaciones (
    id SERIAL PRIMARY KEY,
    maquina_id INTEGER NOT NULL,
    operario_id INTEGER NOT NULL,
    ubicacion_id INTEGER,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maquina_id) REFERENCES maquinas(id),
    FOREIGN KEY (operario_id) REFERENCES operarios(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id)
);

-- Tabla de categorías de gasto
CREATE TABLE categorias_gasto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL DEFAULT 'operativo', -- 'operativo', 'mantenimiento', 'administrativo'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de gastos
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    maquina_id INTEGER,
    operario_id INTEGER,
    ubicacion_id INTEGER,
    categoria_id INTEGER NOT NULL,
    monto_usd NUMERIC(10, 2) NOT NULL,
    monto_bs NUMERIC(15, 2),
    tasa_diaria NUMERIC(10, 4),
    descripcion TEXT,
    foto_factura_url VARCHAR(500),
    origen VARCHAR(20) DEFAULT 'manual', -- 'whatsapp', 'manual'
    mensaje_original TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'anulado'
    aprobado_por INTEGER,
    creado_por INTEGER NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maquina_id) REFERENCES maquinas(id),
    FOREIGN KEY (operario_id) REFERENCES operarios(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias_gasto(id),
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Tabla de ingresos (facturación)
CREATE TABLE ingresos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    cliente_id INTEGER NOT NULL,
    maquina_id INTEGER NOT NULL,
    ubicacion_id INTEGER,
    concepto VARCHAR(255) NOT NULL,
    cantidad NUMERIC(10, 2), -- horas, días, litros, etc.
    monto_usd NUMERIC(12, 2) NOT NULL,
    monto_bs NUMERIC(15, 2),
    tasa_diaria NUMERIC(10, 4),
    estado_cobro VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'cobrado', 'parcial'
    fecha_cobro DATE,
    creado_por INTEGER NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (maquina_id) REFERENCES maquinas(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Tabla de pagos de nómina
CREATE TABLE pagos_nomina (
    id SERIAL PRIMARY KEY,
    operario_id INTEGER NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    base NUMERIC(12, 2) NOT NULL,
    bonos NUMERIC(10, 2) DEFAULT 0,
    adelantos NUMERIC(10, 2) DEFAULT 0,
    descuentos NUMERIC(10, 2) DEFAULT 0,
    neto NUMERIC(12, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    forma_pago VARCHAR(50) DEFAULT 'efectivo', -- 'efectivo', 'transferencia', 'cheque'
    creado_por INTEGER NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operario_id) REFERENCES operarios(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Tabla de reportes (almacenar reportes generados)
CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'diario', 'semanal', 'mensual'
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    datos JSONB,
    archivo_pdf_url VARCHAR(500),
    archivo_excel_url VARCHAR(500),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_maquina ON gastos(maquina_id);
CREATE INDEX idx_gastos_operario ON gastos(operario_id);
CREATE INDEX idx_gastos_estado ON gastos(estado);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha);
CREATE INDEX idx_ingresos_cliente ON ingresos(cliente_id);
CREATE INDEX idx_ingresos_maquina ON ingresos(maquina_id);
CREATE INDEX idx_asignaciones_maquina ON asignaciones(maquina_id);
CREATE INDEX idx_asignaciones_operario ON asignaciones(operario_id);
CREATE INDEX idx_asignaciones_fecha ON asignaciones(fecha_inicio, fecha_fin);
CREATE INDEX idx_pagos_nomina_operario ON pagos_nomina(operario_id);
CREATE INDEX idx_pagos_nomina_fecha ON pagos_nomina(fecha_pago);

-- Insertar categorías de gasto iniciales
INSERT INTO categorias_gasto (nombre, tipo) VALUES
('Combustible', 'operativo'),
('Aceite y lubricantes', 'operativo'),
('Repuestos', 'mantenimiento'),
('Mantenimiento y reparación', 'mantenimiento'),
('Cauchos', 'mantenimiento'),
('Peajes', 'operativo'),
('Viáticos y comida', 'operativo'),
('Hospedaje', 'operativo'),
('Permisos', 'administrativo'),
('Otros', 'operativo');
