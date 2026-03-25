const regioes = [
  {
    id: 'norte',
    nome: 'Norte',
    irradiacao: 5.5,
    lat: -3.1,
    lng: -60.0,
    estados: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
    descricao: 'Alta irradiação solar com potencial significativo para energia fotovoltaica.',
  },
  {
    id: 'nordeste',
    nome: 'Nordeste',
    irradiacao: 5.8,
    lat: -9.0,
    lng: -38.5,
    estados: ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
    descricao: 'Melhor região do Brasil para energia solar, com irradiação consistente o ano todo.',
  },
  {
    id: 'centro_oeste',
    nome: 'Centro-Oeste',
    irradiacao: 5.4,
    lat: -15.6,
    lng: -49.3,
    estados: ['MT', 'MS', 'GO', 'DF'],
    descricao: 'Excelente potencial solar com grandes áreas planas disponíveis.',
  },
  {
    id: 'sudeste',
    nome: 'Sudeste',
    irradiacao: 4.8,
    lat: -22.0,
    lng: -44.0,
    estados: ['SP', 'RJ', 'MG', 'ES'],
    descricao: 'Bom potencial solar, maior mercado consumidor do país.',
  },
  {
    id: 'sul',
    nome: 'Sul',
    irradiacao: 4.3,
    lat: -27.5,
    lng: -50.5,
    estados: ['PR', 'SC', 'RS'],
    descricao: 'Potencial moderado com variação sazonal significativa.',
  },
];

function getRegioes() {
  return regioes;
}

function getIrradiacaoRegiao(regiaoId) {
  return regioes.find(r => r.id === regiaoId) || null;
}

// Structure to store coordinates for future solar calculations
function createCoordenada({ lat, lng, endereco = null }) {
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    endereco,
    timestamp: new Date().toISOString(),
  };
}

// Find the closest region for a given coordinate
function getRegiaoByCoords(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) {
    return null;
  }

  let closest = null;
  let minDist = Infinity;
  for (const r of regioes) {
    const dist = Math.sqrt((r.lat - latNum) ** 2 + (r.lng - lngNum) ** 2);
    if (dist < minDist) {
      minDist = dist;
      closest = r;
    }
  }
  return closest;
}

// Initialize areas table in the database
function initAreasTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      coordenadas TEXT NOT NULL,
      area_m2 REAL NOT NULL,
      perimetro_m REAL NOT NULL,
      regiao_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

// Save a polygon area
function salvarArea(db, { userId, coordenadas, area_m2, perimetro_m }) {
  const centroLat = coordenadas.reduce((s, c) => s + c.lat, 0) / coordenadas.length;
  const centroLng = coordenadas.reduce((s, c) => s + c.lng, 0) / coordenadas.length;
  const regiao = getRegiaoByCoords(centroLat, centroLng);

  const stmt = db.prepare(`
    INSERT INTO areas (user_id, coordenadas, area_m2, perimetro_m, regiao_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    JSON.stringify(coordenadas),
    area_m2,
    perimetro_m,
    regiao ? regiao.id : null
  );

  return {
    id: result.lastInsertRowid,
    coordenadas,
    area_m2,
    perimetro_m,
    regiao,
    created_at: new Date().toISOString(),
  };
}

// Get areas by user
function getAreasByUser(db, userId) {
  if (!userId) return [];
  const rows = db.prepare('SELECT * FROM areas WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(row => {
    let coordenadas = [];
    try {
      coordenadas = JSON.parse(row.coordenadas);
    } catch {
      console.error(`Invalid JSON in areas.coordenadas for area id=${row.id}`);
    }
    return {
      ...row,
      coordenadas,
      regiao: row.regiao_id ? getIrradiacaoRegiao(row.regiao_id) : null,
    };
  });
}

module.exports = {
  getRegioes,
  getIrradiacaoRegiao,
  createCoordenada,
  getRegiaoByCoords,
  initAreasTable,
  salvarArea,
  getAreasByUser,
};
