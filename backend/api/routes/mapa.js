const express = require('express');
const router = express.Router();
const { getRegioes, getIrradiacaoRegiao, getRegiaoByCoordinates } = require('../../services/geoService');
const { calcularPlacasNaArea } = require('../../services/solarCalculator');
const { getDb } = require('../../database/setup');

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

// POST /api/mapa/areas - Save a drawn area
router.post('/areas', (req, res) => {
  const { nome, coordenadas, area_m2, perimetro_m } = req.body;

  if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 3) {
    return res.status(400).json({ error: 'Coordenadas inválidas. Mínimo 3 pontos.' });
  }

  if (!area_m2 || area_m2 <= 0) {
    return res.status(400).json({ error: 'Área inválida.' });
  }

  try {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO areas (user_id, nome, coordenadas, area_m2, perimetro_m) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      req.user.id,
      nome || 'Área selecionada',
      JSON.stringify(coordenadas),
      area_m2,
      perimetro_m || 0
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      nome,
      area_m2,
      perimetro_m,
      coordenadas,
    });
  } catch (err) {
    console.error('Erro ao salvar área:', err);
    res.status(500).json({ error: 'Erro interno ao salvar área.' });
  }
});

// GET /api/mapa/areas - List saved areas for user
router.get('/areas', (req, res) => {
  try {
    const db = getDb();
    const areas = db.prepare('SELECT * FROM areas WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(areas.map(a => ({ ...a, coordenadas: JSON.parse(a.coordenadas) })));
  } catch (err) {
    console.error('Erro ao listar áreas:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// DELETE /api/mapa/areas/:id
router.delete('/areas/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM areas WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Área não encontrada.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar área:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/mapa/calcular-placas - Calculate panels that fit in an area
router.post('/calcular-placas', (req, res) => {
  const { area_m2 } = req.body;

  if (!area_m2 || parseFloat(area_m2) <= 0) {
    return res.status(400).json({ error: 'Área em m² é obrigatória e deve ser positiva.' });
  }

  const resultado = calcularPlacasNaArea(area_m2);
  if (!resultado) {
    return res.status(400).json({ error: 'Não foi possível calcular.' });
  }

  res.json(resultado);
});

module.exports = router;
