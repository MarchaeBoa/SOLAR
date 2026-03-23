import React, { useState } from 'react';
import { Map, Layers, Filter, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import Card from '../components/Card';

const regioes = [
  { nome: 'Norte', irradiacao: 5.5, cor: '#F0C96B', x: '40%', y: '22%' },
  { nome: 'Nordeste', irradiacao: 5.8, cor: '#D4A843', x: '72%', y: '28%' },
  { nome: 'Centro-Oeste', irradiacao: 5.4, cor: '#F0C96B', x: '48%', y: '48%' },
  { nome: 'Sudeste', irradiacao: 4.8, cor: '#1FD8A4', x: '62%', y: '60%' },
  { nome: 'Sul', irradiacao: 4.3, cor: '#4A9EFF', x: '50%', y: '78%' },
];

const camadas = [
  { id: 'irradiacao', label: 'Irradiação Solar', ativo: true },
  { id: 'temperatura', label: 'Temperatura', ativo: false },
  { id: 'nebulosidade', label: 'Nebulosidade', ativo: false },
  { id: 'topografia', label: 'Topografia', ativo: false },
];

export default function MapaSolar() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [camadaAtiva, setCamadaAtiva] = useState(camadas);

  const toggleCamada = (id) => {
    setCamadaAtiva(prev =>
      prev.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c)
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Mapa Solar</h1>
        <p>Visualize a irradiação solar em todo o território brasileiro</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Map area */}
        <Card style={{ position: 'relative', minHeight: '520px', overflow: 'hidden' }}>
          {/* Map placeholder - visual representation */}
          <div style={{
            position: 'absolute',
            inset: '24px',
            background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--bg-elevated) 100%)',
            borderRadius: 'var(--r)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            {/* Grid lines */}
            <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.1 }}>
              {Array.from({ length: 20 }, (_, i) => (
                <React.Fragment key={i}>
                  <line x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="var(--text-1)" strokeWidth="0.5" />
                  <line x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="var(--text-1)" strokeWidth="0.5" />
                </React.Fragment>
              ))}
            </svg>

            {/* Region markers */}
            {regioes.map((r, i) => (
              <button
                key={i}
                onClick={() => setRegiaoSelecionada(r)}
                style={{
                  position: 'absolute',
                  left: r.x,
                  top: r.y,
                  transform: 'translate(-50%, -50%)',
                  background: `${r.cor}22`,
                  border: `2px solid ${r.cor}`,
                  borderRadius: '50%',
                  width: regiaoSelecionada?.nome === r.nome ? '54px' : '44px',
                  height: regiaoSelecionada?.nome === r.nome ? '54px' : '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--t)',
                  zIndex: 2,
                }}
              >
                <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: r.cor }}>
                  {r.irradiacao}
                </span>
              </button>
            ))}

            {/* Label overlay */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              display: 'flex',
              gap: '16px',
              fontSize: '0.7rem',
              color: 'var(--text-3)',
            }}>
              <span>Irradiação: kWh/m²/dia</span>
              <span>Fonte: INPE/Atlas Solar</span>
            </div>
          </div>

          {/* Map controls */}
          <div style={{
            position: 'absolute',
            top: '36px',
            right: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 3,
          }}>
            {[ZoomIn, ZoomOut, Crosshair].map((Icon, i) => (
              <button key={i} style={{
                width: 36,
                height: 36,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-2)',
              }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </Card>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Layers */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Camadas</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {camadaAtiva.map((c) => (
                <label key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: c.ativo ? 'var(--bg-elevated)' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all var(--t)',
                }}>
                  <input
                    type="checkbox"
                    checked={c.ativo}
                    onChange={() => toggleCamada(c.id)}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </Card>

          {/* Region info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Filter size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {regiaoSelecionada ? regiaoSelecionada.nome : 'Selecione uma região'}
              </h3>
            </div>

            {regiaoSelecionada ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Irradiação Média
                  </div>
                  <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: regiaoSelecionada.cor }}>
                    {regiaoSelecionada.irradiacao} kWh/m²/dia
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  A região {regiaoSelecionada.nome} possui uma irradiação média de{' '}
                  <strong style={{ color: 'var(--text-1)' }}>{regiaoSelecionada.irradiacao} kWh/m²/dia</strong>,
                  {regiaoSelecionada.irradiacao >= 5.5
                    ? ' uma das melhores do Brasil para geração solar.'
                    : regiaoSelecionada.irradiacao >= 4.5
                    ? ' com bom potencial para geração de energia solar.'
                    : ' com potencial moderado para geração solar.'}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Clique em um marcador no mapa para ver detalhes da região.
              </p>
            )}
          </Card>

          {/* Legend */}
          <Card>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Legenda</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { cor: '#D4A843', label: 'Alta (>5.5 kWh/m²)' },
                { cor: '#F0C96B', label: 'Média-Alta (5.0-5.5)' },
                { cor: '#1FD8A4', label: 'Média (4.5-5.0)' },
                { cor: '#4A9EFF', label: 'Moderada (<4.5)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '3px', background: item.cor, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-2)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
