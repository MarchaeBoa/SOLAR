const express = require('express');
const router = express.Router();
const { getDashboardStats, getGeracaoMensal, getProjetosAtivos } = require('../../services/solarCalculator');

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  res.json(getDashboardStats());
});

// GET /api/dashboard/geracao-mensal
router.get('/geracao-mensal', (req, res) => {
  res.json(getGeracaoMensal());
});

// GET /api/dashboard/projetos
router.get('/projetos', (req, res) => {
  res.json(getProjetosAtivos());
});

module.exports = router;
