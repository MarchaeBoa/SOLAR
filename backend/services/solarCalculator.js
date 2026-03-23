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

/**
 * Calcula quantas placas solares cabem em uma área disponível.
 * Considera tamanho médio da placa, espaçamento entre placas e perdas por formato do telhado.
 *
 * @param {Object} params
 * @param {number} params.areaM2 - Área disponível em m²
 * @param {number} [params.tamanhoPlacaM2=2.0] - Tamanho médio de cada placa em m²
 * @param {number} [params.espacamentoPercent=10] - Percentual da área perdido com espaçamento (0-100)
 * @param {number} [params.perdasPercent=5] - Percentual de perdas por formato/obstruções (0-100)
 * @param {number} [params.potenciaPlacaW=550] - Potência de cada placa em Watts
 */
function calcularPlacasNaArea({
  areaM2,
  tamanhoPlacaM2 = 2.0,
  espacamentoPercent = 10,
  perdasPercent = 5,
  potenciaPlacaW = 550,
}) {
  const area = parseFloat(areaM2);
  if (!area || area <= 0) {
    return { error: 'Área deve ser um número positivo.' };
  }

  const fatorEspacamento = 1 - espacamentoPercent / 100;
  const fatorPerdas = 1 - perdasPercent / 100;

  const areaUtil = area * fatorEspacamento * fatorPerdas;
  const quantidadePlacas = Math.floor(areaUtil / tamanhoPlacaM2);
  const potenciaTotalKWp = parseFloat(((quantidadePlacas * potenciaPlacaW) / 1000).toFixed(2));
  const areaOcupada = parseFloat((quantidadePlacas * tamanhoPlacaM2).toFixed(2));
  const aproveitamento = parseFloat(((areaOcupada / area) * 100).toFixed(1));

  return {
    areaTotal: area,
    areaUtil: parseFloat(areaUtil.toFixed(2)),
    areaOcupada,
    quantidadePlacas,
    potenciaTotalKWp,
    aproveitamento,
    parametros: {
      tamanhoPlacaM2,
      espacamentoPercent,
      perdasPercent,
      potenciaPlacaW,
    },
  };
}

// Dados simulados de radiação solar por localização (kWh/m²/dia)
const RADIACAO_POR_LOCALIZACAO = {
  norte: { media: 5.5, horasSolDia: 5.0, meses: [5.2, 5.0, 4.8, 5.0, 5.3, 5.5, 5.8, 6.0, 5.9, 5.6, 5.3, 5.1] },
  nordeste: { media: 5.8, horasSolDia: 5.8, meses: [6.0, 5.8, 5.5, 5.4, 5.2, 5.0, 5.3, 5.8, 6.2, 6.4, 6.3, 6.1] },
  centro_oeste: { media: 5.4, horasSolDia: 5.2, meses: [5.0, 5.0, 5.2, 5.4, 5.3, 5.2, 5.5, 5.8, 5.6, 5.4, 5.1, 4.9] },
  sudeste: { media: 4.8, horasSolDia: 4.6, meses: [5.2, 5.0, 4.8, 4.5, 4.2, 4.0, 4.2, 4.5, 4.8, 5.0, 5.2, 5.3] },
  sul: { media: 4.3, horasSolDia: 4.2, meses: [5.0, 4.8, 4.5, 3.8, 3.5, 3.2, 3.4, 3.8, 4.2, 4.5, 5.0, 5.2] },
};

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NOMES_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Calcula a produção de energia solar (diária, mensal e anual).
 *
 * Fórmula: Energia = Potência(kWp) × Radiação(kWh/m²/dia) × PR(Performance Ratio)
 *
 * @param {Object} params
 * @param {number} params.potenciaKWp - Potência instalada em kWp
 * @param {string} [params.localizacao='sudeste'] - Região (norte, nordeste, centro_oeste, sudeste, sul)
 * @param {number} [params.eficiencia=0.80] - Fator de eficiência do sistema (Performance Ratio, 0-1)
 * @param {number} [params.radiacaoCustom] - Radiação solar customizada (kWh/m²/dia), sobrescreve a da localização
 * @param {number} [params.horasSolCustom] - Horas de sol customizadas, sobrescreve a da localização
 */
function calculateSolarProduction({
  potenciaKWp,
  localizacao = 'sudeste',
  eficiencia = 0.80,
  radiacaoCustom = null,
  horasSolCustom = null,
}) {
  const potencia = parseFloat(potenciaKWp);
  if (!potencia || potencia <= 0) {
    return { error: 'Potência (kWp) deve ser um número positivo.' };
  }

  const ef = Math.max(0, Math.min(1, parseFloat(eficiencia) || 0.80));
  const dadosRegiao = RADIACAO_POR_LOCALIZACAO[localizacao] || RADIACAO_POR_LOCALIZACAO.sudeste;
  const radiacaoMedia = radiacaoCustom != null ? parseFloat(radiacaoCustom) : dadosRegiao.media;
  const horasSolDia = horasSolCustom != null ? parseFloat(horasSolCustom) : dadosRegiao.horasSolDia;

  // Geração diária média: Potência × Radiação × Eficiência
  const geracaoDiariaMedia = potencia * radiacaoMedia * ef;

  // Geração mensal detalhada (considerando radiação variável por mês)
  const radiacaoMensal = radiacaoCustom != null
    ? DIAS_POR_MES.map(() => parseFloat(radiacaoCustom))
    : dadosRegiao.meses;

  const geracaoMensal = radiacaoMensal.map((radMes, i) => {
    const radEfetiva = radiacaoCustom != null ? radMes : radMes;
    const geracaoMes = potencia * radEfetiva * ef * DIAS_POR_MES[i];
    return {
      mes: NOMES_MESES[i],
      dias: DIAS_POR_MES[i],
      radiacao: parseFloat(radEfetiva.toFixed(2)),
      geracaoKWh: parseFloat(geracaoMes.toFixed(1)),
    };
  });

  const geracaoAnual = geracaoMensal.reduce((acc, m) => acc + m.geracaoKWh, 0);
  const geracaoMediaMensal = geracaoAnual / 12;

  return {
    potenciaKWp: parseFloat(potencia.toFixed(2)),
    localizacao,
    nomeRegiao: dadosRegiao === RADIACAO_POR_LOCALIZACAO[localizacao]
      ? localizacao.replace('_', '-')
      : 'customizado',
    parametros: {
      radiacaoMedia: parseFloat(radiacaoMedia.toFixed(2)),
      horasSolDia: parseFloat(horasSolDia.toFixed(1)),
      eficiencia: parseFloat(ef.toFixed(2)),
    },
    producao: {
      diaria: parseFloat(geracaoDiariaMedia.toFixed(2)),
      mensal: parseFloat(geracaoMediaMensal.toFixed(1)),
      anual: parseFloat(geracaoAnual.toFixed(1)),
    },
    detalhamentoMensal: geracaoMensal,
    co2EvitadoAnual: parseFloat((geracaoAnual * 0.084 / 1000).toFixed(3)),
    localizacoesDisponiveis: Object.keys(RADIACAO_POR_LOCALIZACAO),
  };
}

module.exports = {
  calcularSimulacao,
  calcularPlacasNaArea,
  calculateSolarProduction,
  getDashboardStats,
  getGeracaoMensal,
  getProjetosAtivos,
};
