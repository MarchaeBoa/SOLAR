import React, { useState, useCallback } from 'react';
import { Ruler, Plus, Trash2, AlertTriangle, CheckCircle, MapPin, Grid3X3, ArrowRight, RotateCcw } from 'lucide-react';
import Card from '../components/Card';
import { formatNumber } from '../utils/formatters';

const OBSTACULOS_TIPOS = [
  { id: 'chamine', label: 'Chaminé', areaMedia: 0.5, icon: '🏭' },
  { id: 'caixa_dagua', label: "Caixa d'água", areaMedia: 2.0, icon: '💧' },
  { id: 'antena', label: 'Antena', areaMedia: 0.3, icon: '📡' },
  { id: 'claraboia', label: 'Clarabóia', areaMedia: 1.2, icon: '🪟' },
  { id: 'ar_condicionado', label: 'Ar Condicionado', areaMedia: 0.8, icon: '❄️' },
  { id: 'para_raios', label: 'Para-raios', areaMedia: 0.2, icon: '⚡' },
  { id: 'telhado_irregular', label: 'Área Irregular', areaMedia: 3.0, icon: '📐' },
  { id: 'sombra', label: 'Zona de Sombra', areaMedia: 5.0, icon: '🌑' },
];

const MARGEM_SEGURANCA = {
  chamine: 1.0,
  caixa_dagua: 0.8,
  antena: 0.5,
  claraboia: 0.3,
  ar_condicionado: 0.5,
  para_raios: 1.5,
  telhado_irregular: 0.5,
  sombra: 0.0,
};

function calcularAreaUtil(areaTotalM2, obstaculos, margemBorda) {
  const areaObstaculos = obstaculos.reduce((acc, obs) => {
    const tipo = OBSTACULOS_TIPOS.find(t => t.id === obs.tipo);
    const areaBase = obs.areaCustom || (tipo ? tipo.areaMedia : 1);
    const margem = MARGEM_SEGURANCA[obs.tipo] || 0.5;
    const areaComMargem = areaBase + (margem * 2 * Math.sqrt(areaBase / Math.PI));
    return acc + (areaComMargem * obs.quantidade);
  }, 0);

  const margemBordaM2 = margemBorda * Math.sqrt(areaTotalM2) * 0.4;
  const areaUtil = Math.max(0, areaTotalM2 - areaObstaculos - margemBordaM2);
  return {
    areaTotal: areaTotalM2,
    areaObstaculos: Math.min(areaObstaculos, areaTotalM2),
    margemBorda: margemBordaM2,
    areaUtil,
    aproveitamento: areaTotalM2 > 0 ? (areaUtil / areaTotalM2) * 100 : 0,
  };
}

function calcularPaineis(areaUtilM2, tamanhoPlacaM2, espacamentoPercent) {
  const areaComEspacamento = tamanhoPlacaM2 * (1 + espacamentoPercent / 100);
  const qtd = Math.floor(areaUtilM2 / areaComEspacamento);
  return {
    quantidade: qtd,
    areaOcupada: qtd * tamanhoPlacaM2,
    areaComEspacamento: qtd * areaComEspacamento,
  };
}

