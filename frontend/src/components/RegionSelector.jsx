import React, { useEffect, useState } from 'react';
import { Globe, ChevronDown, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { useRegional } from '../context/RegionalContext';

const FLAG_EMOJIS = {
  BR: '🇧🇷', AR: '🇦🇷', CL: '🇨🇱', CO: '🇨🇴', PE: '🇵🇪', UY: '🇺🇾',
  US: '🇺🇸', MX: '🇲🇽', CA: '🇨🇦',
  PT: '🇵🇹', ES: '🇪🇸', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', GB: '🇬🇧',
  ZA: '🇿🇦', NG: '🇳🇬', EG: '🇪🇬', KE: '🇰🇪',
  AU: '🇦🇺', JP: '🇯🇵', IN: '🇮🇳', AE: '🇦🇪',
};

export default function RegionSelector({ showDetails = false }) {
  const {
    country, currency, pricing,
    countries, regions, averageCosts,
    loading,
    fetchCountries, fetchRegions, fetchAverageCosts,
    selectCountry,
  } = useRegional();

  const [isOpen, setIsOpen] = useState(false);
  const [showCostPanel, setShowCostPanel] = useState(false);

  useEffect(() => {
    if (countries.length === 0) {
      fetchCountries();
      fetchRegions();
    }
  }, [countries.length, fetchCountries, fetchRegions]);

  const handleSelect = (code) => {
    selectCountry(code);
    setIsOpen(false);
  };

  const handleToggleCosts = () => {
    if (averageCosts.length === 0) {
      fetchAverageCosts();
    }
    setShowCostPanel(!showCostPanel);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Botão seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          color: '#f1f5f9',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '18px' }}>{FLAG_EMOJIS[country.code] || '🌍'}</span>
        <span>{country.name_local || country.code}</span>
        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
          {currency.symbol} {currency.code}
        </span>
        <ChevronDown size={14} style={{
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }} />
      </button>

      {/* Dropdown de países */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          width: '340px',
          maxHeight: '420px',
          overflowY: 'auto',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 1000,
          padding: '8px',
        }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              Carregando...
            </div>
          ) : (
            regions.map((region) => (
              <div key={region.id} style={{ marginBottom: '8px' }}>
                <div style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                }}>
                  <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  {region.name}
                </div>
                {region.countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: c.code === country.code ? '#0f172a' : 'transparent',
                      border: c.code === country.code ? '1px solid #f59e0b' : '1px solid transparent',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{FLAG_EMOJIS[c.code] || '🌍'}</span>
                      <span>{c.name_local || c.name}</span>
                    </span>
                    <span style={{
                      color: '#f59e0b',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}>
                      {c.currency_symbol} {c.currency_code}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Painel de detalhes (opcional) */}
      {showDetails && (
        <div style={{
          marginTop: '12px',
          padding: '16px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '13px',
          }}>
            <div style={{ color: '#94a3b8' }}>
              <DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Custo/kWp
              <div style={{ color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                {currency.symbol} {pricing.cost_kwp.toLocaleString()}
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Tarifa Energia
              <div style={{ color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                {currency.symbol} {pricing.energy_tariff}/kWh
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Irradiação Média
              <div style={{ color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                {pricing.irradiation_avg} kWh/m²/dia
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              Impostos
              <div style={{ color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                {pricing.tax_percent}%
              </div>
            </div>
          </div>

          {/* Botão custo médio por região */}
          <button
            onClick={handleToggleCosts}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '8px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f59e0b',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {showCostPanel ? 'Ocultar' : 'Ver'} Custo Médio por Região
          </button>

          {showCostPanel && averageCosts.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {averageCosts.map((region) => (
                <div key={region.region} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid #1e293b',
                  fontSize: '12px',
                }}>
                  <span style={{ color: '#94a3b8' }}>{region.region_name}</span>
                  <span style={{ color: '#e2e8f0' }}>
                    {region.country_count} países | Multiplicador: {region.avg_cost_multiplier}x | Irrad: {region.avg_irradiation} kWh/m²
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
