import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Filter, Search, MapPin, Satellite, Map as MapIcon, Navigation } from 'lucide-react';
import Card from '../components/Card';

// Fix default marker icon (Leaflet + webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom gold marker for solar regions
const solarIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'solar-marker',
});

// Searched location marker
const searchIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'search-marker',
});

// Brazilian regions with real coordinates
const regioes = [
  { nome: 'Norte', irradiacao: 5.5, cor: '#F0C96B', lat: -3.1190, lng: -60.0217, descricao: 'Alta irradiacao solar com potencial significativo para energia fotovoltaica.' },
  { nome: 'Nordeste', irradiacao: 5.8, cor: '#D4A843', lat: -12.9714, lng: -38.5124, descricao: 'Melhor regiao do Brasil para energia solar, com irradiacao consistente o ano todo.' },
  { nome: 'Centro-Oeste', irradiacao: 5.4, cor: '#F0C96B', lat: -15.7801, lng: -47.9292, descricao: 'Excelente potencial solar com grandes areas planas disponiveis.' },
  { nome: 'Sudeste', irradiacao: 4.8, cor: '#1FD8A4', lat: -23.5505, lng: -46.6333, descricao: 'Bom potencial solar, maior mercado consumidor do pais.' },
  { nome: 'Sul', irradiacao: 4.3, cor: '#4A9EFF', lat: -25.4284, lng: -49.2733, descricao: 'Potencial moderado com variacao sazonal significativa.' },
];

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
};

const BRAZIL_CENTER = [-14.235, -51.9253];
const BRAZIL_ZOOM = 4;

