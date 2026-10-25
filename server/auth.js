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
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const payload = verifyToken(token);
      const user = db
        .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
        .get(payload.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // Fall back to default local user below
    }
  }

  // Fallback to default local user so the app works without requiring login/password
  const defaultUser = db
    .prepare('SELECT id, name, email, created_at FROM users ORDER BY id ASC LIMIT 1')
    .get();

  req.user = defaultUser || {
    id: 1,
    name: 'Dra. Ana Beatriz',
    email: 'demo@revalida.app',
  };
  next();
}
