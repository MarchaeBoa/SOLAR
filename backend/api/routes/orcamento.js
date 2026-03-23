const express = require('express');
const router = express.Router();
const { calcularTotal } = require('../../utils/helpers');

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

// GET /api/orcamento/produtos
router.get('/produtos', (req, res) => {
  res.json(catalogoProdutos);
});

// POST /api/orcamento/calcular
router.post('/calcular', (req, res) => {
  const { itens, desconto = 0 } = req.body;

  if (!itens || !Array.isArray(itens)) {
    return res.status(400).json({ error: 'Lista de itens é obrigatória.' });
  }

  const resultado = calcularTotal(itens, desconto);
  res.json(resultado);
});

module.exports = router;
