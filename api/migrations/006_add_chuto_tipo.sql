-- Agregar columna para tipo de chuto (batea, vacuum, lowboy)
ALTER TABLE maquinas ADD COLUMN chuto_tipo VARCHAR(50);

-- Comentario
COMMENT ON COLUMN maquinas.chuto_tipo IS 'Tipo que lleva el chuto: batea, vacuum, lowboy (solo aplica si tipo = chuto)';
