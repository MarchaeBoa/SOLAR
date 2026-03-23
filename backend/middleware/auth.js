const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'solarmap-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// Blacklist for logged-out tokens (in-memory, resets on server restart)
const tokenBlacklist = new Set();

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
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
}

function blacklistToken(token) {
  tokenBlacklist.add(token);
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  authorizeRoles,
  blacklistToken,
};
