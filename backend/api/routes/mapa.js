const express = require('express');
const router = express.Router();
const { getRegioes, getIrradiacaoRegiao, getRegiaoByCoordinates } = require('../../services/geoService');

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

// GET /api/mapa/coordenadas?lat=XX&lng=YY
router.get('/coordenadas', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios.' });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Coordenadas inválidas.' });
  }

  const regiao = getRegiaoByCoordinates(latitude, longitude);
  res.json({
    coordenadas: { lat: latitude, lng: longitude },
    regiao: regiao || null,
  });
});

module.exports = router;
