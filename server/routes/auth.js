import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, authMiddleware } from '../auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (String(password).length < 4) {
      return res
        .status(400)
        .json({ error: 'A senha deve ter pelo menos 4 caracteres.' });
    }

    const existing = db
      .prepare('SELECT id FROM users WHERE lower(email) = ?')
      .get(cleanEmail);

    if (existing) {
      return res
        .status(409)
        .json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
    }

    const passwordHash = bcrypt.hashSync(String(password), 10);
    const info = db
      .prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      )
      .run(cleanName, cleanEmail, passwordHash);

    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(info.lastInsertRowid);

    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Informe seu e-mail e senha para entrar.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userRow = db
      .prepare('SELECT * FROM users WHERE lower(email) = ?')
      .get(cleanEmail);

    if (!userRow) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique e-mail e senha.' });
    }

    const valid = bcrypt.compareSync(String(password), userRow.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique e-mail e senha.' });
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      created_at: userRow.created_at,
    };

    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/me
router.put('/me', authMiddleware, (req, res) => {
  try {
    const { name, email } = req.body || {};
    const cleanName = name ? String(name).trim() : req.user.name;
    const cleanEmail = email ? String(email).trim().toLowerCase() : req.user.email;

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({ error: 'Nome e e-mail não podem ficar vazios.' });
    }

    const conflict = db
      .prepare('SELECT id FROM users WHERE lower(email) = ? AND id != ?')
      .get(cleanEmail, req.user.id);
    if (conflict) {
      return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
    }

    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(
      cleanName,
      cleanEmail,
      req.user.id
    );

    const updatedUser = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    const token = signToken(updatedUser);
    return res.json({ user: updatedUser, token });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

export default router;
