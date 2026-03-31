import React, { useState, useMemo } from 'react';
import { MapPin, DollarSign, TrendingDown, TrendingUp, BarChart3, Search, ArrowUpDown, Package, Zap, Wrench } from 'lucide-react';
import Card from '../components/Card';
import { formatCurrency, formatNumber } from '../utils/formatters';

const REGIOES_DADOS = [
  {
    estado: 'SP', cidade: 'São Paulo', regiao: 'Sudeste',
    custoKWp: 4200, tarifaEnergia: 0.92, custoInstalacao: 4500,
    irradiacao: 4.6, fornecedores: 48, nota: 4.5,
  },
  {
    estado: 'RJ', cidade: 'Rio de Janeiro', regiao: 'Sudeste',
    custoKWp: 4350, tarifaEnergia: 0.98, custoInstalacao: 4800,
    irradiacao: 4.8, fornecedores: 32, nota: 4.3,
  },
  {
    estado: 'MG', cidade: 'Belo Horizonte', regiao: 'Sudeste',
    custoKWp: 4100, tarifaEnergia: 0.88, custoInstalacao: 4200,
    irradiacao: 5.1, fornecedores: 28, nota: 4.6,
  },
  {
    estado: 'BA', cidade: 'Salvador', regiao: 'Nordeste',
    custoKWp: 4500, tarifaEnergia: 0.82, custoInstalacao: 5000,
    irradiacao: 5.6, fornecedores: 18, nota: 4.2,
  },
  {
    estado: 'PE', cidade: 'Recife', regiao: 'Nordeste',
    custoKWp: 4600, tarifaEnergia: 0.79, custoInstalacao: 5200,
    irradiacao: 5.7, fornecedores: 15, nota: 4.1,
  },
  {
    estado: 'CE', cidade: 'Fortaleza', regiao: 'Nordeste',
    custoKWp: 4550, tarifaEnergia: 0.76, custoInstalacao: 5100,
    irradiacao: 5.9, fornecedores: 14, nota: 4.0,
  },
  {
    estado: 'DF', cidade: 'Brasília', regiao: 'Centro-Oeste',
    custoKWp: 4300, tarifaEnergia: 0.80, custoInstalacao: 4400,
    irradiacao: 5.3, fornecedores: 22, nota: 4.4,
  },
  {
    estado: 'GO', cidade: 'Goiânia', regiao: 'Centro-Oeste',
    custoKWp: 4250, tarifaEnergia: 0.78, custoInstalacao: 4300,
    irradiacao: 5.4, fornecedores: 16, nota: 4.3,
  },
  {
    estado: 'PR', cidade: 'Curitiba', regiao: 'Sul',
    custoKWp: 4150, tarifaEnergia: 0.85, custoInstalacao: 4100,
    irradiacao: 4.3, fornecedores: 26, nota: 4.7,
  },
  {
    estado: 'RS', cidade: 'Porto Alegre', regiao: 'Sul',
    custoKWp: 4200, tarifaEnergia: 0.83, custoInstalacao: 4200,
    irradiacao: 4.2, fornecedores: 24, nota: 4.5,
  },
  {
    estado: 'SC', cidade: 'Florianópolis', regiao: 'Sul',
    custoKWp: 4180, tarifaEnergia: 0.81, custoInstalacao: 4150,
    irradiacao: 4.1, fornecedores: 20, nota: 4.6,
  },
  {
    estado: 'AM', cidade: 'Manaus', regiao: 'Norte',
    custoKWp: 5200, tarifaEnergia: 0.90, custoInstalacao: 6500,
    irradiacao: 5.0, fornecedores: 6, nota: 3.8,
  },
  {
    estado: 'PA', cidade: 'Belém', regiao: 'Norte',
    custoKWp: 5100, tarifaEnergia: 0.88, custoInstalacao: 6200,
    irradiacao: 5.1, fornecedores: 8, nota: 3.9,
  },
  {
    estado: 'MT', cidade: 'Cuiabá', regiao: 'Centro-Oeste',
    custoKWp: 4400, tarifaEnergia: 0.77, custoInstalacao: 4600,
    irradiacao: 5.5, fornecedores: 12, nota: 4.1,
  },
  {
    estado: 'MS', cidade: 'Campo Grande', regiao: 'Centro-Oeste',
    custoKWp: 4350, tarifaEnergia: 0.76, custoInstalacao: 4500,
    irradiacao: 5.3, fornecedores: 10, nota: 4.2,
  },
];

