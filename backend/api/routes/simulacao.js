const express = require('express');
const router = express.Router();
const { calcularSimulacao, calcularPlacasNaArea, calculateSolarProduction } = require('../../services/solarCalculator');

// POST /api/simulacao/calcular
router.post('/calcular', (req, res) => {
  const { areaM2, consumoMensal, tipoTelhado, localizacao } = req.body;

  if (!areaM2 || !consumoMensal) {
    return res.status(400).json({ error: 'Área e consumo mensal são obrigatórios.' });
  }

  const resultado = calcularSimulacao({ areaM2, consumoMensal, tipoTelhado, localizacao });
  res.json(resultado);
});

// POST /api/simulacao/placas
router.post('/placas', (req, res) => {
  const { areaM2, tamanhoPlacaM2, espacamentoPercent, perdasPercent, potenciaPlacaW } = req.body;

  if (!areaM2) {
    return res.status(400).json({ error: 'Área em m² é obrigatória.' });
  }

  const resultado = calcularPlacasNaArea({
    areaM2,
    tamanhoPlacaM2,
    espacamentoPercent,
    perdasPercent,
    potenciaPlacaW,
  });

  if (resultado.error) {
    return res.status(400).json(resultado);
  }

  res.json(resultado);
});

// POST /api/simulacao/producao - Calcula produção de energia solar
router.post('/producao', (req, res) => {
  const { potenciaKWp, localizacao, eficiencia, radiacaoCustom, horasSolCustom } = req.body;

  if (!potenciaKWp) {
    return res.status(400).json({ error: 'Potência em kWp é obrigatória.' });
  }

  const resultado = calculateSolarProduction({
    potenciaKWp,
    localizacao,
    eficiencia,
    radiacaoCustom,
    horasSolCustom,
  });

  if (resultado.error) {
    return res.status(400).json(resultado);
  }

  res.json(resultado);
});

// GET /api/simulacao/localizacoes - Lista regiões disponíveis com dados de radiação
router.get('/localizacoes', (req, res) => {
  const localizacoes = {
    norte: { nome: 'Norte', radiacao: 5.5, horasSol: 5.0 },
    nordeste: { nome: 'Nordeste', radiacao: 5.8, horasSol: 5.8 },
    centro_oeste: { nome: 'Centro-Oeste', radiacao: 5.4, horasSol: 5.2 },
    sudeste: { nome: 'Sudeste', radiacao: 4.8, horasSol: 4.6 },
    sul: { nome: 'Sul', radiacao: 4.3, horasSol: 4.2 },
  };
  res.json(localizacoes);
});

module.exports = router;
