-- Add ayudante_id column to asignaciones table
ALTER TABLE asignaciones
ADD COLUMN IF NOT EXISTS ayudante_id INTEGER REFERENCES operarios(id);
