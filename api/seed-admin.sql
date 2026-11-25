-- Crear usuario admin si no existe
INSERT INTO usuarios (nombre, correo, contraseña_hash, rol, activo)
SELECT 
  'Administrador',
  'admin@vg.com',
  '$2b$10$TDmRhUYHeGe/vgQJ4zqIQeTAPbul0xakWdbU1mZ0kcROLYyS4ZEOu',
  'administrador',
  true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@vg.com');

-- Verificar
SELECT id, nombre, correo, rol FROM usuarios WHERE correo = 'admin@vg.com';
