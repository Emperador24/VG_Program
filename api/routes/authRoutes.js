import express from 'express';
import { authService } from '../services/authService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const usuario = await authService.register(nombre, correo, contraseña, rol);
    res.status(201).json({ mensaje: 'Usuario registrado', usuario });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const { token, usuario } = await authService.login(correo, contraseña);
    res.json({ token, usuario });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const { token, usuario } = await authService.refreshToken(req.usuario.id);
    res.json({ token, usuario });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { contraseñaActual, contraseñaNueva } = req.body;

    if (!contraseñaActual || !contraseñaNueva) {
      return res.status(400).json({ error: 'Ambas contraseñas son requeridas' });
    }

    const resultado = await authService.changePassword(
      req.usuario.id,
      contraseñaActual,
      contraseñaNueva
    );

    res.json(resultado);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json(req.usuario);
});

export default router;
