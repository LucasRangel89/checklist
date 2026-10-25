import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'revalida-tracker-secret-key-2026-inep-osce';
const JWT_EXPIRES_IN = '30d';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação inválido.' });
  }

  try {
    const payload = verifyToken(token);
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado ou sessão expirada.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}
