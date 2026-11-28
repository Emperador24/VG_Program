-- Agregar columna para tipo de camión (diario, soldador)
ALTER TABLE maquinas ADD COLUMN camion_tipo VARCHAR(50);

-- Comentario
COMMENT ON COLUMN maquinas.camion_tipo IS 'Tipo de camión: diario o soldador (solo aplica si tipo = camion)';
