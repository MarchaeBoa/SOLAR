import React, { useState } from 'react';
import { Zap, MapPin, Ruler, Plug, Home, ArrowRight, RotateCcw, Grid3X3, Sun } from 'lucide-react';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { TIPOS_TELHADO, EFICIENCIA_PAINEL, CUSTO_KWP, PRECO_KWH, VIDA_UTIL_ANOS } from '../utils/constants';

export default function Simulacao() {
  const { state, dispatch } = useApp();
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
        <h1>Simulação Solar</h1>
        <p>Calcule o potencial de geração solar para qualquer localidade</p>
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
                <MapPin size={16} color="var(--gold)" /> Localização
              </label>
              <input
                type="text"
                placeholder="Ex: São Paulo, SP"
                value={form.localizacao}
                onChange={e => handleChange('localizacao', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <Ruler size={16} color="var(--gold)" /> Área disponível (m²)
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
                <Plug size={16} color="var(--gold)" /> Consumo mensal (kWh)
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
                <Home size={16} color="var(--gold)" /> Tipo de telhado
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
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Resultado da Simulação</h3>
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
                    { label: 'Investimento estimado', value: formatCurrency(resultado.investimento) },
                    { label: 'Economia mensal', value: formatCurrency(resultado.economiaMensal) },
                    { label: 'Payback', value: `${resultado.paybackMeses} meses` },
                    { label: 'Economia em 25 anos', value: formatCurrency(resultado.economiaVidaUtil) },
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
          <h2 style={{ fontSize: '1.3rem' }}>Calculadora de Placas</h2>
          <p>Descubra quantas placas solares cabem na sua área disponível</p>
        </div>

        <div className="grid-2">
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid3X3 size={18} color="var(--gold)" /> Parâmetros da Área
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  <Ruler size={16} color="var(--gold)" /> Área disponível (m²)
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
    </div>
  );
}
