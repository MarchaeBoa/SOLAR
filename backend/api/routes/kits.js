const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const kitsPath = path.join(__dirname, '../../data/kits.json');

function loadKits() {
  const raw = fs.readFileSync(kitsPath, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/kits — lista todos os kits
router.get('/', (req, res) => {
  try {
    let kits = loadKits();

    // Filtro por categoria
    const { categoria } = req.query;
    if (categoria) {
      kits = kits.filter(k => k.categoria === categoria);
    }

    res.json({ kits, total: kits.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar kits solares' });
  }
});

// GET /api/kits/:id — detalhes de um kit
router.get('/:id', (req, res) => {
  try {
    const kits = loadKits();
    const kit = kits.find(k => k.id === parseInt(req.params.id));
    if (!kit) {
      return res.status(404).json({ error: 'Kit não encontrado' });
    }
    res.json(kit);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar kit solar' });
  }
});

// POST /api/kits/comparar — compara kits selecionados
router.post('/comparar', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({ error: 'Envie ao menos 2 IDs para comparação' });
    }

    const kits = loadKits();
    const selecionados = kits.filter(k => ids.includes(k.id));

    if (selecionados.length < 2) {
      return res.status(404).json({ error: 'Kits não encontrados' });
    }

    // Calcula métricas comparativas
    const comparativo = {
      kits: selecionados,
      melhor_eficiencia: selecionados.reduce((a, b) => a.eficiencia > b.eficiencia ? a : b).nome,
      melhor_preco: selecionados.reduce((a, b) => a.preco < b.preco ? a : b).nome,
      melhor_payback: selecionados.reduce((a, b) => a.payback_anos < b.payback_anos ? a : b).nome,
      maior_potencia: selecionados.reduce((a, b) => a.potencia_kwp > b.potencia_kwp ? a : b).nome,
    };

    res.json(comparativo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao comparar kits' });
  }
});

module.exports = router;
