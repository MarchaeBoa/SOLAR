const express = require('express');
const router = express.Router();
const { getDb } = require('../../database/setup');
const {
  getRegioes,
  getIrradiacaoRegiao,
  createCoordenada,
  getRegiaoByCoords,
  initAreasTable,
  salvarArea,
  getAreasByUser,
} = require('../../services/geoService');

// Initialize areas table on module load
const db = getDb();
initAreasTable(db);

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

// POST /api/mapa/coordenada — store a coordinate for future calculations
router.post('/coordenada', (req, res) => {
  const { lat, lng, endereco } = req.body;

  if (lat == null || lng == null) {
    return res.status(400).json({ error: 'Latitude e longitude são obrigatórios.' });
  }

  const coordenada = createCoordenada({ lat, lng, endereco });
  const regiao = getRegiaoByCoords(coordenada.lat, coordenada.lng);

  res.json({
    coordenada,
    regiao,
    message: 'Coordenada recebida. Cálculo solar será implementado em breve.',
  });
});

// GET /api/mapa/regiao-por-coords?lat=X&lng=Y — find region by coordinates
router.get('/regiao-por-coords', (req, res) => {
  const { lat, lng } = req.query;

  if (lat == null || lng == null) {
    return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios.' });
  }

  const regiao = getRegiaoByCoords(parseFloat(lat), parseFloat(lng));
  res.json(regiao);
});

// POST /api/mapa/area — save a polygon area drawn on the map
router.post('/area', (req, res) => {
  const { coordenadas, area_m2, perimetro_m } = req.body;

  if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 3) {
    return res.status(400).json({ error: 'Polígono precisa de pelo menos 3 coordenadas.' });
  }

  if (area_m2 == null || perimetro_m == null) {
    return res.status(400).json({ error: 'Área e perímetro são obrigatórios.' });
  }

  try {
    const userId = req.user ? req.user.id : null;
    const area = salvarArea(db, { userId, coordenadas, area_m2, perimetro_m });
    res.json({
      ...area,
      message: 'Área salva com sucesso.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar área.' });
  }
});

// GET /api/mapa/areas — get user's saved areas
router.get('/areas', (req, res) => {
  const userId = req.user ? req.user.id : null;
  const areas = getAreasByUser(db, userId);
  res.json(areas);
});

module.exports = router;
