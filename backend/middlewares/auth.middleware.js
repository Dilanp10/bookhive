// middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';

/**
 * Middleware que verifica la validez de un JWT en la cabecera Authorization.
 * Espera la cabecera en formato: "Bearer <token>"
 */
export function verifyToken(req, res, next) {
  // Obtener la cabecera Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // Extraer el token, asumiendo formato "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token malformado' });
  }
  const token = parts[1];

  try {
    // Verificar y decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Inyectar los datos decodificados en req.user para rutas protegidas
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}