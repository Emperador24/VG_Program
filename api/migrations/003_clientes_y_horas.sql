-- Actualizar trabajadores: agregar tipo_pago
ALTER TABLE trabajadores ADD COLUMN tipo_pago VARCHAR(20) DEFAULT 'mensual';

-- Actualizar operarios: eliminar tipo_pago, agregar solo salario_diario
ALTER TABLE operarios ADD COLUMN salario_diario NUMERIC(10, 2);

-- Tabla: Contratos de clientes (máquinas asignadas a cliente con precios)
CREATE TABLE clientes_contratos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    maquina_id INTEGER NOT NULL,
    monto_hora_dia NUMERIC(10, 2) NOT NULL,
    monto_hora_noche NUMERIC(10, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (maquina_id) REFERENCES maquinas(id),
    UNIQUE(cliente_id, maquina_id, fecha_inicio)
);

-- Tabla: Horas trabajadas (registro de horas por máquina en cliente)
CREATE TABLE horas_trabajadas (
    id SERIAL PRIMARY KEY,
    cliente_contrato_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    horas_trabajadas NUMERIC(10, 2) NOT NULL,
    es_noche BOOLEAN DEFAULT false,
    monto_calculado NUMERIC(12, 2),
    creado_por INTEGER NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_contrato_id) REFERENCES clientes_contratos(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

-- Índices para performance
CREATE INDEX idx_clientes_contratos_cliente ON clientes_contratos(cliente_id);
CREATE INDEX idx_clientes_contratos_maquina ON clientes_contratos(maquina_id);
CREATE INDEX idx_horas_trabajadas_contrato ON horas_trabajadas(cliente_contrato_id);
CREATE INDEX idx_horas_trabajadas_fecha ON horas_trabajadas(fecha);

-- Agregar categoría "Otro" a categorias_gasto
INSERT INTO categorias_gasto (nombre, tipo) VALUES ('Otro', 'operativo') ON CONFLICT DO NOTHING;
