import React, { useState, useMemo } from 'react';
import { Sun, Clock, Calendar, MapPin, RotateCcw, ArrowUp, Sunrise, Sunset, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import { formatNumber } from '../utils/formatters';

// Solar position calculations (simplified astronomical model)
function calcularDeclinacaoSolar(diaDoAno) {
  return 23.45 * Math.sin((2 * Math.PI / 365) * (diaDoAno - 81));
}

function calcularAnguloHorario(horaSolar) {
  return 15 * (horaSolar - 12);
}

function calcularAltitudeSolar(latRad, declRad, angHorRad) {
  const sinAlt = Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(angHorRad);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt)));
}

function calcularAzimuteSolar(latRad, declRad, altRad, angHorRad) {
  const cosAz = (Math.sin(declRad) - Math.sin(latRad) * Math.sin(altRad)) /
    (Math.cos(latRad) * Math.cos(altRad));
  let azimute = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (angHorRad > 0) azimute = 2 * Math.PI - azimute;
  return azimute;
}

function calcularNascerPor(lat, declinacao) {
  const latRad = (lat * Math.PI) / 180;
  const declRad = (declinacao * Math.PI) / 180;
  const cosH = -Math.tan(latRad) * Math.tan(declRad);
  if (cosH < -1) return { nascer: 0, por: 24, horas: 24 };
  if (cosH > 1) return { nascer: 12, por: 12, horas: 0 };
  const H = Math.acos(cosH) * (180 / Math.PI) / 15;
  return {
    nascer: 12 - H,
    por: 12 + H,
    horas: 2 * H,
  };
}