const EQUIPAMENTOS = [
  { nome: 'Painel 550W Mono PERC', tipo: 'painel', precoBase: 1150, marca: 'Canadian Solar' },
  { nome: 'Painel 450W Poli', tipo: 'painel', precoBase: 890, marca: 'Trina Solar' },
  { nome: 'Painel 600W Bifacial', tipo: 'painel', precoBase: 1450, marca: 'LONGi' },
  { nome: 'Inversor String 5kW', tipo: 'inversor', precoBase: 4200, marca: 'Growatt' },
  { nome: 'Inversor String 10kW', tipo: 'inversor', precoBase: 7800, marca: 'Fronius' },
  { nome: 'Microinversor 1.5kW', tipo: 'inversor', precoBase: 2400, marca: 'Enphase' },
  { nome: 'Estrutura Telhado Cerâmico', tipo: 'estrutura', precoBase: 320, marca: 'Romagnole' },
  { nome: 'Estrutura Telhado Metálico', tipo: 'estrutura', precoBase: 280, marca: 'Romagnole' },
  { nome: 'String Box CC/CA', tipo: 'protecao', precoBase: 450, marca: 'Clamper' },
];

function calcularMultiplicadorRegional(estado) {
  const multiplicadores = {
    SP: 1.0, RJ: 1.05, MG: 0.98, BA: 1.08, PE: 1.10, CE: 1.09,
    DF: 1.03, GO: 1.02, PR: 0.99, RS: 1.01, SC: 1.0,
    AM: 1.25, PA: 1.22, MT: 1.06, MS: 1.04,
  };
  return multiplicadores[estado] || 1.0;
}

function calcularPayback(custoTotal, economiaMensal) {
  if (economiaMensal <= 0) return 999;
  return custoTotal / economiaMensal;
}

