const express = require('express');
const router = express.Router();
const { getDashboardStats, getGeracaoMensal, getProjetosAtivos } = require('../../services/solarCalculator');

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  try {
    res.json(getDashboardStats());
  } catch (err) {
    console.error('Erro em /dashboard/stats:', err.message);
    res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
  }
});

// GET /api/dashboard/geracao-mensal
router.get('/geracao-mensal', (req, res) => {
  try {
    res.json(getGeracaoMensal());
  } catch (err) {
    console.error('Erro em /dashboard/geracao-mensal:', err.message);
    res.status(500).json({ error: 'Erro ao carregar geração mensal.' });
  }
});

// GET /api/dashboard/projetos
router.get('/projetos', (req, res) => {
  try {
    res.json(getProjetosAtivos());
  } catch (err) {
    console.error('Erro em /dashboard/projetos:', err.message);
    res.status(500).json({ error: 'Erro ao carregar projetos.' });
  }
});

module.exports = router;
