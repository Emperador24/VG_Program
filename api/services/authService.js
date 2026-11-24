import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export const authService = {
  async register(nombre, correo, contraseña, rol = 'administracion') {
    try {
      const existingUser = await pool.query(
        'SELECT id FROM usuarios WHERE correo = $1',
        [correo]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('El correo ya está registrado');
      }

      const contraseña_hash = await bcrypt.hash(contraseña, 10);

      const result = await pool.query(
        'INSERT INTO usuarios (nombre, correo, contraseña_hash, rol, activo) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, rol',
        [nombre, correo, contraseña_hash, rol, true]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  },

  async login(correo, contraseña) {
    try {
      const result = await pool.query(
        'SELECT id, nombre, correo, contraseña_hash, rol, activo FROM usuarios WHERE correo = $1',
        [correo]
      );

      if (result.rows.length === 0) {
        throw new Error('Correo o contraseña incorrectos');
      }

      const usuario = result.rows[0];

      if (!usuario.activo) {
        throw new Error('Usuario inactivo');
      }

      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña_hash);

      if (!contraseñaValida) {
        throw new Error('Correo o contraseña incorrectos');
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          correo: usuario.correo,
          rol: usuario.rol,
          nombre: usuario.nombre,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      const { contraseña_hash, ...usuarioSinHash } = usuario;

      return {
        token,
        usuario: usuarioSinHash,
      };
    } catch (error) {
      throw new Error(`Error en login: ${error.message}`);
    }
  },

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  },

  async refreshToken(usuarioId) {
    try {
      const result = await pool.query(
        'SELECT id, nombre, correo, rol FROM usuarios WHERE id = $1 AND activo = true',
        [usuarioId]
      );

      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = result.rows[0];

      const token = jwt.sign(
        {
          id: usuario.id,
          correo: usuario.correo,
          rol: usuario.rol,
          nombre: usuario.nombre,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      return {
        token,
        usuario,
      };
    } catch (error) {
      throw new Error(`Error en refresh: ${error.message}`);
    }
  },

  async changePassword(usuarioId, contraseñaActual, contraseñaNueva) {
    try {
      const result = await pool.query(
        'SELECT contraseña_hash FROM usuarios WHERE id = $1',
        [usuarioId]
      );

      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const usuario = result.rows[0];

      const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.contraseña_hash);

      if (!contraseñaValida) {
        throw new Error('Contraseña actual incorrecta');
      }

      const contraseña_hash = await bcrypt.hash(contraseñaNueva, 10);

      await pool.query(
        'UPDATE usuarios SET contraseña_hash = $1, actualizado_en = NOW() WHERE id = $2',
        [contraseña_hash, usuarioId]
      );

      return { mensaje: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  },
};