export default function OrcamentoRegional() {
  const [busca, setBusca] = useState('');
  const [regiaoFiltro, setRegiaoFiltro] = useState('Todas');
  const [ordenacao, setOrdenacao] = useState('custoKWp');
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [potenciaKWp, setPotenciaKWp] = useState(5);

  const regioes = ['Todas', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

  const dadosFiltrados = useMemo(() => {
    let dados = REGIOES_DADOS.filter(d => {
      if (regiaoFiltro !== 'Todas' && d.regiao !== regiaoFiltro) return false;
      if (busca && !d.cidade.toLowerCase().includes(busca.toLowerCase()) &&
          !d.estado.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });

    dados.sort((a, b) => {
      const va = a[ordenacao];
      const vb = b[ordenacao];
      return ordemAsc ? va - vb : vb - va;
    });

    return dados;
  }, [busca, regiaoFiltro, ordenacao, ordemAsc]);

  const mediaNacional = useMemo(() => {
    const total = REGIOES_DADOS.reduce((acc, d) => acc + d.custoKWp, 0);
    return total / REGIOES_DADOS.length;
  }, []);

  const toggleOrdenacao = (campo) => {
    if (ordenacao === campo) {
      setOrdemAsc(!ordemAsc);
    } else {
      setOrdenacao(campo);
      setOrdemAsc(true);
    }
  };

  const SortIcon = ({ campo }) => (
    <ArrowUpDown
      size={12}
      style={{
        opacity: ordenacao === campo ? 1 : 0.3,
        transform: ordenacao === campo && !ordemAsc ? 'scaleY(-1)' : 'none',
      }}
    />
  );

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
        <h1>Orçamento por Região</h1>
        <p>Preços de equipamentos e instalação por cidade com comparativo de fornecedores</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Left: Table and filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters */}
          <Card>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar cidade ou estado..."
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {regioes.map(r => (
                  <button
                    key={r}
                    onClick={() => setRegiaoFiltro(r)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${regiaoFiltro === r ? 'var(--gold-border)' : 'var(--border-mid)'}`,
                      background: regiaoFiltro === r ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                      color: regiaoFiltro === r ? 'var(--gold)' : 'var(--text-2)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Price comparison table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    {[
                      { campo: 'cidade', label: 'Cidade' },
                      { campo: 'custoKWp', label: 'R$/kWp' },
                      { campo: 'tarifaEnergia', label: 'Tarifa' },
                      { campo: 'custoInstalacao', label: 'Instalação' },
                      { campo: 'irradiacao', label: 'Irrad.' },
                      { campo: 'fornecedores', label: 'Fornec.' },
                    ].map(col => (
                      <th
                        key={col.campo}
                        onClick={() => col.campo !== 'cidade' && toggleOrdenacao(col.campo)}
                        style={{
                          padding: '14px 16px',
                          textAlign: col.campo === 'cidade' ? 'left' : 'right',
                          color: 'var(--text-2)',
                          fontWeight: 600,
                          cursor: col.campo !== 'cidade' ? 'pointer' : 'default',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {col.label}
                          {col.campo !== 'cidade' && <SortIcon campo={col.campo} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((d, i) => {
                    const diff = ((d.custoKWp - mediaNacional) / mediaNacional) * 100;
                    const isSelected = cidadeSelecionada?.estado === d.estado;
                    return (
                      <tr
                        key={d.estado}
                        onClick={() => setCidadeSelecionada(d)}
                        style={{
                          background: isSelected ? 'var(--gold-dim)' : i % 2 === 0 ? 'transparent' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-surface)'; }}
                      >
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ fontWeight: 600 }}>{d.cidade}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{d.estado} · {d.regiao}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                          <div className="mono" style={{ fontWeight: 600 }}>{formatCurrency(d.custoKWp)}</div>
                          <div style={{ fontSize: '0.7rem', color: diff > 0 ? 'var(--coral)' : 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                            {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {diff > 0 ? '+' : ''}{formatNumber(diff, 1)}%
                          </div>
                        </td>
                        <td className="mono" style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }}>
                          {formatCurrency(d.tarifaEnergia)}/kWh
                        </td>
                        <td className="mono" style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }}>
                          {formatCurrency(d.custoInstalacao)}
                        </td>
                        <td className="mono" style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)', color: d.irradiacao >= 5.5 ? 'var(--gold)' : d.irradiacao >= 4.5 ? 'var(--green)' : 'var(--blue)' }}>
                          {d.irradiacao} kWh/m²
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                          <span className="mono">{d.fornecedores}</span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2px', marginTop: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <div key={s} style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: s <= Math.round(d.nota) ? 'var(--gold)' : 'var(--border-mid)',
                              }} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {dadosFiltrados.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                Nenhuma cidade encontrada com os filtros selecionados.
              </div>
            )}
          </Card>
        </div>

        {/* Right: Details panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Simulation config */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Simular Sistema</h3>
            </div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
              Potência desejada (kWp)
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={potenciaKWp}
              onChange={e => setPotenciaKWp(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold)', marginBottom: '4px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-3)' }}>
              <span>1 kWp</span>
              <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.88rem' }}>
                {formatNumber(potenciaKWp, 1)} kWp
              </span>
              <span>50 kWp</span>
            </div>
          </Card>

          {cidadeSelecionada ? (
            <>
              {/* City detail */}
              <Card style={{ borderColor: 'var(--gold-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <MapPin size={18} color="var(--gold)" />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{cidadeSelecionada.cidade}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      {cidadeSelecionada.estado} · {cidadeSelecionada.regiao}
                    </div>
                  </div>
                </div>

                {/* Cost breakdown for selected kWp */}
                {(() => {
                  const mult = calcularMultiplicadorRegional(cidadeSelecionada.estado);
                  const custoEquipamento = cidadeSelecionada.custoKWp * potenciaKWp;
                  const custoInstalacao = cidadeSelecionada.custoInstalacao * (1 + (potenciaKWp - 1) * 0.15);
                  const custoTotal = custoEquipamento + custoInstalacao;
                  const geracaoMensal = potenciaKWp * cidadeSelecionada.irradiacao * 30 * 0.8;
                  const economiaMensal = geracaoMensal * cidadeSelecionada.tarifaEnergia;
                  const paybackMeses = calcularPayback(custoTotal, economiaMensal);
                  const economiaAnual = economiaMensal * 12;
                  const retorno25Anos = (economiaMensal * 12 * 25) - custoTotal;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{
                        padding: '16px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--r-sm)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Investimento Total
                        </div>
                        <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)' }}>
                          {formatCurrency(custoTotal)}
                        </div>
                      </div>

                      {[
                        { icon: Package, label: 'Equipamentos', value: formatCurrency(custoEquipamento), sub: `${formatCurrency(cidadeSelecionada.custoKWp)}/kWp` },
                        { icon: Wrench, label: 'Instalação', value: formatCurrency(custoInstalacao) },
                        { icon: Zap, label: 'Geração Mensal', value: `${formatNumber(geracaoMensal, 0)} kWh`, color: 'var(--green)' },
                        { icon: DollarSign, label: 'Economia Mensal', value: formatCurrency(economiaMensal), color: 'var(--green)' },
                        { icon: DollarSign, label: 'Economia Anual', value: formatCurrency(economiaAnual), color: 'var(--green)' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                          background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                        }}>
                          <item.icon size={16} color={item.color || 'var(--text-3)'} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{item.label}</div>
                            {item.sub && <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{item.sub}</div>}
                          </div>
                          <span className="mono" style={{ fontWeight: 600, color: item.color || 'var(--text-1)', fontSize: '0.88rem' }}>
                            {item.value}
                          </span>
                        </div>
                      ))}

                      {/* Payback */}
                      <div style={{
                        padding: '16px',
                        background: 'var(--green-dim)',
                        border: '1px solid var(--green-border)',
                        borderRadius: 'var(--r-sm)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Payback Estimado
                        </div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>
                          {formatNumber(paybackMeses / 12, 1)} anos
                        </div>
                        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '2px' }}>
                          ({formatNumber(paybackMeses, 0)} meses)
                        </div>
                      </div>

                      {/* 25-year return */}
                      <div style={{
                        padding: '12px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--r-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>Retorno em 25 anos</span>
                        <span className="mono" style={{
                          fontWeight: 700,
                          color: retorno25Anos > 0 ? 'var(--green)' : 'var(--coral)',
                        }}>
                          {retorno25Anos > 0 ? '+' : ''}{formatCurrency(retorno25Anos)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </Card>

              {/* Regional equipment prices */}
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BarChart3 size={18} color="var(--gold)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Preços Regionais</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {EQUIPAMENTOS.map((eq, i) => {
                    const mult = calcularMultiplicadorRegional(cidadeSelecionada.estado);
                    const precoRegional = eq.precoBase * mult;
                    const diff = ((precoRegional - eq.precoBase) / eq.precoBase) * 100;
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {eq.nome}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{eq.marca}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="mono" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {formatCurrency(precoRegional)}
                          </div>
                          {diff !== 0 && (
                            <div style={{ fontSize: '0.65rem', color: diff > 0 ? 'var(--coral)' : 'var(--green)' }}>
                              {diff > 0 ? '+' : ''}{formatNumber(diff, 1)}% vs média
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MapPin size={48} color="var(--text-3)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-2)' }}>
                  Selecione uma Cidade
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Clique em uma cidade na tabela para ver os preços detalhados de equipamentos e
                  instalação, além do comparativo com a média nacional.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
