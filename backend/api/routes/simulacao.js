const express = require('express');
const router = express.Router();
const { calcularSimulacao, calcularPlacasNaArea } = require('../../services/solarCalculator');

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

module.exports = router;
