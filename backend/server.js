const express = require('express');
const cors = require('cors');

const { getDb } = require('./database/setup');
const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./api/routes/auth');
const dashboardRoutes = require('./api/routes/dashboard');
const simulacaoRoutes = require('./api/routes/simulacao');
const mapaRoutes = require('./api/routes/mapa');
const orcamentoRoutes = require('./api/routes/orcamento');
const kitsRoutes = require('./api/routes/kits');
const regionalRoutes = require('./api/routes/regional');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
getDb();

// Middleware - CORS with allowed origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Body parser with size limit to prevent large payload attacks
app.use(express.json({ limit: '1mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Simple rate limiting for auth endpoints
const rateLimitMap = new Map();
function rateLimit(windowMs, maxRequests) {
  return (req, res, next) => {
    const key = req.ip + req.baseUrl;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, []);
    }

    const timestamps = rateLimitMap.get(key).filter(t => t > windowStart);
    rateLimitMap.set(key, timestamps);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
    }

    timestamps.push(now);
    next();
  };
}

// Clean rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const filtered = timestamps.filter(t => t > now - 900000);
    if (filtered.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, filtered);
    }
  }
}, 300000); // Every 5 minutes

// Public routes (with rate limiting on auth)
app.use('/api/auth', rateLimit(900000, 20), authRoutes); // 20 requests per 15 min

// Protected routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/simulacao', authenticateToken, simulacaoRoutes);
app.use('/api/mapa', authenticateToken, mapaRoutes);
app.use('/api/orcamento', authenticateToken, orcamentoRoutes);
app.use('/api/kits', authenticateToken, kitsRoutes);
app.use('/api/regional', authenticateToken, regionalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SolarMap AI API' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`SolarMap AI API running on port ${PORT}`);
});
