const regioes = [
  {
    id: 'norte',
    nome: 'Norte',
    irradiacao: 5.5,
    estados: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
    descricao: 'Alta irradiação solar com potencial significativo para energia fotovoltaica.',
  },
  {
    id: 'nordeste',
    nome: 'Nordeste',
    irradiacao: 5.8,
    estados: ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
    descricao: 'Melhor região do Brasil para energia solar, com irradiação consistente o ano todo.',
  },
  {
    id: 'centro_oeste',
    nome: 'Centro-Oeste',
    irradiacao: 5.4,
    estados: ['MT', 'MS', 'GO', 'DF'],
    descricao: 'Excelente potencial solar com grandes áreas planas disponíveis.',
  },
  {
    id: 'sudeste',
    nome: 'Sudeste',
    irradiacao: 4.8,
    estados: ['SP', 'RJ', 'MG', 'ES'],
    descricao: 'Bom potencial solar, maior mercado consumidor do país.',
  },
  {
    id: 'sul',
    nome: 'Sul',
    irradiacao: 4.3,
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

module.exports = {
  getRegioes,
  getIrradiacaoRegiao,
};
