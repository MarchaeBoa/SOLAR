const regioes = [
  {
    id: 'norte',
    nome: 'Norte',
    irradiacao: 5.5,
    lat: -3.1190,
    lng: -60.0217,
    estados: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
    descricao: 'Alta irradiacao solar com potencial significativo para energia fotovoltaica.',
  },
  {
    id: 'nordeste',
    nome: 'Nordeste',
    irradiacao: 5.8,
    lat: -12.9714,
    lng: -38.5124,
    estados: ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
    descricao: 'Melhor regiao do Brasil para energia solar, com irradiacao consistente o ano todo.',
  },
  {
    id: 'centro_oeste',
    nome: 'Centro-Oeste',
    irradiacao: 5.4,
    lat: -15.7801,
    lng: -47.9292,
    estados: ['MT', 'MS', 'GO', 'DF'],
    descricao: 'Excelente potencial solar com grandes areas planas disponiveis.',
  },
  {
    id: 'sudeste',
    nome: 'Sudeste',
    irradiacao: 4.8,
    lat: -23.5505,
    lng: -46.6333,
    estados: ['SP', 'RJ', 'MG', 'ES'],
    descricao: 'Bom potencial solar, maior mercado consumidor do pais.',
  },
  {
    id: 'sul',
    nome: 'Sul',
    irradiacao: 4.3,
    lat: -25.4284,
    lng: -49.2733,
    estados: ['PR', 'SC', 'RS'],
    descricao: 'Potencial moderado com variacao sazonal significativa.',
  },
];

function getRegioes() {
  return regioes;
}

function getIrradiacaoRegiao(regiaoId) {
  return regioes.find(r => r.id === regiaoId) || null;
}

// Geocode an address using Nominatim (OpenStreetMap)
async function geocodeEndereco(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&countrycodes=br&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SolarMapAI/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao consultar servico de geocodificacao.');
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display_name: data[0].display_name,
    type: data[0].type,
    importance: data[0].importance,
  };
}

// Reverse geocode: coordinates to address
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SolarMapAI/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao consultar servico de geocodificacao reversa.');
  }

  const data = await response.json();

  if (!data || data.error) {
    return null;
  }

  return {
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lon),
    display_name: data.display_name,
    address: data.address || {},
  };
}

module.exports = {
  getRegioes,
  getIrradiacaoRegiao,
  geocodeEndereco,
  reverseGeocode,
};
