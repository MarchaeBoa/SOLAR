import React, { useState } from 'react';
import { Zap, MapPin, Ruler, Plug, Home, ArrowRight, RotateCcw, Grid3X3, Sun, BarChart3, Globe, DollarSign, TrendingUp, Clock, PiggyBank } from 'lucide-react';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { useRegional } from '../context/RegionalContext';
import { useLanguage } from '../context/LanguageContext';
import { formatNumber } from '../utils/formatters';
import { TIPOS_TELHADO, EFICIENCIA_PAINEL, CUSTO_KWP, PRECO_KWH, VIDA_UTIL_ANOS, IRRADIACAO_MEDIA } from '../utils/constants';

export default function Simulacao() {
  const { state, dispatch } = useApp();
  const { formatPrice } = useRegional();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    localizacao: state.simulacao.localizacao || '',
    areaM2: state.simulacao.areaM2 || '',
    consumoMensal: state.simulacao.consumoMensal || '',
    tipoTelhado: state.simulacao.tipoTelhado || 'ceramico',
  });
  const [resultado, setResultado] = useState(state.simulacao.resultado);

  // Estado para calculadora de placas
  const [placasForm, setPlacasForm] = useState({
    areaM2: '',
    tamanhoPlacaM2: '2.0',
    espacamentoPercent: '10',
    perdasPercent: '5',
    potenciaPlacaW: '550',
  });
  const [placasResultado, setPlacasResultado] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const simular = () => {
    const area = parseFloat(form.areaM2) || 0;
    const consumo = parseFloat(form.consumoMensal) || 0;
    const telhado = TIPOS_TELHADO.find(t => t.id === form.tipoTelhado);
    const fator = telhado ? telhado.fator : 1;

    // Irradiação média Brasil
    const irradiacao = 5.2;
    const potenciaKWp = (area * EFICIENCIA_PAINEL * fator);
    const geracaoMensal = potenciaKWp * irradiacao * 30 * 0.8;
    const economiaMensal = geracaoMensal * PRECO_KWH;
    const investimento = potenciaKWp * CUSTO_KWP;
    const paybackMeses = investimento / economiaMensal;
    const economiaVidaUtil = economiaMensal * 12 * VIDA_UTIL_ANOS;
    const co2Anual = (geracaoMensal * 12 * 0.084) / 1000;
    const paineis = Math.ceil(area / 2);

    const res = {
      potenciaKWp: potenciaKWp.toFixed(1),
      geracaoMensal: geracaoMensal.toFixed(0),
      economiaMensal,
      investimento,
      paybackMeses: paybackMeses.toFixed(0),
      economiaVidaUtil,
      co2Anual: co2Anual.toFixed(2),
      paineis,
    };

    setResultado(res);
    dispatch({ type: 'SET_SIMULACAO', payload: form });
    dispatch({ type: 'SET_RESULTADO_SIMULACAO', payload: res });
  };

  const resetar = () => {
    setForm({ localizacao: '', areaM2: '', consumoMensal: '', tipoTelhado: 'ceramico' });
    setResultado(null);
    dispatch({ type: 'RESET_SIMULACAO' });
  };

  const handlePlacasChange = (field, value) => {
    setPlacasForm(prev => ({ ...prev, [field]: value }));
  };

  const calcularPlacas = () => {
    const area = parseFloat(placasForm.areaM2) || 0;
    const tamanhoPlaca = parseFloat(placasForm.tamanhoPlacaM2) || 2.0;
    const espacamento = parseFloat(placasForm.espacamentoPercent) || 10;
    const perdas = parseFloat(placasForm.perdasPercent) || 5;
    const potenciaPlaca = parseFloat(placasForm.potenciaPlacaW) || 550;

    if (area <= 0) return;

    const fatorEspacamento = 1 - espacamento / 100;
    const fatorPerdas = 1 - perdas / 100;
    const areaUtil = area * fatorEspacamento * fatorPerdas;
    const quantidadePlacas = Math.floor(areaUtil / tamanhoPlaca);
    const potenciaTotalKWp = parseFloat(((quantidadePlacas * potenciaPlaca) / 1000).toFixed(2));
    const areaOcupada = parseFloat((quantidadePlacas * tamanhoPlaca).toFixed(2));
    const aproveitamento = parseFloat(((areaOcupada / area) * 100).toFixed(1));

    setPlacasResultado({
      areaTotal: area,
      areaUtil: parseFloat(areaUtil.toFixed(2)),
      areaOcupada,
      quantidadePlacas,
      potenciaTotalKWp,
      aproveitamento,
    });
  };

  const resetarPlacas = () => {
    setPlacasForm({
      areaM2: '',
      tamanhoPlacaM2: '2.0',
      espacamentoPercent: '10',
      perdasPercent: '5',
      potenciaPlacaW: '550',
    });
    setPlacasResultado(null);
  };

  // Estado para calculadora de produção solar
  const LOCALIZACOES = [
    { id: 'norte', nome: 'Norte', radiacao: 5.5, horasSol: 5.0 },
    { id: 'nordeste', nome: 'Nordeste', radiacao: 5.8, horasSol: 5.8 },
    { id: 'centro_oeste', nome: 'Centro-Oeste', radiacao: 5.4, horasSol: 5.2 },
    { id: 'sudeste', nome: 'Sudeste', radiacao: 4.8, horasSol: 4.6 },
    { id: 'sul', nome: 'Sul', radiacao: 4.3, horasSol: 4.2 },
  ];

  const [producaoForm, setProducaoForm] = useState({
    potenciaKWp: '',
    localizacao: 'sudeste',
    eficiencia: '80',
    radiacaoCustom: '',
    horasSolCustom: '',
    usarCustom: false,
  });
  const [producaoResultado, setProducaoResultado] = useState(null);

  const handleProducaoChange = (field, value) => {
    setProducaoForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'localizacao' && !prev.usarCustom) {
        const loc = LOCALIZACOES.find(l => l.id === value);
        if (loc) {
          updated.radiacaoCustom = '';
          updated.horasSolCustom = '';
        }
      }
      return updated;
    });
  };

  const calcularProducao = () => {
    const potencia = parseFloat(producaoForm.potenciaKWp) || 0;
    if (potencia <= 0) return;

    const ef = (parseFloat(producaoForm.eficiencia) || 80) / 100;
    const loc = LOCALIZACOES.find(l => l.id === producaoForm.localizacao) || LOCALIZACOES[3];
    const radiacao = producaoForm.usarCustom && producaoForm.radiacaoCustom
      ? parseFloat(producaoForm.radiacaoCustom)
      : loc.radiacao;
    const horasSol = producaoForm.usarCustom && producaoForm.horasSolCustom
      ? parseFloat(producaoForm.horasSolCustom)
      : loc.horasSol;

    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Radiação mensal simulada com variação sazonal
    const radiacaoMensal = {
      norte: [5.2, 5.0, 4.8, 5.0, 5.3, 5.5, 5.8, 6.0, 5.9, 5.6, 5.3, 5.1],
      nordeste: [6.0, 5.8, 5.5, 5.4, 5.2, 5.0, 5.3, 5.8, 6.2, 6.4, 6.3, 6.1],
      centro_oeste: [5.0, 5.0, 5.2, 5.4, 5.3, 5.2, 5.5, 5.8, 5.6, 5.4, 5.1, 4.9],
      sudeste: [5.2, 5.0, 4.8, 4.5, 4.2, 4.0, 4.2, 4.5, 4.8, 5.0, 5.2, 5.3],
      sul: [5.0, 4.8, 4.5, 3.8, 3.5, 3.2, 3.4, 3.8, 4.2, 4.5, 5.0, 5.2],
    };

    const radMensal = producaoForm.usarCustom && producaoForm.radiacaoCustom
      ? diasPorMes.map(() => radiacao)
      : (radiacaoMensal[producaoForm.localizacao] || radiacaoMensal.sudeste);

    const detalhamento = radMensal.map((rad, i) => ({
      mes: nomesMeses[i],
      dias: diasPorMes[i],
      radiacao: rad,
      geracaoKWh: parseFloat((potencia * rad * ef * diasPorMes[i]).toFixed(1)),
    }));

    const geracaoAnual = detalhamento.reduce((acc, m) => acc + m.geracaoKWh, 0);
    const geracaoMediaDiaria = potencia * radiacao * ef;
    const geracaoMediaMensal = geracaoAnual / 12;

    setProducaoResultado({
      potenciaKWp: potencia,
      localizacao: loc.nome,
      radiacao,
      horasSol,
      eficiencia: ef,
      producao: {
        diaria: parseFloat(geracaoMediaDiaria.toFixed(2)),
        mensal: parseFloat(geracaoMediaMensal.toFixed(1)),
        anual: parseFloat(geracaoAnual.toFixed(1)),
      },
      detalhamento,
      co2EvitadoAnual: parseFloat((geracaoAnual * 0.084 / 1000).toFixed(3)),
    });
  };

  const resetarProducao = () => {
    setProducaoForm({
      potenciaKWp: '',
      localizacao: 'sudeste',
      eficiencia: '80',
      radiacaoCustom: '',
      horasSolCustom: '',
      usarCustom: false,
    });
    setProducaoResultado(null);
  };

  // Estado para calculadora de retorno financeiro
  const [financeiroForm, setFinanceiroForm] = useState({
    custoSistema: '',
    tarifaEnergia: '0.85',
    geracaoMensalKWh: '',
    reajusteAnual: '6',
    vidaUtilAnos: '25',
  });
  const [financeiroResultado, setFinanceiroResultado] = useState(null);

  const handleFinanceiroChange = (field, value) => {
    setFinanceiroForm(prev => ({ ...prev, [field]: value }));
  };

  const calcularFinanceiro = () => {
    const custo = parseFloat(financeiroForm.custoSistema) || 0;
    const tarifa = parseFloat(financeiroForm.tarifaEnergia) || 0;
    const geracao = parseFloat(financeiroForm.geracaoMensalKWh) || 0;
    const reajuste = parseFloat(financeiroForm.reajusteAnual) || 6;
    const vidaUtil = parseInt(financeiroForm.vidaUtilAnos) || 25;

    if (custo <= 0 || tarifa <= 0 || geracao <= 0) return;

    const economiaMensal = geracao * tarifa;
    const economiaAnual = economiaMensal * 12;

    // Payback simples
    const paybackSimplesMeses = Math.ceil(custo / economiaMensal);
    const paybackSimplesAnos = parseFloat((paybackSimplesMeses / 12).toFixed(1));

    // Payback descontado (com reajuste)
    let acumulado = 0;
    let paybackDescontadoMeses = 0;
    let encontrou = false;

    for (let ano = 0; ano < vidaUtil; ano++) {
      const tarifaAno = tarifa * Math.pow(1 + reajuste / 100, ano);
      const economiaMesAno = geracao * tarifaAno;
      for (let mes = 0; mes < 12; mes++) {
        acumulado += economiaMesAno;
        paybackDescontadoMeses++;
        if (acumulado >= custo && !encontrou) {
          encontrou = true;
          break;
        }
      }
      if (encontrou) break;
    }

    if (!encontrou) paybackDescontadoMeses = vidaUtil * 12;
    const paybackDescontadoAnos = parseFloat((paybackDescontadoMeses / 12).toFixed(1));

    // Economia total e fluxo anual
    let economiaTotal = 0;
    const fluxoAnual = [];
    for (let ano = 1; ano <= vidaUtil; ano++) {
      const tarifaAno = tarifa * Math.pow(1 + reajuste / 100, ano - 1);
      const economiaAno = geracao * tarifaAno * 12;
      economiaTotal += economiaAno;
      fluxoAnual.push({
        ano,
        economiaAno: parseFloat(economiaAno.toFixed(2)),
        economiaAcumulada: parseFloat(economiaTotal.toFixed(2)),
        lucroAcumulado: parseFloat((economiaTotal - custo).toFixed(2)),
      });
    }

    const roi = ((economiaTotal - custo) / custo) * 100;

    setFinanceiroResultado({
      economiaMensal: parseFloat(economiaMensal.toFixed(2)),
      economiaAnual: parseFloat(economiaAnual.toFixed(2)),
      paybackSimplesMeses,
      paybackSimplesAnos,
      paybackDescontadoMeses,
      paybackDescontadoAnos,
      roi: parseFloat(roi.toFixed(1)),
      economiaTotal: parseFloat(economiaTotal.toFixed(2)),
      lucroTotal: parseFloat((economiaTotal - custo).toFixed(2)),
      fluxoAnual,
      custoSistema: custo,
    });
  };

  const resetarFinanceiro = () => {
    setFinanceiroForm({
      custoSistema: '',
      tarifaEnergia: '0.85',
      geracaoMensalKWh: '',
      reajusteAnual: '6',
      vidaUtilAnos: '25',
    });
    setFinanceiroResultado(null);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text-1)',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color var(--t)',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-2)',
    marginBottom: '8px',
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t.simulacao.title}</h1>
        <p>{t.simulacao.subtitle}</p>
      </div>

      <div className="grid-2">
        {/* Form */}
        <Card>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '24px' }}>
            Dados do Projeto
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>
                <MapPin size={16} color="var(--gold)" /> {t.simulacao.localizacao}
              </label>
              <input
                type="text"
                placeholder={t.simulacao.localizacaoPlaceholder}
                value={form.localizacao}
                onChange={e => handleChange('localizacao', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Ruler size={16} color="var(--gold)" /> {t.simulacao.areaM2}
              </label>
              <input
                type="number"
                placeholder="Ex: 50"
                value={form.areaM2}
                onChange={e => handleChange('areaM2', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Plug size={16} color="var(--gold)" /> {t.simulacao.consumoMensal}
              </label>
              <input
                type="number"
                placeholder="Ex: 350"
                value={form.consumoMensal}
                onChange={e => handleChange('consumoMensal', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Home size={16} color="var(--gold)" /> {t.simulacao.tipoTelhado}
              </label>
              <select
                value={form.tipoTelhado}
                onChange={e => handleChange('tipoTelhado', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {TIPOS_TELHADO.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={simular} style={{ flex: 1 }}>
                <Zap size={16} /> Simular
              </button>
              <button className="btn btn-secondary" onClick={resetar}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {resultado ? (
            <>
              <Card style={{ borderColor: 'var(--gold-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Zap size={20} color="var(--gold)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.simulacao.resultadoFinanceiro}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Potência', value: `${resultado.potenciaKWp} kWp`, color: 'var(--gold)' },
                    { label: 'Geração Mensal', value: `${formatNumber(resultado.geracaoMensal)} kWh`, color: 'var(--green)' },
                    { label: 'Painéis', value: `${resultado.paineis} unidades`, color: 'var(--blue)' },
                    { label: 'CO₂/ano evitado', value: `${resultado.co2Anual} ton`, color: 'var(--green)' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        {item.label}
                      </div>
                      <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ borderColor: 'var(--green-border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                  Análise Financeira
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: t.simulacao.investimentoEstimado, value: formatPrice(resultado.investimento) },
                    { label: t.simulacao.economiaMensal, value: formatPrice(resultado.economiaMensal) },
                    { label: 'Payback', value: `${resultado.paybackMeses} meses` },
                    { label: t.simulacao.economiaVidaUtil, value: formatPrice(resultado.economiaVidaUtil) },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>{item.label}</span>
                      <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--gold-dim)',
                border: '1px solid var(--gold-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Zap size={36} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Pronto para simular</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '280px' }}>
                Preencha os dados ao lado e clique em "Simular" para ver o potencial solar do local.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Calculadora de Placas */}
      <div style={{ marginTop: '40px' }}>
        <div className="page-header">
          <h2 style={{ fontSize: '1.3rem' }}>{t.simulacao.calcPlacas}</h2>
          <p>{t.simulacao.calcPlacas}</p>
        </div>

        <div className="grid-2">
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid3X3 size={18} color="var(--gold)" /> Parâmetros da Área
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  <Ruler size={16} color="var(--gold)" /> {t.simulacao.areaM2}
                </label>
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={placasForm.areaM2}
                  onChange={e => handlePlacasChange('areaM2', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Sun size={16} color="var(--gold)" /> Tamanho da placa (m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 2.0"
                  value={placasForm.tamanhoPlacaM2}
                  onChange={e => handlePlacasChange('tamanhoPlacaM2', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Zap size={16} color="var(--gold)" /> Potência por placa (W)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 550"
                  value={placasForm.potenciaPlacaW}
                  onChange={e => handlePlacasChange('potenciaPlacaW', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>
                    Espaçamento (%)
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={placasForm.espacamentoPercent}
                    onChange={e => handlePlacasChange('espacamentoPercent', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Perdas (%)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={placasForm.perdasPercent}
                    onChange={e => handlePlacasChange('perdasPercent', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={calcularPlacas} style={{ flex: 1 }}>
                  <Grid3X3 size={16} /> Calcular Placas
                </button>
                <button className="btn btn-secondary" onClick={resetarPlacas}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {placasResultado ? (
              <Card style={{ borderColor: 'var(--gold-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Grid3X3 size={20} color="var(--gold)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Resultado do Cálculo</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Placas', value: `${placasResultado.quantidadePlacas}`, sub: 'unidades', color: 'var(--gold)' },
                    { label: 'Potência Total', value: `${placasResultado.potenciaTotalKWp}`, sub: 'kWp', color: 'var(--green)' },
                    { label: 'Área Útil', value: `${placasResultado.areaUtil}`, sub: 'm²', color: 'var(--blue)' },
                    { label: 'Aproveitamento', value: `${placasResultado.aproveitamento}`, sub: '%', color: 'var(--green)' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        {item.label}
                      </div>
                      <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Área total</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{placasResultado.areaTotal} m²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Área ocupada pelas placas</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{placasResultado.areaOcupada} m²</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Área não utilizada</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{(placasResultado.areaTotal - placasResultado.areaOcupada).toFixed(2)} m²</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <Grid3X3 size={36} color="var(--gold)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Calculadora de Placas</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '280px' }}>
                  Informe a área disponível para descobrir quantas placas solares cabem e a potência total do sistema.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Calculadora de Produção Solar */}
      <div style={{ marginTop: '40px' }}>
        <div className="page-header">
          <h2 style={{ fontSize: '1.3rem' }}>{t.simulacao.calcProducao}</h2>
          <p>{t.simulacao.calcProducao}</p>
        </div>

        <div className="grid-2">
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--gold)" /> Parâmetros de Produção
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  <Zap size={16} color="var(--gold)" /> Potência instalada (kWp)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5.0"
                  value={producaoForm.potenciaKWp}
                  onChange={e => handleProducaoChange('potenciaKWp', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Globe size={16} color="var(--gold)" /> Localização / Região
                </label>
                <select
                  value={producaoForm.localizacao}
                  onChange={e => handleProducaoChange('localizacao', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  disabled={producaoForm.usarCustom}
                >
                  {LOCALIZACOES.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.nome} — {l.radiacao} kWh/m²/dia | {l.horasSol}h sol
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  <Sun size={16} color="var(--gold)" /> Eficiência do sistema (%)
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="80"
                  value={producaoForm.eficiencia}
                  onChange={e => handleProducaoChange('eficiencia', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{
                padding: '12px 16px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
              }}>
                <label style={{ ...labelStyle, cursor: 'pointer', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={producaoForm.usarCustom}
                    onChange={e => handleProducaoChange('usarCustom', e.target.checked)}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  Usar radiação e horas de sol customizadas
                </label>

                {producaoForm.usarCustom && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8rem' }}>
                        Radiação (kWh/m²/dia)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 5.0"
                        value={producaoForm.radiacaoCustom}
                        onChange={e => handleProducaoChange('radiacaoCustom', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8rem' }}>
                        Horas de sol/dia
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 5.0"
                        value={producaoForm.horasSolCustom}
                        onChange={e => handleProducaoChange('horasSolCustom', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={calcularProducao} style={{ flex: 1 }}>
                  <BarChart3 size={16} /> Calcular Produção
                </button>
                <button className="btn btn-secondary" onClick={resetarProducao}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {producaoResultado ? (
              <>
                <Card style={{ borderColor: 'var(--gold-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <BarChart3 size={20} color="var(--gold)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Produção Estimada</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    {[
                      { label: 'Diária', value: `${formatNumber(producaoResultado.producao.diaria, 1)}`, sub: 'kWh', color: 'var(--gold)' },
                      { label: 'Mensal', value: `${formatNumber(producaoResultado.producao.mensal, 0)}`, sub: 'kWh', color: 'var(--green)' },
                      { label: 'Anual', value: `${formatNumber(producaoResultado.producao.anual, 0)}`, sub: 'kWh', color: 'var(--blue)' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '16px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                          {item.label}
                        </div>
                        <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '2px' }}>
                          {item.sub}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    {[
                      { label: 'Potência', value: `${producaoResultado.potenciaKWp} kWp` },
                      { label: 'Região', value: producaoResultado.localizacao },
                      { label: 'Radiação', value: `${producaoResultado.radiacao} kWh/m²/dia` },
                      { label: 'Horas de sol', value: `${producaoResultado.horasSol}h/dia` },
                      { label: 'Eficiência', value: `${(producaoResultado.eficiencia * 100).toFixed(0)}%` },
                      { label: 'CO₂ evitado/ano', value: `${producaoResultado.co2EvitadoAnual} ton` },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '0.83rem', color: 'var(--text-2)' }}>{item.label}</span>
                        <span className="mono" style={{ fontSize: '0.83rem', fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card style={{ borderColor: 'var(--green-border)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                    Detalhamento Mensal
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {producaoResultado.detalhamento.map((m, i) => {
                      const maxGeracao = Math.max(...producaoResultado.detalhamento.map(d => d.geracaoKWh));
                      const barWidth = maxGeracao > 0 ? (m.geracaoKWh / maxGeracao) * 100 : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', width: '32px', textAlign: 'right' }}>{m.mes}</span>
                          <div style={{ flex: 1, height: '18px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${barWidth}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--gold), var(--green))',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600, width: '70px', textAlign: 'right' }}>
                            {formatNumber(m.geracaoKWh, 0)} kWh
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </>
            ) : (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <BarChart3 size={36} color="var(--gold)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Produção de Energia</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '280px' }}>
                  Informe a potência do sistema para calcular a geração de energia diária, mensal e anual.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Calculadora de Retorno Financeiro */}
      <div style={{ marginTop: '40px' }}>
        <div className="page-header">
          <h2 style={{ fontSize: '1.3rem' }}>{t.simulacao.calcRetorno}</h2>
          <p>{t.simulacao.retornoFinanceiroDesc}</p>
        </div>

        <div className="grid-2">
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--gold)" /> Dados Financeiros
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  <DollarSign size={16} color="var(--gold)" /> Custo do sistema (R$)
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="Ex: 25000"
                  value={financeiroForm.custoSistema}
                  onChange={e => handleFinanceiroChange('custoSistema', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Zap size={16} color="var(--gold)" /> Tarifa de energia (R$/kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.85"
                  value={financeiroForm.tarifaEnergia}
                  onChange={e => handleFinanceiroChange('tarifaEnergia', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <Sun size={16} color="var(--gold)" /> Geração mensal estimada (kWh)
                </label>
                <input
                  type="number"
                  step="10"
                  placeholder="Ex: 500"
                  value={financeiroForm.geracaoMensalKWh}
                  onChange={e => handleFinanceiroChange('geracaoMensalKWh', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>
                    Reajuste anual (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="6"
                    value={financeiroForm.reajusteAnual}
                    onChange={e => handleFinanceiroChange('reajusteAnual', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Vida útil (anos)
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={financeiroForm.vidaUtilAnos}
                    onChange={e => handleFinanceiroChange('vidaUtilAnos', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={calcularFinanceiro} style={{ flex: 1 }}>
                  <TrendingUp size={16} /> Calcular Retorno
                </button>
                <button className="btn btn-secondary" onClick={resetarFinanceiro}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {financeiroResultado ? (
              <>
                <Card style={{ borderColor: 'var(--gold-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <TrendingUp size={20} color="var(--gold)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.simulacao.resultadoFinanceiro}</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    {[
                      { label: t.simulacao.economiaMensal, value: formatPrice(financeiroResultado.economiaMensal), color: 'var(--green)' },
                      { label: t.simulacao.economiaAnual, value: formatPrice(financeiroResultado.economiaAnual), color: 'var(--green)' },
                      { label: 'Payback Simples', value: `${financeiroResultado.paybackSimplesAnos} anos`, color: 'var(--gold)' },
                      { label: 'Payback c/ Reajuste', value: `${financeiroResultado.paybackDescontadoAnos} anos`, color: 'var(--gold)' },
                      { label: 'ROI', value: `${formatNumber(financeiroResultado.roi, 1)}%`, color: 'var(--blue)' },
                      { label: t.simulacao.lucroTotal, value: formatPrice(financeiroResultado.lucroTotal), color: 'var(--green)' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '16px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                          {item.label}
                        </div>
                        <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: item.color }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    {[
                      { label: t.simulacao.investimento, value: formatPrice(financeiroResultado.custoSistema) },
                      { label: t.simulacao.economiaTotalVidaUtil, value: formatPrice(financeiroResultado.economiaTotal) },
                      { label: 'Payback simples', value: `${financeiroResultado.paybackSimplesMeses} meses (${financeiroResultado.paybackSimplesAnos} anos)` },
                      { label: 'Payback com reajuste', value: `${financeiroResultado.paybackDescontadoMeses} meses (${financeiroResultado.paybackDescontadoAnos} anos)` },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '0.83rem', color: 'var(--text-2)' }}>{item.label}</span>
                        <span className="mono" style={{ fontSize: '0.83rem', fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card style={{ borderColor: 'var(--green-border)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
                    Evolução do Retorno
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                    {financeiroResultado.fluxoAnual
                      .filter((_, i) => i < 10 || (i + 1) % 5 === 0)
                      .map((item, i) => {
                        const maxEconomia = financeiroResultado.fluxoAnual[financeiroResultado.fluxoAnual.length - 1].economiaAcumulada;
                        const barWidth = maxEconomia > 0 ? (item.economiaAcumulada / maxEconomia) * 100 : 0;
                        const isPastPayback = item.lucroAcumulado >= 0;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-2)', width: '50px', textAlign: 'right' }}>Ano {item.ano}</span>
                            <div style={{ flex: 1, height: '16px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${barWidth}%`,
                                height: '100%',
                                background: isPastPayback
                                  ? 'linear-gradient(90deg, var(--gold), var(--green))'
                                  : 'linear-gradient(90deg, var(--gold), var(--gold))',
                                borderRadius: '4px',
                                transition: 'width 0.3s ease',
                              }} />
                            </div>
                            <span className="mono" style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              width: '90px',
                              textAlign: 'right',
                              color: isPastPayback ? 'var(--green)' : 'var(--text-2)',
                            }}>
                              {formatPrice(item.lucroAcumulado)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </Card>
              </>
            ) : (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <PiggyBank size={36} color="var(--gold)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Retorno Financeiro</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '280px' }}>
                  Informe o custo do sistema, tarifa e geração para calcular economia, payback e ROI.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