function calcularAnguloOtimoInclinacao(latitude) {
  const abs = Math.abs(latitude);
  if (abs <= 10) return abs * 0.87;
  if (abs <= 25) return abs * 0.87 + 3.1;
  return abs * 0.76 + 5.2;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_MES = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

const CIDADES_BR = [
  { nome: 'São Paulo - SP', lat: -23.55, lng: -46.63 },
  { nome: 'Rio de Janeiro - RJ', lat: -22.91, lng: -43.17 },
  { nome: 'Belo Horizonte - MG', lat: -19.92, lng: -43.94 },
  { nome: 'Brasília - DF', lat: -15.78, lng: -47.93 },
  { nome: 'Salvador - BA', lat: -12.97, lng: -38.51 },
  { nome: 'Recife - PE', lat: -8.05, lng: -34.87 },
  { nome: 'Manaus - AM', lat: -3.12, lng: -60.02 },
  { nome: 'Curitiba - PR', lat: -25.43, lng: -49.27 },
  { nome: 'Porto Alegre - RS', lat: -30.03, lng: -51.23 },
  { nome: 'Fortaleza - CE', lat: -3.72, lng: -38.53 },
  { nome: 'Goiânia - GO', lat: -16.68, lng: -49.25 },
  { nome: 'Belém - PA', lat: -1.46, lng: -48.50 },
];

export default function PosicaoSolar() {
  const [cidadeSelecionada, setCidadeSelecionada] = useState(CIDADES_BR[0]);
  const [mesSelecionado, setMesSelecionado] = useState(0);
  const [latCustom, setLatCustom] = useState('');
  const [modoCustom, setModoCustom] = useState(false);

  const latitude = modoCustom ? (parseFloat(latCustom) || 0) : cidadeSelecionada.lat;

  const diaDoAno = DIAS_MES[mesSelecionado];
  const declinacao = calcularDeclinacaoSolar(diaDoAno);

  // Calculate sun path for selected day
  const trajetoriaSolar = useMemo(() => {
    const pontos = [];
    const latRad = (latitude * Math.PI) / 180;
    const declRad = (declinacao * Math.PI) / 180;

    for (let h = 4; h <= 20; h += 0.5) {
      const angHor = calcularAnguloHorario(h);
      const angHorRad = (angHor * Math.PI) / 180;
      const altitude = calcularAltitudeSolar(latRad, declRad, angHorRad);
      const azimute = calcularAzimuteolar(latRad, declRad, altitude, angHorRad);
      const altGraus = (altitude * 180) / Math.PI;
      const azGraus = (azimute * 180) / Math.PI;

      pontos.push({
        hora: h,
        altitude: altGraus,
        azimute: azGraus,
        visivel: altGraus > 0,
      });
    }
    return pontos;
  }, [latitude, declinacao]);

  const nascerPor = calcularNascerPor(latitude, declinacao);
  const anguloOtimo = calcularAnguloOtimoInclinacao(latitude);

  // Monthly sun hours
  const horasSolMensal = useMemo(() => {
    return DIAS_MES.map((dia) => {
      const dec = calcularDeclinacaoSolar(dia);
      const np = calcularNascerPor(latitude, dec);
      return np.horas;
    });
  }, [latitude]);

  // Max altitude for each month
  const altitudeMaxMensal = useMemo(() => {
    return DIAS_MES.map((dia) => {
      const dec = calcularDeclinacaoSolar(dia);
      const latRad = (latitude * Math.PI) / 180;
      const declRad = (dec * Math.PI) / 180;
      const alt = calcularAltitudeSolar(latRad, declRad, 0);
      return (alt * 180) / Math.PI;
    });
  }, [latitude]);

  const maxAltitude = Math.max(...trajetoriaSolar.filter(p => p.visivel).map(p => p.altitude), 1);

  const formatHora = (h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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
        <h1>Simulação de Posição Solar</h1>
        <p>Rastreamento da trajetória solar para otimização do ângulo dos painéis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Left: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sun path chart */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={18} color="var(--gold)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Trajetória Solar — {MESES[mesSelecionado]}</h3>
              </div>
              <span className="tag tag-gold">{cidadeSelecionada.nome}</span>
            </div>

            {/* Chart: Altitude vs Hour */}
            <div style={{ position: 'relative', height: '260px', padding: '0 0 28px 40px' }}>
              {/* Y-axis labels */}
              {[0, 30, 60, 90].map(val => (
                <div key={val} style={{
                  position: 'absolute',
                  left: 0,
                  bottom: `${28 + (val / 90) * 220}px`,
                  fontSize: '0.65rem',
                  color: 'var(--text-3)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {val}°
                </div>
              ))}

              {/* Grid lines */}
              {[0, 30, 60, 90].map(val => (
                <div key={val} style={{
                  position: 'absolute',
                  left: '40px',
                  right: 0,
                  bottom: `${28 + (val / 90) * 220}px`,
                  height: '1px',
                  background: 'var(--border)',
                }} />
              ))}

              {/* SVG path */}
              <svg
                viewBox={`0 0 ${trajetoriaSolar.length * 20} 220`}
                style={{ position: 'absolute', left: '40px', right: 0, bottom: '28px', top: 0, width: 'calc(100% - 40px)', height: '220px' }}
                preserveAspectRatio="none"
              >
                {/* Area fill */}
                <path
                  d={
                    trajetoriaSolar
                      .map((p, i) => {
                        const x = (i / (trajetoriaSolar.length - 1)) * 100;
                        const y = 100 - Math.max(0, (p.altitude / 90) * 100);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ') + ` L 100 100 L 0 100 Z`
                  }
                  fill="url(#sunGrad)"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Line */}
                <path
                  d={
                    trajetoriaSolar
                      .map((p, i) => {
                        const x = (i / (trajetoriaSolar.length - 1)) * 100;
                        const y = 100 - Math.max(0, (p.altitude / 90) * 100);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')
                  }
                  fill="none"
                  stroke="#D4A843"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
                <defs>
                  <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A843" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#D4A843" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
              </svg>

              {/* X-axis labels */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '40px',
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                {[4, 6, 8, 10, 12, 14, 16, 18, 20].map(h => (
                  <span key={h} className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>
                    {h}h
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Monthly hours chart */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Clock size={18} color="var(--green)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Horas de Sol por Mês</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px' }}>
              {horasSolMensal.map((horas, i) => {
                const maxH = Math.max(...horasSolMensal);
                const minH = Math.min(...horasSolMensal);
                const norm = maxH > minH ? (horas - minH) / (maxH - minH) : 0.5;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>
                      {formatNumber(horas, 1)}h
                    </span>
                    <div
                      onClick={() => setMesSelecionado(i)}
                      style={{
                        width: '100%',
                        height: `${40 + norm * 100}px`,
                        background: i === mesSelecionado ? 'var(--gold)' : 'var(--bg-elevated)',
                        borderRadius: '4px 4px 0 0',
                        border: `1px solid ${i === mesSelecionado ? 'var(--gold)' : 'var(--border-mid)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                    <span style={{
                      fontSize: '0.65rem',
                      color: i === mesSelecionado ? 'var(--gold)' : 'var(--text-3)',
                      fontWeight: i === mesSelecionado ? 700 : 400,
                    }}>
                      {MESES[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Monthly max altitude */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Altitude Máxima por Mês</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
              {altitudeMaxMensal.map((alt, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>
                    {formatNumber(alt, 0)}°
                  </span>
                  <div
                    onClick={() => setMesSelecionado(i)}
                    style={{
                      width: '100%',
                      height: `${(Math.max(0, alt) / 90) * 120}px`,
                      background: i === mesSelecionado
                        ? 'linear-gradient(to top, var(--green), var(--gold))'
                        : 'var(--bg-elevated)',
                      borderRadius: '4px 4px 0 0',
                      border: `1px solid ${i === mesSelecionado ? 'var(--green-border)' : 'var(--border-mid)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  />
                  <span style={{
                    fontSize: '0.65rem',
                    color: i === mesSelecionado ? 'var(--gold)' : 'var(--text-3)',
                    fontWeight: i === mesSelecionado ? 700 : 400,
                  }}>
                    {MESES[i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Controls + Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Location selector */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MapPin size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Localização</h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setModoCustom(false)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', fontSize: '0.78rem',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  border: `1px solid ${!modoCustom ? 'var(--gold-border)' : 'var(--border-mid)'}`,
                  background: !modoCustom ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                  color: !modoCustom ? 'var(--gold)' : 'var(--text-2)',
                }}
              >
                Cidades
              </button>
              <button
                onClick={() => setModoCustom(true)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', fontSize: '0.78rem',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  border: `1px solid ${modoCustom ? 'var(--gold-border)' : 'var(--border-mid)'}`,
                  background: modoCustom ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                  color: modoCustom ? 'var(--gold)' : 'var(--text-2)',
                }}
              >
                Coordenadas
              </button>
            </div>

            {!modoCustom ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                {CIDADES_BR.map(c => (
                  <button
                    key={c.nome}
                    onClick={() => setCidadeSelecionada(c)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${cidadeSelecionada.nome === c.nome ? 'var(--gold-border)' : 'transparent'}`,
                      background: cidadeSelecionada.nome === c.nome ? 'var(--gold-dim)' : 'transparent',
                      color: cidadeSelecionada.nome === c.nome ? 'var(--gold)' : 'var(--text-2)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontFamily: 'Outfit, sans-serif',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.nome}</span>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      {c.lat.toFixed(1)}°
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '6px', display: 'block' }}>
                  Latitude (negativa para Sul)
                </label>
                <input
                  type="number"
                  value={latCustom}
                  onChange={e => setLatCustom(e.target.value)}
                  placeholder="Ex: -23.55"
                  step="0.01"
                  style={inputStyle}
                />
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '6px' }}>
                  Latitude atual: {latitude.toFixed(2)}°
                </div>
              </div>
            )}
          </Card>

          {/* Month selector */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Calendar size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Mês</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {MESES.map((mes, i) => (
                <button
                  key={i}
                  onClick={() => setMesSelecionado(i)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--r-sm)',
                    border: `1px solid ${i === mesSelecionado ? 'var(--gold-border)' : 'var(--border-mid)'}`,
                    background: i === mesSelecionado ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                    color: i === mesSelecionado ? 'var(--gold)' : 'var(--text-2)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: i === mesSelecionado ? 700 : 400,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {mes}
                </button>
              ))}
            </div>
          </Card>

          {/* Day info */}
          <Card style={{ borderColor: 'var(--gold-border)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>
              Dados do Dia — {MESES[mesSelecionado]}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <Sunrise size={16} color="var(--gold)" style={{ marginBottom: '4px' }} />
                  <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {formatHora(nascerPor.nascer)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Nascer do Sol</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <Sunset size={16} color="var(--coral)" style={{ marginBottom: '4px' }} />
                  <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--coral)' }}>
                    {formatHora(nascerPor.por)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Pôr do Sol</div>
                </div>
              </div>

              {[
                { label: 'Horas de Sol', value: `${formatNumber(nascerPor.horas, 1)}h`, color: 'var(--green)' },
                { label: 'Altitude Máxima', value: `${formatNumber(altitudeMaxMensal[mesSelecionado], 1)}°`, color: 'var(--gold)' },
                { label: 'Declinação Solar', value: `${formatNumber(declinacao, 1)}°`, color: 'var(--blue)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{item.label}</span>
                  <span className="mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Optimal angle */}
          <Card style={{ borderColor: 'var(--green-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ArrowUp size={18} color="var(--green)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Ângulo Ótimo de Inclinação</h3>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--green)' }}>
                {formatNumber(anguloOtimo, 1)}°
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: '4px' }}>
                Inclinação recomendada para latitude {formatNumber(Math.abs(latitude), 1)}°{latitude < 0 ? 'S' : 'N'}
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--r-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-3)',
              lineHeight: 1.6,
              marginTop: '8px',
            }}>
              Orientação: Painéis voltados para o <strong style={{ color: 'var(--text-1)' }}>
                {latitude < 0 ? 'Norte' : 'Sul'}
              </strong> geográfico para máxima captação anual.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
