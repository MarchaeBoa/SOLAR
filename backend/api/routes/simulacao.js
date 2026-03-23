const express = require('express');
const router = express.Router();
const { calcularSimulacao } = require('../../services/solarCalculator');

// POST /api/simulacao/calcular
router.post('/calcular', (req, res) => {
  const { areaM2, consumoMensal, tipoTelhado, localizacao } = req.body;

  if (!areaM2 || !consumoMensal) {
    return res.status(400).json({ error: 'Área e consumo mensal são obrigatórios.' });
  }

  const resultado = calcularSimulacao({ areaM2, consumoMensal, tipoTelhado, localizacao });
  res.json(resultado);
});

module.exports = router;
