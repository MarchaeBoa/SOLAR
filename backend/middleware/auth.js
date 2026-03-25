const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT_SECRET must be set via environment variable in production
// In development, generate a random secret per server instance (safer than hardcoded)
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  console.warn('WARNING: JWT_SECRET not set. Using random secret (tokens will invalidate on restart).');
  return crypto.randomBytes(64).toString('hex');
})();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Blacklist for logged-out tokens (in-memory)
// Note: In production, use Redis or database for persistence across restarts
const tokenBlacklist = new Set();

// Periodically clean expired tokens from blacklist to prevent memory leak
setInterval(() => {
  for (const token of tokenBlacklist) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      tokenBlacklist.delete(token);
    }
  }
}, 60 * 60 * 1000); // Every hour

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
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
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
}

function blacklistToken(token) {
  if (token) {
    tokenBlacklist.add(token);
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  authorizeRoles,
  blacklistToken,
};
