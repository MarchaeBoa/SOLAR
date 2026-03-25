const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const kitsPath = path.join(__dirname, '../../data/kits.json');

// Cache kits in memory to avoid synchronous file I/O on every request
let kitsCache = null;
let kitsCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

function loadKits() {
  const now = Date.now();
  if (kitsCache && (now - kitsCacheTime) < CACHE_TTL) {
    return kitsCache;
  }
  const raw = fs.readFileSync(kitsPath, 'utf-8');
  kitsCache = JSON.parse(raw);
  kitsCacheTime = now;
  return kitsCache;
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
    console.error('Erro ao carregar kits:', err.message);
    res.status(500).json({ error: 'Erro ao carregar kits solares.' });
  }
});

// GET /api/kits/:id — detalhes de um kit
router.get('/:id', (req, res) => {
  try {
    const kits = loadKits();
    const kit = kits.find(k => k.id === parseInt(req.params.id));
    if (!kit) {
      return res.status(404).json({ error: 'Kit não encontrado.' });
    }
    res.json(kit);
  } catch (err) {
    console.error('Erro ao carregar kit:', err.message);
    res.status(500).json({ error: 'Erro ao carregar kit solar.' });
  }
});

// POST /api/kits/comparar — compara kits selecionados
router.post('/comparar', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return res.status(400).json({ error: 'Envie ao menos 2 IDs para comparação.' });
    }

    const kits = loadKits();
    const selecionados = kits.filter(k => ids.includes(k.id));

    if (selecionados.length < 2) {
      return res.status(404).json({ error: 'Kits não encontrados.' });
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
    console.error('Erro ao comparar kits:', err.message);
    res.status(500).json({ error: 'Erro ao comparar kits.' });
  }
});

module.exports = router;
