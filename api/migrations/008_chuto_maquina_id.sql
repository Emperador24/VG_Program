-- Cambiar estructura de chuto para guardar ID de máquina asignada
ALTER TABLE maquinas ADD COLUMN chuto_maquina_id INTEGER REFERENCES maquinas(id);

-- Comentario
COMMENT ON COLUMN maquinas.chuto_maquina_id IS 'ID de la máquina que está dentro del chuto (vacuum, batea o lowboy)';

-- Remover columna chuto_tipo antigua si existe
ALTER TABLE maquinas DROP COLUMN IF EXISTS chuto_tipo;
