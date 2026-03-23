const regioes = [
  {
    id: 'norte',
    nome: 'Norte',
    irradiacao: 5.5,
    estados: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
    descricao: 'Alta irradiação solar com potencial significativo para energia fotovoltaica.',
    coordenadas: { lat: -3.1, lng: -60.0 },
  },
  {
    id: 'nordeste',
    nome: 'Nordeste',
    irradiacao: 5.8,
    estados: ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
    descricao: 'Melhor região do Brasil para energia solar, com irradiação consistente o ano todo.',
    coordenadas: { lat: -8.0, lng: -37.0 },
  },
  {
    id: 'centro_oeste',
    nome: 'Centro-Oeste',
    irradiacao: 5.4,
    estados: ['MT', 'MS', 'GO', 'DF'],
    descricao: 'Excelente potencial solar com grandes áreas planas disponíveis.',
    coordenadas: { lat: -15.6, lng: -49.5 },
  },
  {
    id: 'sudeste',
    nome: 'Sudeste',
    irradiacao: 4.8,
    estados: ['SP', 'RJ', 'MG', 'ES'],
    descricao: 'Bom potencial solar, maior mercado consumidor do país.',
    coordenadas: { lat: -20.5, lng: -44.0 },
  },
  {
    id: 'sul',
    nome: 'Sul',
    irradiacao: 4.3,
    estados: ['PR', 'SC', 'RS'],
    descricao: 'Potencial moderado com variação sazonal significativa.',
    coordenadas: { lat: -27.5, lng: -50.5 },
  },
];

function getRegioes() {
  return regioes;
}

function getIrradiacaoRegiao(regiaoId) {
  return regioes.find(r => r.id === regiaoId) || null;
}

function getRegiaoByCoordinates(lat, lng) {
  // Approximate region lookup based on latitude ranges
  if (lat > -5) return regioes.find(r => r.id === 'norte');
  if (lat > -10 && lng > -42) return regioes.find(r => r.id === 'nordeste');
  if (lat > -18 && lng < -42) return regioes.find(r => r.id === 'centro_oeste');
  if (lat > -23) return regioes.find(r => r.id === 'sudeste');
  return regioes.find(r => r.id === 'sul');
}

module.exports = {
  getRegioes,
  getIrradiacaoRegiao,
  getRegiaoByCoordinates,
};
