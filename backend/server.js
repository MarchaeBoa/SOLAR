const express = require('express');
const cors = require('cors');

const dashboardRoutes = require('./api/routes/dashboard');
const simulacaoRoutes = require('./api/routes/simulacao');
const mapaRoutes = require('./api/routes/mapa');
const orcamentoRoutes = require('./api/routes/orcamento');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulacao', simulacaoRoutes);
app.use('/api/mapa', mapaRoutes);
app.use('/api/orcamento', orcamentoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SolarMap AI API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SolarMap AI API running on port ${PORT}`);
});
