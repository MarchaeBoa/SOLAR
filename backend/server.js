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

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
getDb();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/simulacao', authenticateToken, simulacaoRoutes);
app.use('/api/mapa', authenticateToken, mapaRoutes);
app.use('/api/orcamento', authenticateToken, orcamentoRoutes);
app.use('/api/kits', authenticateToken, kitsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SolarMap AI API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SolarMap AI API running on port ${PORT}`);
});
