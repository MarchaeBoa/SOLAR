const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../../database/setup');
const {
  generateToken,
  createSession,
  hashToken,
  authenticateToken,
  authorizeRoles,
  blacklistToken,
} = require('../../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const allowedRoles = ['usuario', 'consultor'];
    const userRole = allowedRoles.includes(role) ? role : 'usuario';

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hash, userRole);

    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = generateToken(user);

    // Create session
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    createSession(db, { userId: user.id, token, ip, userAgent });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    // Create session
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    createSession(db, { userId: user.id, token, ip, userAgent });

    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  blacklistToken(req.token);
  res.json({ message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/sessions - List user's sessions
router.get('/sessions', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const sessions = db.prepare(`
      SELECT id, ip_address, user_agent, is_active, created_at, expires_at, last_activity
      FROM sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.id);

    const currentHash = req.tokenHash;
    const enriched = sessions.map(s => {
      const tokenHash = db.prepare('SELECT token_hash FROM sessions WHERE id = ?').get(s.id);
      return {
        ...s,
        is_current: tokenHash?.token_hash === currentHash,
        is_expired: new Date(s.expires_at) < new Date(),
      };
    });

    res.json({ sessions: enriched });
  } catch (err) {
    console.error('Sessions error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/session-info - Current session info
router.get('/session-info', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const session = db.prepare(`
      SELECT id, ip_address, user_agent, is_active, created_at, expires_at, last_activity
      FROM sessions
      WHERE token_hash = ?
    `).get(req.tokenHash);

    if (!session) {
      return res.json({
        session: null,
        token_exp: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null,
      });
    }

    res.json({
      session: {
        ...session,
        is_current: true,
      },
      token_exp: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null,
    });
  } catch (err) {
    console.error('Session info error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/auth/sessions/:id - Revoke a specific session
router.delete('/sessions/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(
      req.params.id,
      req.user.id
    );

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    db.prepare('UPDATE sessions SET is_active = 0 WHERE id = ?').run(session.id);

    res.json({ message: 'Sessão encerrada com sucesso' });
  } catch (err) {
    console.error('Revoke session error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/sessions/revoke-all - Revoke all sessions except current
router.post('/sessions/revoke-all', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare(`
      UPDATE sessions SET is_active = 0
      WHERE user_id = ? AND token_hash != ? AND is_active = 1
    `).run(req.user.id, req.tokenHash);

    res.json({
      message: 'Todas as outras sessões foram encerradas',
      revoked: result.changes,
    });
  } catch (err) {
    console.error('Revoke all sessions error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/users (admin only)
router.get('/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const db = getDb();
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
