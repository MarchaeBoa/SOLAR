const TIPOS_TELHADO = {
  ceramico: 1.0,
  metalico: 1.05,
  fibrocimento: 0.95,
  laje: 1.1,
  solo: 1.15,
};

const EFICIENCIA_PAINEL = 0.20;
const CUSTO_KWP = 4500;
const PRECO_KWH = 0.85;
const VIDA_UTIL_ANOS = 25;
const IRRADIACAO_MEDIA = 5.2; // kWh/m²/dia (média Brasil)

function calcularSimulacao({ areaM2, consumoMensal, tipoTelhado = 'ceramico', localizacao = '' }) {
  const area = parseFloat(areaM2);
  const fator = TIPOS_TELHADO[tipoTelhado] || 1.0;

  const potenciaKWp = area * EFICIENCIA_PAINEL * fator;
  const geracaoMensal = potenciaKWp * IRRADIACAO_MEDIA * 30 * 0.8;
  const economiaMensal = geracaoMensal * PRECO_KWH;
  const investimento = potenciaKWp * CUSTO_KWP;
  const paybackMeses = economiaMensal > 0 ? Math.round(investimento / economiaMensal) : 0;
  const economiaVidaUtil = economiaMensal * 12 * VIDA_UTIL_ANOS;
  const co2Anual = (geracaoMensal * 12 * 0.084) / 1000;
  const paineis = Math.ceil(area / 2);

  return {
    potenciaKWp: parseFloat(potenciaKWp.toFixed(1)),
    geracaoMensal: Math.round(geracaoMensal),
    economiaMensal: parseFloat(economiaMensal.toFixed(2)),
    investimento: parseFloat(investimento.toFixed(2)),
    paybackMeses,
    economiaVidaUtil: parseFloat(economiaVidaUtil.toFixed(2)),
    co2Anual: parseFloat(co2Anual.toFixed(2)),
    paineis,
    localizacao,
    tipoTelhado,
  };
}

function getDashboardStats() {
  return {
    geracaoHoje: 42.8,
    geracaoMes: 1284,
    economiaTotal: 18420,
    co2Evitado: 2.4,
    eficiencia: 94.2,
    projetosAtivos: 12,
  };
}

function getGeracaoMensal() {
  return [
    { mes: 'Jan', valor: 98 },
    { mes: 'Fev', valor: 112 },
    { mes: 'Mar', valor: 125 },
    { mes: 'Abr', valor: 108 },
    { mes: 'Mai', valor: 95 },
    { mes: 'Jun', valor: 82 },
    { mes: 'Jul', valor: 78 },
    { mes: 'Ago', valor: 88 },
    { mes: 'Set', valor: 105 },
    { mes: 'Out', valor: 118 },
    { mes: 'Nov', valor: 130 },
    { mes: 'Dez', valor: 138 },
  ];
}

function getProjetosAtivos() {
  return [
    { id: 1, nome: 'Residência Vila Madalena', status: 'Em instalação', potencia: '8.4 kWp' },
    { id: 2, nome: 'Comércio Pinheiros', status: 'Análise técnica', potencia: '22.0 kWp' },
    { id: 3, nome: 'Indústria Guarulhos', status: 'Concluído', potencia: '150 kWp' },
  ];
}

module.exports = {
  calcularSimulacao,
  getDashboardStats,
  getGeracaoMensal,
  getProjetosAtivos,
};