// Component to handle map movements from outside
function MapController({ center, zoom, flyTo }) {
  const map = useMap();

  useEffect(() => {
    if (flyTo) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [map, center, zoom, flyTo]);

  return null;
}

export default function MapaSolar() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(null);
  const [mapMode, setMapMode] = useState('street');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyCounter, setFlyCounter] = useState(0);
  const mapRef = useRef(null);

  // Geocode address using Nominatim (free, no API key)
  const buscarEndereco = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');

    try {
      const response = await fetch(
        `/api/mapa/geocode?endereco=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        setSearchError(data.error || 'Endereco nao encontrado.');
        setSearchResult(null);
        return;
      }

      const result = {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        display: data.display_name,
      };

      setSearchResult(result);
      setFlyTarget([result.lat, result.lng]);
      setFlyCounter(c => c + 1);
    } catch (err) {
      setSearchError('Erro ao buscar endereco. Tente novamente.');
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') buscarEndereco();
  };

  const voltarBrasil = () => {
    setFlyTarget(BRAZIL_CENTER);
    setFlyCounter(c => c + 1);
    setSearchResult(null);
    setRegiaoSelecionada(null);
  };

  const irParaRegiao = (regiao) => {
    setRegiaoSelecionada(regiao);
    setFlyTarget([regiao.lat, regiao.lng]);
    setFlyCounter(c => c + 1);
  };

  const currentTile = TILE_LAYERS[mapMode];

  return (
    <div>
      <div className="page-header">
        <h1>Mapa Solar</h1>
        <p>Visualize a irradiacao solar em todo o territorio brasileiro</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Map area */}
        <Card style={{ position: 'relative', minHeight: '600px', overflow: 'hidden', padding: 0 }}>
          {/* Search bar overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '60px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-sm)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar endereco... (ex: Av Paulista, Sao Paulo)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  color: 'var(--text-1)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={buscarEndereco}
                disabled={searching}
                style={{
                  background: 'var(--gold)',
                  border: 'none',
                  padding: '0 14px',
                  cursor: searching ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--t)',
                }}
              >
                <Search size={16} color="#04090F" />
              </button>
            </div>
          </div>

          {/* Map mode toggle */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <button
              onClick={() => setMapMode('street')}
              title="Mapa"
              style={{
                width: 38,
                height: 38,
                background: mapMode === 'street' ? 'var(--gold)' : 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: mapMode === 'street' ? '#04090F' : 'var(--text-2)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              <MapIcon size={16} />
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              title="Satelite"
              style={{
                width: 38,
                height: 38,
                background: mapMode === 'satellite' ? 'var(--gold)' : 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: mapMode === 'satellite' ? '#04090F' : 'var(--text-2)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              <Satellite size={16} />
            </button>
            <button
              onClick={voltarBrasil}
              title="Centralizar no Brasil"
              style={{
                width: 38,
                height: 38,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-2)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                marginTop: '8px',
              }}
            >
              <Navigation size={16} />
            </button>
          </div>

          {/* Search error */}
          {searchError && (
            <div style={{
              position: 'absolute',
              top: '58px',
              left: '12px',
              zIndex: 1000,
              background: 'var(--coral-dim)',
              border: '1px solid var(--coral)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 14px',
              fontSize: '0.8rem',
              color: 'var(--coral)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              {searchError}
            </div>
          )}

          {/* Search result info */}
          {searchResult && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              zIndex: 1000,
              background: 'var(--bg-card)',
              border: '1px solid var(--gold-border)',
              borderRadius: 'var(--r-sm)',
              padding: '12px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <MapPin size={14} color="var(--gold)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)' }}>
                  Local encontrado
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                {searchResult.display}
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '4px' }}>
                {searchResult.lat.toFixed(6)}, {searchResult.lng.toFixed(6)}
              </div>
            </div>
          )}

          {/* Leaflet Map */}
          <MapContainer
            center={BRAZIL_CENTER}
            zoom={BRAZIL_ZOOM}
            style={{ width: '100%', height: '600px', borderRadius: 'var(--r)' }}
            ref={mapRef}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
          >
            <TileLayer
              key={mapMode}
              url={currentTile.url}
              attribution={currentTile.attribution}
              maxZoom={19}
            />

            <MapController
              center={flyTarget || BRAZIL_CENTER}
              zoom={flyTarget ? 14 : BRAZIL_ZOOM}
              flyTo={flyCounter}
            />

            {/* Region markers */}
            {regioes.map((r, i) => (
              <Marker
                key={i}
                position={[r.lat, r.lng]}
                icon={solarIcon}
                eventHandlers={{
                  click: () => setRegiaoSelecionada(r),
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '180px' }}>
                    <strong style={{ fontSize: '14px' }}>{r.nome}</strong>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                      {r.descricao}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: r.cor,
                      marginTop: '8px',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {r.irradiacao} kWh/m²/dia
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Search result marker */}
            {searchResult && (
              <Marker
                position={[searchResult.lat, searchResult.lng]}
                icon={searchIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '200px' }}>
                    <strong style={{ fontSize: '14px' }}>{searchResult.display}</strong>
                    <div style={{
                      fontSize: '11px',
                      marginTop: '6px',
                      color: '#888',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {searchResult.lat.toFixed(6)}, {searchResult.lng.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Card>

        {/* Sidebar panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Layers */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Camadas do Mapa</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'street', label: 'Mapa de Ruas', icon: MapIcon },
                { id: 'satellite', label: 'Modo Satelite', icon: Satellite },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMapMode(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: mapMode === item.id ? 'var(--gold-dim)' : 'transparent',
                    border: mapMode === item.id ? '1px solid var(--gold-border)' : '1px solid transparent',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: mapMode === item.id ? 'var(--gold)' : 'var(--text-2)',
                    transition: 'all var(--t)',
                    textAlign: 'left',
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Regions quick access */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MapPin size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Regioes</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {regioes.map((r, i) => (
                <button
                  key={i}
                  onClick={() => irParaRegiao(r)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: regiaoSelecionada?.nome === r.nome ? 'var(--bg-elevated)' : 'transparent',
                    border: regiaoSelecionada?.nome === r.nome ? '1px solid var(--border-mid)' : '1px solid transparent',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--t)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>{r.nome}</span>
                  <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: r.cor }}>
                    {r.irradiacao} kWh
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Region info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Filter size={18} color="var(--gold)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {regiaoSelecionada ? regiaoSelecionada.nome : 'Selecione uma regiao'}
              </h3>
            </div>

            {regiaoSelecionada ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Irradiacao Media
                  </div>
                  <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: regiaoSelecionada.cor }}>
                    {regiaoSelecionada.irradiacao} kWh/m²/dia
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Coordenadas
                  </div>
                  <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>
                    {regiaoSelecionada.lat.toFixed(4)}, {regiaoSelecionada.lng.toFixed(4)}
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {regiaoSelecionada.descricao}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Clique em um marcador no mapa ou selecione uma regiao acima.
              </p>
            )}
          </Card>

          {/* Legend */}
          <Card>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Legenda</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { cor: '#D4A843', label: 'Alta (>5.5 kWh/m²)' },
                { cor: '#F0C96B', label: 'Media-Alta (5.0-5.5)' },
                { cor: '#1FD8A4', label: 'Media (4.5-5.0)' },
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
