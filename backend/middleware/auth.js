const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'solarmap-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// Blacklist for logged-out tokens (in-memory, resets on server restart)
const tokenBlacklist = new Set();

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function createSession(db, { userId, token, ip, userAgent }) {
  const hash = hashToken(token);
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000).toISOString();

  db.prepare(`
    INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, is_active, expires_at)
    VALUES (?, ?, ?, ?, 1, ?)
  `).run(userId, hash, ip || 'unknown', userAgent || 'unknown', expiresAt);

  return hash;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token invalidado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    req.tokenHash = hashToken(token);

    // Update last_activity for this session
    const { getDb } = require('../database/setup');
    const db = getDb();
    const session = db.prepare('SELECT id, is_active FROM sessions WHERE token_hash = ?').get(req.tokenHash);
    if (session && !session.is_active) {
      return res.status(401).json({ error: 'Sessão encerrada' });
    }
    if (session) {
      db.prepare('UPDATE sessions SET last_activity = datetime(\'now\') WHERE id = ?').run(session.id);
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
}

function blacklistToken(token) {
  tokenBlacklist.add(token);

  // Also deactivate session in DB
  const { getDb } = require('../database/setup');
  const db = getDb();
  const hash = hashToken(token);
  db.prepare('UPDATE sessions SET is_active = 0 WHERE token_hash = ?').run(hash);
}

module.exports = {
  JWT_SECRET,
  generateToken,
  createSession,
  hashToken,
  authenticateToken,
  authorizeRoles,
  blacklistToken,
};
