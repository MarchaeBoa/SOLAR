import React from 'react';
import { Sun, Zap, DollarSign, Leaf, TrendingUp, FolderOpen, ArrowRight, Map, FileText, CreditCard, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/Card';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatNumber, formatEnergy, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const d = state.dashboard;
  const resultado = state.simulacao.resultado;
  const kitSelecionado = state.kitSelecionado;

  const chartData = [
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

  const maxVal = Math.max(...chartData.map(d => d.valor));

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral da sua plataforma solar</p>
      </div>

      {/* Active simulation/kit summary banner */}
      {(resultado || kitSelecionado) && (
        <div style={{
          padding: '16px 20px',
          marginBottom: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--gold-border)',
          borderRadius: 'var(--r)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={20} color="var(--gold)" />
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: '2px' }}>
                {kitSelecionado ? 'Kit Selecionado' : 'Última Simulação'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                {kitSelecionado
                  ? `${kitSelecionado.nome} — ${formatCurrency(kitSelecionado.preco)}`
                  : `${resultado.potenciaKWp} kWp — ${formatNumber(resultado.geracaoMensal)} kWh/mês — ${formatCurrency(resultado.economiaMensal)}/mês`
                }
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/orcamento')}
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <FileText size={14} /> Orçamento
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/financiamento')}
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <CreditCard size={14} /> Financiamento
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Geração Hoje"
          value={`${formatNumber(d.geracaoHoje, 1)} kWh`}
          change="12.5% vs ontem"
          positive
          icon={Sun}
          color="var(--gold)"
        />
        <StatCard
          label="Geração Mensal"
          value={formatEnergy(d.geracaoMes)}
          change="8.2% vs mês anterior"
          positive
          icon={Zap}
          color="var(--green)"
        />
        <StatCard
          label="Economia Total"
          value={formatCurrency(d.economiaTotal)}
          change="R$ 2.340 este mês"
          positive
          icon={DollarSign}
          color="var(--gold)"
        />
        <StatCard
          label="CO₂ Evitado"
          value={`${formatNumber(d.co2Evitado, 1)} ton`}
          change="Equivalente a 48 árvores"
          positive
          icon={Leaf}
          color="var(--green)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Geração Mensal Chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Geração Mensal</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>kWh produzidos por mês</p>
            </div>
            <span className="tag tag-green">+15.2%</span>
          </div>
          {/* Simple bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px' }}>
            {chartData.map((item, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${(item.valor / maxVal) * 140}px`,
                    background: i === chartData.length - 1
                      ? 'var(--gold)'
                      : 'var(--bg-elevated)',
                    borderRadius: '4px 4px 0 0',
                    border: '1px solid var(--border-mid)',
                    transition: 'all var(--t)',
                  }}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>
                  {item.mes}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Status */}
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Status do Sistema</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Performance em tempo real</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Eficiência dos Painéis', value: d.eficiencia, color: 'var(--green)' },
              { label: 'Capacidade do Inversor', value: 87.5, color: 'var(--gold)' },
              { label: 'Saúde da Bateria', value: 96.0, color: 'var(--green)' },
              { label: 'Rede Elétrica', value: 100, color: 'var(--blue)' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{item.label}</span>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {formatPercent(item.value)}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: 'var(--bg-base)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${item.value}%`,
                    background: item.color,
                    borderRadius: '99px',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Projetos Ativos</h3>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
              {d.projetosAtivos}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { nome: 'Residência Vila Madalena', status: 'Em instalação', potencia: '8.4 kWp' },
              { nome: 'Comércio Pinheiros', status: 'Análise técnica', potencia: '22.0 kWp' },
              { nome: 'Indústria Guarulhos', status: 'Concluído', potencia: '150 kWp' },
            ].map((proj, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{proj.nome}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{proj.status}</div>
                </div>
                <span className="mono tag tag-gold">{proj.potencia}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Ações Rápidas</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: Zap, label: 'Nova Simulação', desc: 'Calcular potencial solar', path: '/simulacao' },
              { icon: Map, label: 'Mapa Solar', desc: 'Selecionar área no mapa', path: '/mapa' },
              { icon: Package, label: 'Kits Solares', desc: 'Ver kits disponíveis', path: '/kits' },
              { icon: FileText, label: 'Orçamento', desc: 'Montar orçamento', path: '/orcamento' },
            ].map((action, i) => (
              <button key={i} onClick={() => navigate(action.path)} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '20px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r)',
                cursor: 'pointer',
                color: 'var(--text-1)',
                transition: 'all var(--t)',
                fontFamily: 'Outfit, sans-serif',
              }}>
                <action.icon size={22} color="var(--gold)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{action.label}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{action.desc}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
