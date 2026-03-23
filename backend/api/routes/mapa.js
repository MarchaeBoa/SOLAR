const express = require('express');
const router = express.Router();
const { getRegioes, getIrradiacaoRegiao } = require('../../services/geoService');

// GET /api/mapa/regioes
router.get('/regioes', (req, res) => {
  res.json(getRegioes());
});

// GET /api/mapa/irradiacao/:regiao
router.get('/irradiacao/:regiao', (req, res) => {
  const data = getIrradiacaoRegiao(req.params.regiao);
  if (!data) {
    return res.status(404).json({ error: 'Região não encontrada.' });
  }
  res.json(data);
});

module.exports = router;