export default function CalculoArea() {
  const [form, setForm] = useState({
    largura: '',
    comprimento: '',
    areaManual: '',
    modoEntrada: 'dimensoes',
    margemBorda: 0.5,
    tamanhoPlaca: '2.0',
    espacamento: '15',
    potenciaPlaca: '550',
  });

  const [obstaculos, setObstaculos] = useState([]);
  const [resultado, setResultado] = useState(null);

  const adicionarObstaculo = (tipoId) => {
    setObstaculos(prev => {
      const existente = prev.find(o => o.tipo === tipoId);
      if (existente) {
        return prev.map(o => o.tipo === tipoId ? { ...o, quantidade: o.quantidade + 1 } : o);
      }
      return [...prev, { tipo: tipoId, quantidade: 1, areaCustom: null }];
    });
  };

  const atualizarObstaculo = (tipo, field, value) => {
    setObstaculos(prev => prev.map(o =>
      o.tipo === tipo ? { ...o, [field]: value } : o
    ));
  };

  const removerObstaculo = (tipo) => {
    setObstaculos(prev => prev.filter(o => o.tipo !== tipo));
  };

  const calcular = useCallback(() => {
    let areaTotalM2;
    if (form.modoEntrada === 'dimensoes') {
      const l = parseFloat(form.largura) || 0;
      const c = parseFloat(form.comprimento) || 0;
      areaTotalM2 = l * c;
    } else {
      areaTotalM2 = parseFloat(form.areaManual) || 0;
    }

    if (areaTotalM2 <= 0) return;

    const areaResult = calcularAreaUtil(areaTotalM2, obstaculos, form.margemBorda);
    const paineisResult = calcularPaineis(
      areaResult.areaUtil,
      parseFloat(form.tamanhoPlaca),
      parseFloat(form.espacamento)
    );

    const potenciaKWp = (paineisResult.quantidade * parseFloat(form.potenciaPlaca)) / 1000;
    const geracaoEstimada = potenciaKWp * 5.2 * 30 * 0.8;

    setResultado({
      ...areaResult,
      ...paineisResult,
      potenciaKWp,
      geracaoEstimada,
    });
  }, [form, obstaculos]);

  const resetar = () => {
    setForm({
      largura: '', comprimento: '', areaManual: '',
      modoEntrada: 'dimensoes', margemBorda: 0.5,
      tamanhoPlaca: '2.0', espacamento: '15', potenciaPlaca: '550',
    });
    setObstaculos([]);
    setResultado(null);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--text-1)',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.88rem',
    outline: 'none',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Cálculo de Área Preciso</h1>
        <p>Medição com detecção de obstáculos para máximo aproveitamento da área disponível</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Left: Input forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Area input */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Ruler size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Dimensões do Telhado</h3>
            </div>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'dimensoes', label: 'Largura x Comprimento' },
                { id: 'area', label: 'Área Total (m²)' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setForm(f => ({ ...f, modoEntrada: m.id }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--r-sm)',
                    border: `1px solid ${form.modoEntrada === m.id ? 'var(--gold-border)' : 'var(--border-mid)'}`,
                    background: form.modoEntrada === m.id ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                    color: form.modoEntrada === m.id ? 'var(--gold)' : 'var(--text-2)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {form.modoEntrada === 'dimensoes' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                    Largura (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.largura}
                    onChange={e => setForm(f => ({ ...f, largura: e.target.value }))}
                    placeholder="Ex: 10"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                    Comprimento (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.comprimento}
                    onChange={e => setForm(f => ({ ...f, comprimento: e.target.value }))}
                    placeholder="Ex: 15"
                    style={inputStyle}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                  Área Total (m²)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.areaManual}
                  onChange={e => setForm(f => ({ ...f, areaManual: e.target.value }))}
                  placeholder="Ex: 150"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Panel config */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-2)' }}>
                Configuração dos Painéis
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                    Tamanho (m²)
                  </label>
                  <select
                    value={form.tamanhoPlaca}
                    onChange={e => setForm(f => ({ ...f, tamanhoPlaca: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="1.7">1.7 m² (330W)</option>
                    <option value="2.0">2.0 m² (450W)</option>
                    <option value="2.2">2.2 m² (550W)</option>
                    <option value="2.6">2.6 m² (600W)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                    Espaçamento
                  </label>
                  <select
                    value={form.espacamento}
                    onChange={e => setForm(f => ({ ...f, espacamento: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="10">10% (mínimo)</option>
                    <option value="15">15% (padrão)</option>
                    <option value="20">20% (confortável)</option>
                    <option value="25">25% (manutenção)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                    Potência/Painel
                  </label>
                  <select
                    value={form.potenciaPlaca}
                    onChange={e => setForm(f => ({ ...f, potenciaPlaca: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="330">330W</option>
                    <option value="450">450W</option>
                    <option value="550">550W</option>
                    <option value="600">600W</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Border margin */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                Margem de Borda: {form.margemBorda}m
              </label>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={form.margemBorda}
                onChange={e => setForm(f => ({ ...f, margemBorda: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)' }}>
                <span>0m</span>
                <span>1.5m</span>
              </div>
            </div>
          </Card>

          {/* Obstacles */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertTriangle size={18} color="var(--coral)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Detecção de Obstáculos</h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: '16px' }}>
              Marque os obstáculos presentes no telhado. A margem de segurança é calculada automaticamente.
            </p>

            {/* Add obstacles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {OBSTACULOS_TIPOS.map(tipo => {
                const ativo = obstaculos.some(o => o.tipo === tipo.id);
                return (
                  <button
                    key={tipo.id}
                    onClick={() => adicionarObstaculo(tipo.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 8px',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${ativo ? 'var(--coral)' : 'var(--border-mid)'}`,
                      background: ativo ? 'var(--coral-dim)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      color: ativo ? 'var(--coral)' : 'var(--text-2)',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      fontFamily: 'Outfit, sans-serif',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{tipo.icon}</span>
                    <span>{tipo.label}</span>
                    {ativo && (
                      <span className="mono" style={{ fontSize: '0.65rem' }}>
                        x{obstaculos.find(o => o.tipo === tipo.id)?.quantidade}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active obstacles list */}
            {obstaculos.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {obstaculos.map(obs => {
                  const tipo = OBSTACULOS_TIPOS.find(t => t.id === obs.tipo);
                  return (
                    <div key={obs.tipo} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{tipo.icon}</span>
                      <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500 }}>{tipo.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Qtd:</label>
                        <input
                          type="number"
                          min="1"
                          value={obs.quantidade}
                          onChange={e => atualizarObstaculo(obs.tipo, 'quantidade', parseInt(e.target.value) || 1)}
                          style={{
                            width: '50px', padding: '4px 6px', background: 'var(--bg-base)',
                            border: '1px solid var(--border-mid)', borderRadius: '4px',
                            color: 'var(--text-1)', fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.8rem', textAlign: 'center', outline: 'none',
                          }}
                        />
                        <label style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Área (m²):</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={obs.areaCustom || tipo.areaMedia}
                          onChange={e => atualizarObstaculo(obs.tipo, 'areaCustom', parseFloat(e.target.value) || tipo.areaMedia)}
                          style={{
                            width: '65px', padding: '4px 6px', background: 'var(--bg-base)',
                            border: '1px solid var(--border-mid)', borderRadius: '4px',
                            color: 'var(--text-1)', fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.8rem', textAlign: 'center', outline: 'none',
                          }}
                        />
                        <button onClick={() => removerObstaculo(obs.tipo)} style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          padding: '4px', color: 'var(--coral)',
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={calcular} style={{ flex: 1 }}>
              <Grid3X3 size={16} /> Calcular Área Útil
            </button>
            <button className="btn btn-secondary" onClick={resetar}>
              <RotateCcw size={16} /> Limpar
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {resultado ? (
            <>
              {/* Area breakdown */}
              <Card style={{ borderColor: 'var(--gold-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <CheckCircle size={18} color="var(--green)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Resultado da Análise</h3>
                </div>

                {/* Visual bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    height: '32px',
                    borderRadius: 'var(--r-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    background: 'var(--bg-base)',
                  }}>
                    <div style={{
                      width: `${(resultado.areaUtil / resultado.areaTotal) * 100}%`,
                      background: 'var(--green)',
                      transition: 'width 0.5s ease',
                    }} />
                    <div style={{
                      width: `${(resultado.areaObstaculos / resultado.areaTotal) * 100}%`,
                      background: 'var(--coral)',
                      transition: 'width 0.5s ease',
                    }} />
                    <div style={{
                      width: `${(resultado.margemBorda / resultado.areaTotal) * 100}%`,
                      background: 'var(--gold)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--green)' }}>Utilizável</span>
                    <span style={{ color: 'var(--coral)' }}>Obstáculos</span>
                    <span style={{ color: 'var(--gold)' }}>Margem</span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Área Total', value: `${formatNumber(resultado.areaTotal, 1)} m²`, color: 'var(--text-1)' },
                    { label: 'Obstáculos', value: `-${formatNumber(resultado.areaObstaculos, 1)} m²`, color: 'var(--coral)' },
                    { label: 'Margem de Borda', value: `-${formatNumber(resultado.margemBorda, 1)} m²`, color: 'var(--gold)' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{item.label}</span>
                      <span className="mono" style={{ fontSize: '0.85rem', color: item.color, fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', padding: '12px',
                    background: 'var(--green-dim)', borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--green-border)',
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--green)' }}>Área Útil</span>
                    <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>
                      {formatNumber(resultado.areaUtil, 1)} m²
                    </span>
                  </div>
                </div>

                {/* Aproveitamento */}
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {formatNumber(resultado.aproveitamento, 1)}%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Aproveitamento da área</div>
                </div>
              </Card>

              {/* Panel results */}
              <Card>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Capacidade Estimada</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)' }}>
                      {resultado.quantidade}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>Painéis Solares</div>
                  </div>

                  {[
                    { label: 'Potência Total', value: `${formatNumber(resultado.potenciaKWp, 2)} kWp` },
                    { label: 'Geração Estimada', value: `${formatNumber(resultado.geracaoEstimada, 0)} kWh/mês` },
                    { label: 'Área Ocupada', value: `${formatNumber(resultado.areaOcupada, 1)} m²` },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{item.label}</span>
                      <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Warnings */}
              {resultado.aproveitamento < 50 && (
                <Card style={{ borderColor: 'var(--coral)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} color="var(--coral)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--coral)', marginBottom: '4px' }}>
                        Aproveitamento Baixo
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                        A quantidade de obstáculos reduz significativamente a área útil.
                        Considere remover ou realocar alguns obstáculos para melhorar o aproveitamento.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Grid3X3 size={48} color="var(--text-3)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-2)' }}>
                  Configure sua Área
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Insira as dimensões do telhado e marque os obstáculos encontrados para calcular
                  a área útil disponível para instalação solar.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
