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

// Calculate how many panels fit in an area
const AREA_PAINEL_M2 = 2.0;       // Average panel size (1m x 2m)
const ESPACAMENTO_M2 = 0.3;       // Spacing between panels (30cm)
const AREA_EFETIVA_PAINEL = AREA_PAINEL_M2 + ESPACAMENTO_M2; // Total area per panel
const FATOR_APROVEITAMENTO = 0.80; // 80% usable area (edges, obstructions, walkways)
const POTENCIA_PAINEL_WP = 550;    // 550Wp per panel (modern panel)

function calcularPlacasNaArea(area_m2) {
  const areaM2 = parseFloat(area_m2);
  if (!areaM2 || areaM2 <= 0) return null;

  const areaUtil = areaM2 * FATOR_APROVEITAMENTO;
  const quantidadePlacas = Math.floor(areaUtil / AREA_EFETIVA_PAINEL);
  const potenciaTotalWp = quantidadePlacas * POTENCIA_PAINEL_WP;
  const potenciaTotalKWp = potenciaTotalWp / 1000;
  const areaOcupada = quantidadePlacas * AREA_PAINEL_M2;
  const percentualOcupacao = (areaOcupada / areaM2) * 100;

  return {
    area_total_m2: parseFloat(areaM2.toFixed(1)),
    area_util_m2: parseFloat(areaUtil.toFixed(1)),
    quantidade_placas: quantidadePlacas,
    potencia_total_kwp: parseFloat(potenciaTotalKWp.toFixed(2)),
    potencia_total_wp: potenciaTotalWp,
    area_ocupada_m2: parseFloat(areaOcupada.toFixed(1)),
    percentual_ocupacao: parseFloat(percentualOcupacao.toFixed(1)),
    especificacoes: {
      area_painel_m2: AREA_PAINEL_M2,
      espacamento_m2: ESPACAMENTO_M2,
      fator_aproveitamento: FATOR_APROVEITAMENTO,
      potencia_painel_wp: POTENCIA_PAINEL_WP,
    },
  };
}

module.exports = {
  calcularSimulacao,
  calcularPlacasNaArea,
  getDashboardStats,
  getGeracaoMensal,
  getProjetosAtivos,
};
