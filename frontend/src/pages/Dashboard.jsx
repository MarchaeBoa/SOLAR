import React from 'react';
import { Sun, Zap, DollarSign, Leaf, TrendingUp, FolderOpen } from 'lucide-react';
import { StatCard } from '../components/Card';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { useRegional } from '../context/RegionalContext';
import { useLanguage } from '../context/LanguageContext';
import { formatNumber, formatEnergy, formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const { state } = useApp();
  const { formatPrice } = useRegional();
  const { t } = useLanguage();
  const d = state.dashboard;

  const monthKeys = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const chartData = [
    { valor: 98 }, { valor: 112 }, { valor: 125 }, { valor: 108 },
    { valor: 95 }, { valor: 82 }, { valor: 78 }, { valor: 88 },
    { valor: 105 }, { valor: 118 }, { valor: 130 }, { valor: 138 },
  ].map((item, i) => ({ ...item, mes: t.simulacao[monthKeys[i]] }));

  const maxVal = Math.max(...chartData.map(d => d.valor));

  return (
    <div>
      <div className="page-header">
        <h1>{t.dashboard.title}</h1>
        <p>{t.dashboard.subtitle}</p>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label={t.dashboard.geracaoHoje}
          value={`${formatNumber(d.geracaoHoje, 1)} kWh`}
          change={t.dashboard.geracaoHojeChange}
          positive
          icon={Sun}
          color="var(--gold)"
        />
        <StatCard
          label={t.dashboard.geracaoMensal}
          value={formatEnergy(d.geracaoMes)}
          change={t.dashboard.geracaoMensalChange}
          positive
          icon={Zap}
          color="var(--green)"
        />
        <StatCard
          label={t.dashboard.economiaTotal}
          value={formatPrice(d.economiaTotal)}
          change={`${formatPrice(2340)} ${t.dashboard.economiaTotalChange}`}
          positive
          icon={DollarSign}
          color="var(--gold)"
        />
        <StatCard
          label={t.dashboard.co2Evitado}
          value={`${formatNumber(d.co2Evitado, 1)} ton`}
          change={t.dashboard.co2Change}
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
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.dashboard.chartTitle}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{t.dashboard.chartSubtitle}</p>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.dashboard.statusTitle}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{t.dashboard.statusSubtitle}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: t.dashboard.eficienciaPaineis, value: d.eficiencia, color: 'var(--green)' },
              { label: t.dashboard.capacidadeInversor, value: 87.5, color: 'var(--gold)' },
              { label: t.dashboard.saudeBateria, value: 96.0, color: 'var(--green)' },
              { label: t.dashboard.redeEletrica, value: 100, color: 'var(--blue)' },
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.dashboard.projetosAtivos}</h3>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
              {d.projetosAtivos}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { nome: t.dashboard.projeto1Nome, status: t.dashboard.projeto1Status, potencia: '8.4 kWp' },
              { nome: t.dashboard.projeto2Nome, status: t.dashboard.projeto2Status, potencia: '22.0 kWp' },
              { nome: t.dashboard.projeto3Nome, status: t.dashboard.projeto3Status, potencia: '150 kWp' },
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
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.dashboard.acoesRapidas}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: Zap, label: t.dashboard.novaSimulacao, desc: t.dashboard.novaSimulacaoDesc },
              { icon: FolderOpen, label: t.dashboard.novoProjeto, desc: t.dashboard.novoProjetoDesc },
              { icon: TrendingUp, label: t.dashboard.relatorios, desc: t.dashboard.relatoriosDesc },
              { icon: Leaf, label: t.dashboard.certificados, desc: t.dashboard.certificadosDesc },
            ].map((action, i) => (
              <button key={i} style={{
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
