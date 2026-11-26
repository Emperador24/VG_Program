import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.usuario.rol !== 'administrador' && req.usuario.rol !== 'administracion') {
    return res.status(403).json({ error: 'Acceso solo para administrador' });
  }

  next();
};
