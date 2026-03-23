const express = require('express');
const router = express.Router();
const { getRegioes, getIrradiacaoRegiao, geocodeEndereco, reverseGeocode } = require('../../services/geoService');

// GET /api/mapa/regioes
router.get('/regioes', (req, res) => {
  res.json(getRegioes());
});

// GET /api/mapa/irradiacao/:regiao
router.get('/irradiacao/:regiao', (req, res) => {
  const data = getIrradiacaoRegiao(req.params.regiao);
  if (!data) {
    return res.status(404).json({ error: 'Regiao nao encontrada.' });
  }
  res.json(data);
});

// GET /api/mapa/geocode?endereco=...
router.get('/geocode', async (req, res) => {
  const { endereco } = req.query;

  if (!endereco || !endereco.trim()) {
    return res.status(400).json({ error: 'Parametro "endereco" e obrigatorio.' });
  }

  try {
    const result = await geocodeEndereco(endereco.trim());

    if (!result) {
      return res.status(404).json({ error: 'Endereco nao encontrado.' });
    }

    res.json(result);
  } catch (err) {
    console.error('Erro geocode:', err.message);
    res.status(500).json({ error: 'Erro ao buscar endereco.' });
  }
});

// GET /api/mapa/reverse?lat=...&lng=...
router.get('/reverse', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Parametros "lat" e "lng" sao obrigatorios.' });
  }

  try {
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));

    if (!result) {
      return res.status(404).json({ error: 'Localizacao nao encontrada.' });
    }

    res.json(result);
  } catch (err) {
    console.error('Erro reverse geocode:', err.message);
    res.status(500).json({ error: 'Erro ao buscar localizacao.' });
  }
});

module.exports = router;
