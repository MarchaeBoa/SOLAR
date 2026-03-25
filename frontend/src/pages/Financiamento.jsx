import React, { useState } from 'react';
import {
  DollarSign, Calculator, TrendingUp, TrendingDown,
  CreditCard, Banknote, BarChart3, ArrowRight,
  CheckCircle, AlertTriangle, Clock, PiggyBank,
} from 'lucide-react';
import Card from '../components/Card';
import { useRegional } from '../context/RegionalContext';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color: 'var(--text-1)',
  fontFamily: 'Outfit, sans-serif',
  fontSize: '0.9rem',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-2)',
  marginBottom: '6px',
};

const kpiBoxStyle = {
  padding: '16px',
  background: 'var(--bg-elevated)',
  borderRadius: 'var(--r-sm)',
  textAlign: 'center',
};

const kpiLabelStyle = { fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px' };
const kpiValueStyle = { fontSize: '1.3rem', fontWeight: 700 };

export default function Financiamento() {
  const { formatPrice, currency } = useRegional();

  const [form, setForm] = useState({
    valorSistema: '',
    entrada: '',
    taxaJurosMensal: '1.49',
    prazoMeses: '60',
    economiaMensal: '',
    descontoAVista: '5',
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [showCronograma, setShowCronograma] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const simular = async () => {
    setErro(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/simulacao/financiamento`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            valorSistema: parseFloat(form.valorSistema),
            entrada: parseFloat(form.entrada) || 0,
            taxaJurosMensal: parseFloat(form.taxaJurosMensal),
            prazoMeses: parseInt(form.prazoMeses),
            economiaMensal: parseFloat(form.economiaMensal) || 0,
            descontoAVista: parseFloat(form.descontoAVista) || 5,
          }),
        }
      );
      const data = await res.json();
      if (data.error) {
        setErro(data.error);
        setResultado(null);
      } else {
        setResultado(data);
      }
    } catch (err) {
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const recBadge = (rec) => {
    const map = {
      a_vista_fortemente_recomendado: { label: 'A vista fortemente recomendado', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
      a_vista_recomendado: { label: 'A vista recomendado', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      financiamento_viavel: { label: 'Financiamento viavel', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    };
    const info = map[rec] || map.financiamento_viavel;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 14px', borderRadius: '20px',
        background: info.bg, color: info.color,
        fontSize: '0.8rem', fontWeight: 700,
      }}>
        <CheckCircle size={14} />
        {info.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
          Simulador de Financiamento
        </h2>
        <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
          Compare financiamento com pagamento a vista e veja o impacto no retorno do investimento.
        </p>
      </div>

      {/* Formulário */}
      <Card>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', padding: '4px',
        }}>
          <div>
            <label style={labelStyle}>
              <DollarSign size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Valor do Sistema ({currency.code})
            </label>
            <input
              type="number" style={inputStyle}
              placeholder="Ex: 35000"
              value={form.valorSistema}
              onChange={e => handleChange('valorSistema', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <Banknote size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Entrada ({currency.code})
            </label>
            <input
              type="number" style={inputStyle}
              placeholder="Ex: 7000 (ou 0)"
              value={form.entrada}
              onChange={e => handleChange('entrada', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Taxa de Juros Mensal (%)
            </label>
            <input
              type="number" step="0.01" style={inputStyle}
              placeholder="Ex: 1.49"
              value={form.taxaJurosMensal}
              onChange={e => handleChange('taxaJurosMensal', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Prazo (meses)
            </label>
            <select
              style={inputStyle}
              value={form.prazoMeses}
              onChange={e => handleChange('prazoMeses', e.target.value)}
            >
              {[12, 24, 36, 48, 60, 72, 84, 96, 120].map(m => (
                <option key={m} value={m}>{m} meses ({(m / 12).toFixed(0)} anos)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <PiggyBank size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Economia Mensal Solar ({currency.code})
            </label>
            <input
              type="number" style={inputStyle}
              placeholder="Opcional - para calcular ROI"
              value={form.economiaMensal}
              onChange={e => handleChange('economiaMensal', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <Banknote size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Desconto a Vista (%)
            </label>
            <input
              type="number" step="0.5" style={inputStyle}
              placeholder="Ex: 5"
              value={form.descontoAVista}
              onChange={e => handleChange('descontoAVista', e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={simular}
          disabled={loading || !form.valorSistema || !form.taxaJurosMensal}
          style={{
            marginTop: '20px', width: '100%',
            padding: '12px', borderRadius: 'var(--r-sm)',
            background: 'var(--gold)', color: '#000',
            border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.95rem',
            fontFamily: 'Outfit, sans-serif',
            opacity: loading ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <Calculator size={18} />
          {loading ? 'Calculando...' : 'Simular Financiamento'}
        </button>

        {erro && (
          <div style={{
            marginTop: '12px', padding: '12px', borderRadius: 'var(--r-sm)',
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertTriangle size={16} /> {erro}
          </div>
        )}
      </Card>

      {/* Resultados */}
      {resultado && (
        <>
          {/* KPIs principais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <Card>
              <div style={kpiBoxStyle}>
                <div style={kpiLabelStyle}>Parcela Mensal</div>
                <div style={{ ...kpiValueStyle, color: 'var(--gold)' }}>
                  {formatPrice(resultado.financiamento.parcela)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  {resultado.entrada.prazoMeses}x fixas
                </div>
              </div>
            </Card>

            <Card>
              <div style={kpiBoxStyle}>
                <div style={kpiLabelStyle}>Custo Total Financiado</div>
                <div style={{ ...kpiValueStyle, color: '#ef4444' }}>
                  {formatPrice(resultado.financiamento.custoTotal)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  Juros: {formatPrice(resultado.financiamento.jurosTotal)} ({resultado.financiamento.percentualJuros}%)
                </div>
              </div>
            </Card>

            <Card>
              <div style={kpiBoxStyle}>
                <div style={kpiLabelStyle}>Valor a Vista</div>
                <div style={{ ...kpiValueStyle, color: '#22c55e' }}>
                  {formatPrice(resultado.aVista.valorComDesconto)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  {resultado.aVista.descontoPercent}% desconto
                </div>
              </div>
            </Card>

            <Card>
              <div style={kpiBoxStyle}>
                <div style={kpiLabelStyle}>Economia vs Financiamento</div>
                <div style={{ ...kpiValueStyle, color: '#22c55e' }}>
                  {formatPrice(resultado.aVista.economiaVsFinanciamento)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  {resultado.comparativo.percentualMaisCaro}% mais caro financiado
                </div>
              </div>
            </Card>
          </div>

          {/* Comparativo lado a lado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'start' }}>
            {/* A Vista */}
            <Card>
              <div style={{ padding: '4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)',
                }}>
                  <Banknote size={22} color="#22c55e" />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Pagamento a Vista</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Pagamento unico</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Valor original</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(resultado.entrada.valorSistema)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Desconto ({resultado.aVista.descontoPercent}%)</span>
                    <span style={{ fontWeight: 500, color: '#22c55e' }}>
                      -{formatPrice(resultado.entrada.valorSistema - resultado.aVista.valorComDesconto)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0', borderTop: '1px solid var(--border)', fontWeight: 700,
                  }}>
                    <span>Total</span>
                    <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>
                      {formatPrice(resultado.aVista.valorComDesconto)}
                    </span>
                  </div>
                  {resultado.impactoROI && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>ROI (25 anos)</span>
                        <span style={{ fontWeight: 600, color: '#22c55e' }}>{resultado.impactoROI.roiAVista}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Payback</span>
                        <span style={{ fontWeight: 500 }}>{resultado.impactoROI.paybackAVistaAnos} anos</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* VS */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', paddingTop: '60px', gap: '8px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-3)',
              }}>
                VS
              </div>
              {recBadge(resultado.comparativo.recomendacao)}
            </div>

            {/* Financiado */}
            <Card>
              <div style={{ padding: '4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)',
                }}>
                  <CreditCard size={22} color="#f59e0b" />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Financiamento</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      {resultado.entrada.prazoMeses}x de {formatPrice(resultado.financiamento.parcela)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Entrada</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(resultado.entrada.entrada)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Valor financiado</span>
                    <span style={{ fontWeight: 500 }}>{formatPrice(resultado.entrada.valorFinanciado)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Taxa efetiva anual</span>
                    <span style={{ fontWeight: 500 }}>{resultado.entrada.taxaEfetivaAnual}% a.a.</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Total em juros</span>
                    <span style={{ fontWeight: 500, color: '#ef4444' }}>
                      +{formatPrice(resultado.financiamento.jurosTotal)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0', borderTop: '1px solid var(--border)', fontWeight: 700,
                  }}>
                    <span>Custo Total</span>
                    <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                      {formatPrice(resultado.financiamento.custoTotal)}
                    </span>
                  </div>
                  {resultado.impactoROI && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>ROI (25 anos)</span>
                        <span style={{ fontWeight: 600, color: '#f59e0b' }}>{resultado.impactoROI.roiFinanciado}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Payback</span>
                        <span style={{ fontWeight: 500 }}>{resultado.impactoROI.paybackFinanciadoAnos} anos</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Fluxo liquido/mes</span>
                        <span style={{
                          fontWeight: 600,
                          color: resultado.impactoROI.fluxoLiquidoDuranteFinanciamento >= 0 ? '#22c55e' : '#ef4444',
                        }}>
                          {formatPrice(resultado.impactoROI.fluxoLiquidoDuranteFinanciamento)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Impacto no ROI */}
          {resultado.impactoROI && (
            <Card>
              <div style={{ padding: '4px' }}>
                <h3 style={{
                  fontSize: '1rem', fontWeight: 700, marginBottom: '16px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <BarChart3 size={18} color="var(--gold)" />
                  Impacto no ROI
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Barra ROI */}
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>ROI a Vista</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>{resultado.impactoROI.roiAVista}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '4px', background: '#22c55e',
                          width: `${Math.min(100, (resultado.impactoROI.roiAVista / Math.max(resultado.impactoROI.roiAVista, resultado.impactoROI.roiFinanciado)) * 100)}%`,
                        }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>ROI Financiado</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>{resultado.impactoROI.roiFinanciado}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '4px', background: '#f59e0b',
                          width: `${Math.min(100, (resultado.impactoROI.roiFinanciado / Math.max(resultado.impactoROI.roiAVista, resultado.impactoROI.roiFinanciado)) * 100)}%`,
                        }} />
                      </div>
                    </div>
                  </div>
                  {/* Dados numéricos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ ...kpiBoxStyle, padding: '12px' }}>
                      <div style={{ ...kpiLabelStyle, fontSize: '0.7rem' }}>Diferenca ROI</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                        {(resultado.impactoROI.roiAVista - resultado.impactoROI.roiFinanciado).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ ...kpiBoxStyle, padding: '12px' }}>
                      <div style={{ ...kpiLabelStyle, fontSize: '0.7rem' }}>Payback a Mais</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                        +{(resultado.impactoROI.paybackFinanciadoAnos - resultado.impactoROI.paybackAVistaAnos).toFixed(1)} anos
                      </div>
                    </div>
                    <div style={{ ...kpiBoxStyle, padding: '12px' }}>
                      <div style={{ ...kpiLabelStyle, fontSize: '0.7rem' }}>Economia Mensal</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                        {formatPrice(resultado.impactoROI.economiaMensal)}
                      </div>
                    </div>
                    <div style={{ ...kpiBoxStyle, padding: '12px' }}>
                      <div style={{ ...kpiLabelStyle, fontSize: '0.7rem' }}>Fluxo Liquido</div>
                      <div style={{
                        fontSize: '1rem', fontWeight: 700,
                        color: resultado.impactoROI.fluxoLiquidoDuranteFinanciamento >= 0 ? '#22c55e' : '#ef4444',
                      }}>
                        {formatPrice(resultado.impactoROI.fluxoLiquidoDuranteFinanciamento)}/mes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Cronograma de parcelas */}
          <Card>
            <div style={{ padding: '4px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} color="var(--gold)" />
                  Cronograma de Parcelas
                </h3>
                <button
                  onClick={() => setShowCronograma(!showCronograma)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-2)', cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem',
                  }}
                >
                  {showCronograma ? 'Ocultar' : 'Exibir'} ({resultado.cronograma.length} parcelas)
                </button>
              </div>

              {showCronograma && (
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem',
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg-surface)' }}>
                        {['Mes', 'Parcela', 'Juros', 'Amortizacao', 'Saldo Devedor',
                          ...(resultado.impactoROI ? ['Economia', 'Fluxo Liq.'] : [])
                        ].map(h => (
                          <th key={h} style={{
                            textAlign: 'right', padding: '8px 10px',
                            fontWeight: 600, color: 'var(--text-3)', fontSize: '0.75rem',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.cronograma.map((row) => (
                        <tr key={row.mes} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{row.mes}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right' }}>{formatPrice(row.parcela)}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#ef4444' }}>{formatPrice(row.juros)}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', color: '#22c55e' }}>{formatPrice(row.amortizacao)}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right' }}>{formatPrice(row.saldoDevedor)}</td>
                          {resultado.impactoROI && (
                            <>
                              <td style={{ padding: '6px 10px', textAlign: 'right', color: '#22c55e' }}>
                                {row.economiaMensal != null ? formatPrice(row.economiaMensal) : '-'}
                              </td>
                              <td style={{
                                padding: '6px 10px', textAlign: 'right', fontWeight: 600,
                                color: row.fluxoLiquido != null && row.fluxoLiquido >= 0 ? '#22c55e' : '#ef4444',
                              }}>
                                {row.fluxoLiquido != null ? formatPrice(row.fluxoLiquido) : '-'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
