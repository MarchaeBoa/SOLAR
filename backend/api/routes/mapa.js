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

// Helper: validate lat/lng ranges
function isValidLatLng(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  return !isNaN(latNum) && !isNaN(lngNum) &&
    latNum >= -90 && latNum <= 90 &&
    lngNum >= -180 && lngNum <= 180 &&
    isFinite(latNum) && isFinite(lngNum);
}

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

  if (!isValidLatLng(lat, lng)) {
    return res.status(400).json({ error: 'Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180.' });
  }

  const coordenada = createCoordenada({ lat, lng, endereco });
  const regiao = getRegiaoByCoords(coordenada.lat, coordenada.lng);

  res.json({
    coordenada,
    regiao,
    message: 'Coordenada recebida.',
  });
});

// GET /api/mapa/regiao-por-coords?lat=X&lng=Y — find region by coordinates
router.get('/regiao-por-coords', (req, res) => {
  const { lat, lng } = req.query;

  if (lat == null || lng == null) {
    return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios.' });
  }

  if (!isValidLatLng(lat, lng)) {
    return res.status(400).json({ error: 'Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180.' });
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

  // Validate all coordinates in polygon
  for (const coord of coordenadas) {
    if (!coord || !isValidLatLng(coord.lat, coord.lng)) {
      return res.status(400).json({ error: 'Todas as coordenadas devem ter lat/lng válidos.' });
    }
  }

  try {
    const userId = req.user.id;
    const area = salvarArea(db, { userId, coordenadas, area_m2, perimetro_m });
    res.json({
      ...area,
      message: 'Área salva com sucesso.',
    });
  } catch (err) {
    console.error('Erro ao salvar área:', err.message);
    res.status(500).json({ error: 'Erro ao salvar área.' });
  }
});

// GET /api/mapa/areas — get user's saved areas
router.get('/areas', (req, res) => {
  try {
    const userId = req.user.id;
    const areas = getAreasByUser(db, userId);
    res.json(areas);
  } catch (err) {
    console.error('Erro ao buscar áreas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar áreas.' });
  }
});

module.exports = router;
