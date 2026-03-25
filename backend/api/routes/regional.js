const express = require('express');
const router = express.Router();
const regionalPricing = require('../../services/regionalPricing');
const kits = require('../../data/kits.json');

// GET /api/regional/countries - Lista todos os países ativos
router.get('/countries', (req, res) => {
  const countries = regionalPricing.getAllCountries();
  res.json(countries);
});

// GET /api/regional/countries/:code - Dados de um país específico
router.get('/countries/:code', (req, res) => {
  const country = regionalPricing.getCountryByCode(req.params.code);
  if (!country) {
    return res.status(404).json({ error: 'País não encontrado.' });
  }
  res.json(country);
});

// GET /api/regional/regions - Países agrupados por região
router.get('/regions', (req, res) => {
  const regions = regionalPricing.getCountriesByRegion();
  res.json(regions);
});

// GET /api/regional/average-cost - Custo médio por região
router.get('/average-cost', (req, res) => {
  const averages = regionalPricing.getAverageCostByRegion();
  res.json(averages);
});

// GET /api/regional/price/:countryCode - Ajustar preço para região
router.get('/price/:countryCode', (req, res) => {
  const { value } = req.query;
  if (!value || isNaN(value)) {
    return res.status(400).json({ error: 'Parâmetro "value" (preço base em BRL) é obrigatório.' });
  }
  const result = regionalPricing.adjustPrice(parseFloat(value), req.params.countryCode);
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// GET /api/regional/kits/:countryCode - Kits com preços regionais
router.get('/kits/:countryCode', (req, res) => {
  const { categoria } = req.query;
  let filteredKits = kits;
  if (categoria) {
    filteredKits = kits.filter(k => k.categoria === categoria);
  }
  const result = regionalPricing.adjustKitPrices(filteredKits, req.params.countryCode);
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// GET /api/regional/products/:countryCode - Catálogo com preços regionais
router.get('/products/:countryCode', (req, res) => {
  const catalogoProdutos = [
    { id: 1, nome: 'Painel Solar 550W Monocristalino', categoria: 'Painéis', preco: 1150, unidade: 'un' },
    { id: 2, nome: 'Painel Solar 450W Policristalino', categoria: 'Painéis', preco: 890, unidade: 'un' },
    { id: 3, nome: 'Inversor String 5kW', categoria: 'Inversores', preco: 4200, unidade: 'un' },
    { id: 4, nome: 'Inversor String 10kW', categoria: 'Inversores', preco: 7800, unidade: 'un' },
    { id: 5, nome: 'Inversor Microinversor 1.5kW', categoria: 'Inversores', preco: 2400, unidade: 'un' },
    { id: 6, nome: 'Estrutura Telhado Cerâmico (kit)', categoria: 'Estrutura', preco: 320, unidade: 'kit' },
    { id: 7, nome: 'Estrutura Telhado Metálico (kit)', categoria: 'Estrutura', preco: 280, unidade: 'kit' },
    { id: 8, nome: 'Cabo Solar 6mm (metro)', categoria: 'Cabos', preco: 12, unidade: 'm' },
    { id: 9, nome: 'String Box CC/CA', categoria: 'Proteção', preco: 450, unidade: 'un' },
    { id: 10, nome: 'Serviço de Instalação', categoria: 'Serviço', preco: 3500, unidade: 'un' },
  ];

  const result = regionalPricing.adjustProductPrices(catalogoProdutos, req.params.countryCode);
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// GET /api/regional/simulation-params/:countryCode - Parâmetros de simulação regionais
router.get('/simulation-params/:countryCode', (req, res) => {
  const params = regionalPricing.getRegionalSimulationParams(req.params.countryCode);
  if (!params) {
    return res.status(404).json({ error: 'País não encontrado.' });
  }
  res.json(params);
});

module.exports = router;
