const express = require('express');
const router = express.Router();
const { calcularSimulacao, calcularPlacasNaArea, calculateSolarProduction, calculateFinancialReturn, calculateFinancing } = require('../../services/solarCalculator');

// Helper: validate that a value is a positive number
function isPositiveNumber(val) {
  const num = parseFloat(val);
  return !isNaN(num) && num > 0 && isFinite(num);
}

// POST /api/simulacao/calcular
router.post('/calcular', (req, res) => {
  try {
    const { areaM2, consumoMensal, tipoTelhado, localizacao } = req.body;

    if (!isPositiveNumber(areaM2) || !isPositiveNumber(consumoMensal)) {
      return res.status(400).json({ error: 'Área e consumo mensal devem ser números positivos.' });
    }

    if (parseFloat(areaM2) > 100000) {
      return res.status(400).json({ error: 'Área máxima permitida: 100.000 m².' });
    }

    const resultado = calcularSimulacao({ areaM2, consumoMensal, tipoTelhado, localizacao });
    res.json(resultado);
  } catch (err) {
    console.error('Erro em /simulacao/calcular:', err.message);
    res.status(500).json({ error: 'Erro ao calcular simulação.' });
  }
});

// POST /api/simulacao/placas
router.post('/placas', (req, res) => {
  try {
    const { areaM2, tamanhoPlacaM2, espacamentoPercent, perdasPercent, potenciaPlacaW } = req.body;

    if (!isPositiveNumber(areaM2)) {
      return res.status(400).json({ error: 'Área em m² deve ser um número positivo.' });
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
  } catch (err) {
    console.error('Erro em /simulacao/placas:', err.message);
    res.status(500).json({ error: 'Erro ao calcular placas.' });
  }
});

// POST /api/simulacao/producao - Calcula produção de energia solar
router.post('/producao', (req, res) => {
  try {
    const { potenciaKWp, localizacao, eficiencia, radiacaoCustom, horasSolCustom } = req.body;

    if (!isPositiveNumber(potenciaKWp)) {
      return res.status(400).json({ error: 'Potência em kWp deve ser um número positivo.' });
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
  } catch (err) {
    console.error('Erro em /simulacao/producao:', err.message);
    res.status(500).json({ error: 'Erro ao calcular produção.' });
  }
});

// POST /api/simulacao/retorno-financeiro - Calcula retorno financeiro do sistema solar
router.post('/retorno-financeiro', (req, res) => {
  try {
    const { custoSistema, tarifaEnergia, geracaoMensalKWh, reajusteAnual, vidaUtilAnos } = req.body;

    if (!isPositiveNumber(custoSistema) || !isPositiveNumber(tarifaEnergia) || !isPositiveNumber(geracaoMensalKWh)) {
      return res.status(400).json({ error: 'Custo do sistema, tarifa de energia e geração mensal devem ser números positivos.' });
    }

    const resultado = calculateFinancialReturn({
      custoSistema,
      tarifaEnergia,
      geracaoMensalKWh,
      reajusteAnual,
      vidaUtilAnos,
    });

    if (resultado.error) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (err) {
    console.error('Erro em /simulacao/retorno-financeiro:', err.message);
    res.status(500).json({ error: 'Erro ao calcular retorno financeiro.' });
  }
});

// POST /api/simulacao/financiamento - Simula financiamento e compara com à vista
router.post('/financiamento', (req, res) => {
  try {
    const {
      valorSistema, entrada, taxaJurosMensal, prazoMeses,
      economiaMensal, descontoAVista, vidaUtilAnos,
    } = req.body;

    if (!isPositiveNumber(valorSistema) || !isPositiveNumber(prazoMeses)) {
      return res.status(400).json({
        error: 'Valor do sistema e prazo devem ser números positivos.',
      });
    }

    if (taxaJurosMensal == null || isNaN(parseFloat(taxaJurosMensal)) || parseFloat(taxaJurosMensal) < 0) {
      return res.status(400).json({
        error: 'Taxa de juros mensal deve ser um número >= 0.',
      });
    }

    const resultado = calculateFinancing({
      valorSistema, entrada, taxaJurosMensal, prazoMeses,
      economiaMensal, descontoAVista, vidaUtilAnos,
    });

    if (resultado.error) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (err) {
    console.error('Erro em /simulacao/financiamento:', err.message);
    res.status(500).json({ error: 'Erro ao calcular financiamento.' });
  }
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
